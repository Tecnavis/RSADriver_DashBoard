import React, { useEffect, useState } from 'react';
import 'tippy.js/dist/tippy.css';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { collection, getFirestore, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';

const ClosedBooking = () => {
const phone = localStorage.getItem('phone');

console.log("ph",phone)
    const dispatch = useDispatch();
    const [recordsData, setRecordsData] = useState([]);
    const [drivers, setDrivers] = useState({});
    const db = getFirestore();

    useEffect(() => {
        dispatch(setPageTitle('Status'));

        const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
            const updatedBookingsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRecordsData(updatedBookingsData);
        });

        return () => unsubscribe();
    }, [db, dispatch]);

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

    return (
        <div className="grid xl:grid-cols-1 gap-6 grid-cols-1">
            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">All Bookings</h5>
                </div>
                <div className="table-responsive mb-5">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                
                                <th>Customer Name</th>
                                <th>Customer Contact Number</th>
                                <th>Pickup Location</th>
                                <th>DropOff Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordsData.map((record) => {
                                const driverPhone = drivers[record.selectedDriver]?.phone;
                                const driverPersonalPhone = drivers[record.selectedDriver]?.personalphone;
                                if (driverPhone === phone || driverPersonalPhone === phone) {
                                    return (
                                        <tr key={record.id}>
                                            <td>{record.customerName}</td>
                                            <td>{record.phoneNumber} / {record.mobileNumber}</td>
                                            <td>{record.pickupLocation.name}</td>
                                            <td>{record.dropoffLocation.name}</td>
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
                                            }}>
                                                {record.status}
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
