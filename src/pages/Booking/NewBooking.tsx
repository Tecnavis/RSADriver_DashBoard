
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  getFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';
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
  const [driverDetails, setDriverDetails] = useState(null);
  const [driverDetailsMap, setDriverDetailsMap] = useState({});

  const [selectedBooking, setSelectedBooking] = useState<RecordData | null>(null);

  const db = getFirestore();
  const navigate = useNavigate();
  const fetchDriverDetails = async (driverId, serviceType) => {
    try {
      const driverDoc = await getDoc(doc(db, 'driver', driverId));
      if (driverDoc.exists()) {
        console.log("Driver details:", driverDoc.data());
        const driverData = driverDoc.data();
  
        // Check if the driver's selected services include the booking's service type
        if (driverData.selectedServices.includes(serviceType)) {
          // Fetch the corresponding salary details
          const salaryDetails = {
            basicSalary: driverData.basicSalaries[serviceType],
            salaryPerKM: driverData.salaryPerKm[serviceType],
            basicSalaryKM: driverData.basicSalaryKm[serviceType]
          };
  
          return {
            ...driverData,
            salaryDetails
          };
        } else {
          console.log("Service type not supported by the driver");
          return { ...driverData, salaryDetails: null };
        }
      } else {
        console.log("No such driver found!");
        return null;
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      return null;
    }
  };
 
  
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


const handleRejectClick = async (id: string) => {
  try {
    await updateDoc(doc(db, 'bookings', id), {
      status: 'Rejected'
    });
    // Optionally refresh the bookings list or show a notification
    alert("Booking rejected.");
    setRecordsData(prev => prev.filter(booking => booking.id !== id)); // remove from UI
  } catch (error) {
    console.error('Error rejecting booking: ', error);
  }
};
const calculateDriverSalary = (basicSalary, basicSalaryKM, distance, salaryPerKM) => {
  const numericBasicSalary = parseFloat(basicSalary);
  const numericBasicSalaryKM = parseFloat(basicSalaryKM);
  const numericDistance = parseFloat(distance.replace('km', '').trim()); // Assuming distance is a string like '8.0 km'
  const numericSalaryPerKM = parseFloat(salaryPerKM);

  if (isNaN(numericBasicSalary) || isNaN(numericBasicSalaryKM) || isNaN(numericDistance) || isNaN(numericSalaryPerKM)) {
    console.error('Invalid numeric values for salary calculation');
    return 0;
  }

  const excessKm = Math.max(0, numericDistance - numericBasicSalaryKM);
  return numericBasicSalary + excessKm * numericSalaryPerKM;
};
const handleDriverDetails = async (selectedDriverId, serviceType, distance, bookingId) => {
  const details = await fetchDriverDetails(selectedDriverId, serviceType);
  if (details && details.salaryDetails) {
    const totalDriverSalary = calculateDriverSalary(
      details.salaryDetails.basicSalary,
      details.salaryDetails.basicSalaryKM,
      distance,
      details.salaryDetails.salaryPerKM
    );
    // Set the driver details for the specific booking ID
    setDriverDetailsMap(prevState => ({
      ...prevState,
      [bookingId]: {
        ...details,
        totalDriverSalary
      }
    }));
  } else {
    setDriverDetailsMap(prevState => ({
      ...prevState,
      [bookingId]: details
    }));
  }
};

return (
  <div>
      <div className="panel mt-6">
          <h5 className="font-semibold text-lg dark:text-white-light mb-5">New Bookings</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {recordsData.map((booking, index) => (
            <div key={booking.id} style={{
    border: '1px solid #e2e8f0',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    transition: 'transform 0.3s ease-in-out'
}}
onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
>
<h2 style={{
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#333'
}}>
    {booking.customerName}
</h2>
<p style={{ margin: '5px 0', color: '#555' }}>Phone Number: {booking.phoneNumber}</p>


                  <p>Pickup Location: {booking.pickupLocation.name}</p>
                  <p>Dropoff Location: {booking.dropoffLocation.name}</p>
                  <p>Distance from pickup to dropoff: {booking.distance}</p>
                  <p>Service Type: {booking.serviceType}</p>
                  <p style={{
    color: '#d32f2f', // Red color for attention
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '10px'
}}>
    Total Salary: {booking.totalSalary}
</p>



<button
  className="btn btn-info"
  style={{ marginTop: '10px' }}
  onClick={() => handleDriverDetails(booking.selectedDriver, booking.serviceType, booking.distance, booking.id)}>
  View Driver Details
</button>
{driverDetailsMap[booking.id] && (
  <div>
    {driverDetailsMap[booking.id].salaryDetails && (
      <>
        <p className='mt-2'>Basic Salary: {driverDetailsMap[booking.id].salaryDetails.basicSalary}</p>
        <p>Salary per KM: {driverDetailsMap[booking.id].salaryDetails.salaryPerKM}</p>
        <p>Basic Salary KM: {driverDetailsMap[booking.id].salaryDetails.basicSalaryKM}</p>
        <p style={{color: '#d32f2f', fontSize: '18px', fontWeight: 'bold', marginTop: '10px'}}>
          Total Salary: {driverDetailsMap[booking.id].totalDriverSalary.toFixed(2)}
        </p>
      </>
    )}
  </div>
)}

                  <div className="mt-4 flex justify-end">
                  <button style={{
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.3s ease'
}}
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#388e3c'}
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
onClick={() => handleOkClick(booking)}
>
    OK
</button>
<button style={{
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
}}
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
onClick={() => handleRejectClick(booking.id)}
>
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
