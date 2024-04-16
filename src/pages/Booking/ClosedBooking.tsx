
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';

const ClosedBooking = () => {
    const [closedBookings, setClosedBookings] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const fetchClosedBookings = async () => {
            const q = query(collection(db, "bookings"), where("status", "==", "Order Completed"));
            const querySnapshot = await getDocs(q);
            const bookings = [];
            querySnapshot.forEach((doc) => {
                bookings.push({ id: doc.id, ...doc.data() });
            });
            setClosedBookings(bookings);
        };

        fetchClosedBookings();
    }, []);

    return (
        <div className="grid xl:grid-cols-1 gap-6 grid-cols-1">
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Closed Bookings</h5>
                </div>
                <div className="table-responsive mb-5">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Service Type</th>
                                <th>Customer Name</th>
                                <th>Total Salary</th>
                                <th>Status</th>
                                {/* Add additional headers as necessary */}
                            </tr>
                        </thead>
                        <tbody>
                            {closedBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.id}</td>
                                     <td>{booking.serviceType}</td>
                                    <td>{booking.customerName}</td>
                                    <td>{booking.totalSalary}</td>
                                    <td style={{
                                        color: 'white', 
                                        backgroundColor: 'RGB(40, 167, 69)', 
                                        borderRadius: '15px',
                                        fontWeight: '900',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        animation: 'fadeIn 2s ease-in-out',
                                        lineHeight: '1.5',
                                        letterSpacing: '1.5px'
                                    }}>{booking.status}</td>
                                    {/* Display other booking data as needed */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClosedBooking;
