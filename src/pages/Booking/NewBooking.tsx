
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDoc, getFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';

type RecordData = {
  index: number;
  customerName: string;
  pickupLocation: { placename: string; lat: number; lng: number };
  phoneNumber: string;
  totalSalary: string;
  lat: number; 
  lng: number
  id: string;
  status: string; 

};

const NewBooking = () => {
  const [recordsData, setRecordsData] = useState<RecordData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [kilometer, setKilometer] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RecordData | null>(null);
  const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});

  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        const dataWithIndex = querySnapshot.docs.map((doc, index) => ({
          index: index + 2000,
          ...doc.data(),
          id: doc.id,
        }));
        setRecordsData(dataWithIndex);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [db]);
  

  const handleOkClick = async (booking) => {
    const { customerName, pickupLocation, phoneNumber, totalSalary, id } = booking;

    try {
        // First update to "Order Received"
        await updateDoc(doc(db, 'bookings', id), {
            status: 'Order Received'
        });

        // Set the selected booking for use in other parts of the app
        setSelectedBooking(booking);

        // Update the status to "Contacted Customer"
        await updateDoc(doc(db, 'bookings', id), {
            status: 'Contacted Customer'
        });

        // Initiating a phone call to the customer
        window.open(`tel:${phoneNumber}`);

        // Navigate to the pickup page with the necessary state
        navigate(`/pickup/${id}`, {
            state: {
                pickupLocation: {
                    placename: pickupLocation.name || null,
                    lat: pickupLocation.lat,
                    lng: pickupLocation.lng,
                },
                customerName,
                id,
                totalSalary,
            },
        });
    } catch (error) {
        console.error('Error handling booking operation: ', error);
    }
};


  const handleRejectClick = (id: string) => {
  };

  

 


  return (
    <div>
      <div className="panel mt-6">
        <h5 className="font-semibold text-lg dark:text-white-light mb-5">New Bookings</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {recordsData.map((booking, index) => (
    <div  key={booking.id} className="border border-gray-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{booking.customerName}</h2>
        <p>Phone Number: {booking.phoneNumber}</p>
  <p>Pickup Location: {booking.pickupLocation.name}</p>
 
  <p>Total Salary: {booking.totalSalary}</p>

              <div className="mt-4 flex justify-end">
                <button className="btn btn-success mr-2" onClick={() => handleOkClick(booking)}>
                  OK
                </button>
                <button className="btn btn-danger" onClick={() => handleRejectClick(booking.id)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      
      </div>
    </div>
  );
};

export default NewBooking;
