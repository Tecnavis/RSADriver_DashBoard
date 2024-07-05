import React, { useEffect, useState } from 'react';
import 'tippy.js/dist/tippy.css';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { collection, getFirestore, onSnapshot, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';

const ClosedBooking = () => {
    const driverId = localStorage.getItem('driverId');
    const phone = localStorage.getItem('phone');
    const password = localStorage.getItem('password');

    const dispatch = useDispatch();
    const [recordsData, setRecordsData] = useState([]);
    const [drivers, setDrivers] = useState({});
    const db = getFirestore();

    useEffect(() => {
        const fetchDriverData = async () => {
            const driverData = {};
            for (const record of recordsData) {
                const driverId = record.selectedDriver;
                if (driverId && !driverData[driverId]) {
                    const driverDoc = await getDoc(doc(db, 'driver', driverId));
                    if (driverDoc.exists()) {
                        driverData[driverId] = driverDoc.data();
                    }
                }
            }
            setDrivers(driverData);
        };
    
        fetchDriverData();
    }, [db, recordsData]);
    
    useEffect(() => {
        dispatch(setPageTitle('Status'));
    
        const unsubscribe = onSnapshot(
            query(collection(db, 'bookings'), orderBy('dateTime', 'desc')),
            (snapshot) => {
                const updatedBookingsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRecordsData(updatedBookingsData);
            }
        );
    
        return () => unsubscribe();
    }, [db, dispatch]);
    
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Order Completed':
                return { backgroundColor: 'RGB(40, 167, 69)', color: 'white' };
            case 'booking added':
                return { backgroundColor: 'orange', color: 'white' };
            case 'Rejected':
                return { backgroundColor: 'red', color: 'white' };
            default:
                return { backgroundColor: 'yellow', color: 'white' }; // Default to yellow for other statuses
        }
    };

    return (
        <div className="grid xl:grid-cols-1 gap-6 grid-cols-1 p-6 bg-gray-100 min-h-screen">
            <div className="panel bg-white shadow-lg rounded-lg p-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">All Bookings</h5>
                </div>
                <div className="table-responsive mb-5">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Date & Time</th>
                                <th className="py-3 px-6 text-left">Customer Name</th>
                                <th className="py-3 px-6 text-left">Customer Contact Number</th>
                                <th className="py-3 px-6 text-left">Pickup Location</th>
                                <th className="py-3 px-6 text-left">DropOff Location</th>
                                <th className="py-3 px-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {recordsData.map((record) => {
                                const driverPhone = drivers[record.selectedDriver]?.phone;
                                const driverPersonalPhone = drivers[record.selectedDriver]?.personalphone;
                                if (driverPhone === phone || driverPersonalPhone === phone) {
                                    return (
                                        <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="py-3 px-6 text-left whitespace-nowrap">{record.dateTime}</td>
                                            <td className="py-3 px-6 text-left">{record.customerName}</td>
                                            <td className="py-3 px-6 text-left">{record.phoneNumber} / {record.mobileNumber}</td>
                                            <td className="py-3 px-6 text-left">{record.pickupLocation?.name || '-'}</td>
                                            <td className="py-3 px-6 text-left">{record.dropoffLocation?.name || '-'}</td>
                                            <td className="py-3 px-6 text-center">
                                                <span
                                                    className="py-1 px-3 rounded-full text-xs font-bold"
                                                    style={{
                                                        ...getStatusStyle(record.status),
                                                        borderRadius: '15px',
                                                        fontWeight: '900',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        animation: 'fadeIn 2s ease-in-out',
                                                        lineHeight: '1.5',
                                                        letterSpacing: '1.5px'
                                                    }}
                                                >
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClosedBooking;
