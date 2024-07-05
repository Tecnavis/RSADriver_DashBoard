import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

const CashCollectionReport = () => {
    const id = localStorage.getItem('driverId');
    const [bookings, setBookings] = useState([]);
    const [driver, setDriver] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const driverRef = doc(db, 'driver', id);
                const driverSnap = await getDoc(driverRef);
                if (driverSnap.exists()) {
                    const driverData = driverSnap.data();
                    setDriver(driverData);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching driver:', error);
            }
        };

        fetchDriver();
    }, [db, id]);

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, 'bookings'), where('selectedDriver', '==', id)), (snapshot) => {
            const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(bookingsData);
        });

        return () => unsubscribe();
    }, [db, id]);

    const handleAmountReceivedChange = async (bookingId, receivedAmount) => {
        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, {
                receivedAmount: parseFloat(receivedAmount),
                balance: calculateBalance(bookings.find(booking => booking.id === bookingId).amount, receivedAmount)
            });

            // No need to update bookings state here because onSnapshot will automatically update it
            // Recalculate and update total balance
            updateTotalBalance();
        } catch (error) {
            console.error('Error updating received amount:', error);
        }
    };

    const calculateBalance = (amount, receivedAmount) => {
        const balance = (parseFloat(amount) - parseFloat(receivedAmount)).toFixed(2);
        console.log(`Balance: ${balance}`);
        return balance;
    };

    const calculateNetTotalAmountInHand = () => {
        // Check if driver and bookings are defined before calculating
        if (!driver || bookings.length === 0) {
            console.log('Driver data or bookings not yet available');
            return 'Loading...'; // or some default value
        }

        // Calculate total balance for all bookings
        const totalBalance = bookings.reduce((acc, booking) => {
            if (booking.amount === undefined || isNaN(booking.amount)) {
                console.warn(`Skipping booking with invalid amount: Booking ID: ${booking.id}, Amount: ${booking.amount}`);
                return acc;
            }

            const balance = calculateBalance(booking.amount, booking.receivedAmount || 0);
            console.log(`Booking ID: ${booking.id}, Amount: ${booking.amount}, Received Amount: ${booking.receivedAmount || 0}, Balance: ${balance}`);
            return acc + parseFloat(balance);
        }, 0);

        console.log('Total Balance:', totalBalance);

        // Calculate Net Total Amount (In Hand)
        const netTotalAmountInHand = parseFloat(driver.advancePayment || 0) + totalBalance;
        return netTotalAmountInHand.toFixed(2);
    };

    const updateTotalBalance = async () => {
        try {
            const totalBalance = bookings.reduce((acc, booking) => {
                const balance = parseFloat(booking.amount) - parseFloat(booking.receivedAmount || 0);
                return acc + balance;
            }, 0);

            const driverRef = doc(db, 'driver', id);
            await updateDoc(driverRef, { totalBalance: totalBalance });

            console.log('Total Balance updated successfully:', totalBalance);
        } catch (error) {
            console.error('Error updating total balance:', error);
        }
    };

    return (
        <div className="container mx-auto my-10 p-5 bg-gray-50 shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold mb-5 text-center text-gray-800">Cash Collection Report</h1>
            {driver ? (
                <p className="text-lg font-semibold text-gray-700 mb-5">
                    Advance Payment: {driver.advancePayment}
                </p>
            ) : (
                <p className="text-lg font-semibold text-gray-700 mb-5">Loading driver data...</p>
            )}
            <div className="mb-5 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg shadow-md">
                <p className="text-2xl font-bold">
                    Net Total Amount (In Hand): <span className="text-blue-900">{calculateNetTotalAmountInHand()}</span>
                </p>
            </div>
            {bookings.length === 0 ? (
                <p className="text-lg text-gray-700">No bookings found for this driver.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Date Time</th>
                                <th className="py-3 px-6 text-left">Booking ID</th>
                                <th className="py-3 px-6 text-left">Amount (from customer)</th>
                                <th className="py-3 px-6 text-left">Amount Received from Driver</th>
                                <th className="py-3 px-6 text-left">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {bookings.map(booking => (
                                <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{booking.dateTime}</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{booking.fileNumber}</td>
                                    <td className="py-3 px-6 text-left">
                                        {booking.amount}
                                    </td>
                                    <td className={`py-3 px-6 text-left ${booking.receivedAmount ? '' : 'bg-yellow-100 animate-pulse'}`}>
                                        {booking.receivedAmount || 'Not provided'}
                                    </td>
                                    <td className="py-3 px-6 text-left">
                                        {calculateBalance(booking.amount, booking.receivedAmount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CashCollectionReport;
