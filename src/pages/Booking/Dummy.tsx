import React, { useEffect, useRef, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import IconPhone from '../../components/Icon/IconPhone';
import { useUserContext } from '../../context/UserContext';
type RecordData = {
    index: number;
    customerName: string;
    pickupLocation: { name: string; lat: number; lng: number };
    dropoffLocation: { name: string; lat: number; lng: number };
    phoneNumber: string;
    totalSalary: string;
    updatedTotalSalary: string;
    lat: number;
    lng: number;
    id: string;
    status: string;
    dateTime: string;
    totalDistance: number;
    serviceType: string;
    selectedDriver: string;
};
const Dummy = () => {
    const driverId = localStorage.getItem('driverId');
    // const phone = localStorage.getItem('phone');
    const password = localStorage.getItem('password'); 
    const {phone,isAuthenticated} = useUserContext();
    console.log(phone + '-------------------------')
   console.log(isAuthenticated)
    const location = useLocation();
    const { currentLocation } = location.state || {};
    console.log("currentLocation",location)

    const [recordsData, setRecordsData] = useState<RecordData[]>([]);
    const db = getFirestore();
    const navigate = useNavigate();
    const completedBookings = recordsData.filter((booking) => booking.status === 'Order Completed');
    const nonCompletedBookings = recordsData.filter((booking) => booking.status !== 'Order Completed');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fetchDriversWithPassword = async (password: string) => {
        try {
            const driversRef = collection(db, 'driver');
            const q = query(driversRef, where('password', '==', password));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.id);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            return [];
        }
    };

    const fetchBookingsForDrivers = async (driverIds: string[]) => {
        try {
            const bookingsRef = collection(db, 'bookings');
            const q = query(bookingsRef, where('selectedDriver', 'in', driverIds));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc, index) => ({
                index: index + 1,
                ...doc.data(),
                id: doc.id
            }));
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    };

    const fetchDriverDetails = async (driverId: string) => {
        try {
            const driverRef = doc(db, 'driver', driverId);
            const driverSnapshot = await getDoc(driverRef);
            if (driverSnapshot.exists()) {
                return driverSnapshot.data();
            } else {
                console.error('No such driver!');
                return null;
            }
        } catch (error) {
            console.error('Error fetching driver details:', error);
            return null;
        }
    };

    const updateBookingWithDriver = async (bookingId: string, driverDetails: any) => {
        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, {
                selectedDriver: driverId,
                ...driverDetails
            });
            console.log('Booking updated with driver details.');
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    const handleOkClick = async (booking) => {
        const driverId = localStorage.getItem('driverId');
        const password = localStorage.getItem('password'); 
    
        if (!driverId || !password) {
            console.error('Driver ID or password not found in localStorage');
            return;
        }
    
        // Fetch the driver data from Firestore based on the driverId
        const driverRef = doc(db, 'driver', driverId);
        const driverSnap = await getDoc(driverRef);
    
        if (driverSnap.exists()) {
            const driverData = driverSnap.data();
    
            // Update booking or driver data as needed
            try {
                // Example of updating the booking with the driver's details
                await updateDoc(driverRef, {
                    // Update the fields you need
                    password: password, // if you want to update the password
                    selectedDriver: driverId,
                    totalSalary: booking.totalSalary,
                    // Add any other fields you want to update
                });
    
                console.log('Driver data updated successfully');
                // Optionally, navigate or update the UI as needed
            } catch (error) {
                console.error('Error updating driver data:', error);
            }
        } else {
            console.error('Driver not found in Firestore');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const driverIds = await fetchDriversWithPassword('dummy');
                if (driverIds.length > 0) {
                    const bookings = await fetchBookingsForDrivers(driverIds);
                    setRecordsData(bookings);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [db]);

    return (
       
          <div className="panel mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 ">
         {nonCompletedBookings.map((booking) => (
  <div
    key={booking.id}
    style={{
      border: '1px solid #e0e0e0',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e2e8f0 100%)',
      transition: 'transform 0.3s ease-in-out',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p
        style={{
          fontSize: '22px',
          fontWeight: '700',
          marginBottom: '10px',
          color: '#2c3e50',
          fontFamily: 'Merriweather, serif',
        }}
      >
        {booking.customerName}
      </p>
      <p
        style={{
          margin: '5px 0',
          color: '#7f8c8d',
          marginLeft: 'auto',
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: '#ecf0f1',
          border: '1px solid #bdc3c7',
        }}
      >
        {booking.dateTime}
      </p>
    </div>
    <p style={{ margin: '5px 0', color: '#555', display: 'inline-flex', alignItems: 'center' }}
onClick={() => handlePhoneClick(booking.id)}
>      <IconPhone style={{ marginRight: '8px' }} />{' '}
      <a
        href={`tel:${booking.phoneNumber}`}
        style={{
          color: '#2980b9',
          fontWeight: 'bold',
          textDecoration: 'underline',
          fontSize: '18px',
          fontFamily: 'Georgia, serif',
          transition: 'color 0.3s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#1a5276')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#2980b9')}
      >
        {booking.phoneNumber}
      </a>
    </p>  
    <p style={{ margin: '5px 0', color: '#7f8c8d !important' }}>
 Vehicle Type: {booking.vehicleType} Wheeler
</p>



       <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
              Pickup Location: {booking.pickupLocation?.name || 'N/A'}
            </p>
            <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
              Dropoff Location: {booking.dropoffLocation?.name || 'N/A'}
            </p>
    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Total Distance: {booking.distance}</p>
    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Service Type: {booking.serviceType}</p>
    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Total Driver Salary: {booking.totalDriverSalary}</p>

    <p
      style={{
        color: '#c0392b',
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: '10px',
      }}
    >
      Payable Amount: {booking.updatedTotalSalary}
    </p>


    <div className="mt-4 flex justify-end">
      <button
        style={{
          backgroundColor: booking.status === 'Order Completed' ? '#bdc3c7' : '#27ae60',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#95a5a6' : '#2ecc71')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#bdc3c7' : '#27ae60')
        }
        onClick={() => handleOkClick(booking)}
        disabled={booking.status === 'Order Completed'}
      >
        Accept
      </button>
      <button
        style={{
          backgroundColor: booking.status === 'Order Completed' ? '#bdc3c7' : '#e74c3c',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#95a5a6' : '#c0392b')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#bdc3c7' : '#e74c3c')
        }
        onClick={() => handleRejectClick(booking.id)}
        disabled={booking.status === 'Order Completed'}
      >
        Reject
      </button>
    </div>
  </div>
))}

            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 mt-6">
              {completedBookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    border: '1px solid #ccc',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    marginBottom: '20px',
                    backgroundColor: '#f9f9f9',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <p
                    style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      marginBottom: '10px',
                      color: '#2c3e50',
                      fontFamily: 'Merriweather, serif',
                    }}
                  >
                    {booking.customerName}
                  </p>
                  <p style={{ margin: '5px 0', color: '#34495e' }}>{booking.dateTime}</p>
                  <p style={{ margin: '5px 0', color: '#555' }}>Phone Number: {booking.phoneNumber}</p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Pickup Location: {booking.pickupLocation.name}</p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Dropoff Location: {booking.dropoffLocation.name}</p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Distance from pickup to dropoff: {booking.distance}</p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Service Type: {booking.serviceType}</p>
                  <p
                    style={{
                      color: '#c0392b',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginTop: '10px',
                    }}
                  >
                    Payable Amount: {booking.updatedTotalSalary}
                  </p>
      
                  <div className="mt-4 flex justify-end">
                    <button
                      style={{
                        backgroundColor: booking.status === 'Order Completed' ? '#bdc3c7' : '#27ae60',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#95a5a6' : '#2ecc71')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#bdc3c7' : '#27ae60')
                      }
                      onClick={() => handleOkClick(booking)}
                      disabled={booking.status === 'Order Completed'}
                    >
                      Accept
                    </button>
                    <button
                      style={{
                        backgroundColor: booking.status === 'Order Completed' ? '#bdc3c7' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#95a5a6' : '#c0392b')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = booking.status === 'Order Completed' ? '#bdc3c7' : '#e74c3c')
                      }
                      onClick={() => handleRejectClick(booking.id)}
                      disabled={booking.status === 'Order Completed'}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
           
          </div>
      
      );
}

export default Dummy