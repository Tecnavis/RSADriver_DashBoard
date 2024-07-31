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

const NewBooking = () => {
    const driverId = localStorage.getItem('driverId');
    // const phone = localStorage.getItem('phone');
    const password = localStorage.getItem('password'); 
    const {phone} = useUserContext();
    const location = useLocation();
    const { currentLocation } = location.state || {};
    console.log("currentLocation",location)
    const [selectedBooking, setSelectedBooking] = useState<RecordData | null>(null);
    const [soundPlaying, setSoundPlaying] = useState<boolean>(false);

    const [recordsData, setRecordsData] = useState<RecordData[]>([]);
    const db = getFirestore();
    const navigate = useNavigate();
    const completedBookings = recordsData.filter((booking) => booking.status === 'Order Completed');
    const nonCompletedBookings = recordsData.filter((booking) => booking.status !== 'Order Completed');
    const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(()=>{
     if(!phone){
      navigate('/login')
     }
},[phone,navigate])
  
    const fetchDriverDetails = async (driverId, serviceType) => {
        try {
            const driverDoc = await getDoc(doc(db, 'driver', driverId));
            if (driverDoc.exists()) {
                const driverData = driverDoc.data();
                if (driverData.phone === phone && driverData.password === password) {
                    if (driverData.selectedServices.includes(serviceType)) {
                        const salaryDetails = {
                            basicSalary: driverData.basicSalaries[serviceType],
                            salaryPerKM: driverData.salaryPerKm[serviceType],
                            basicSalaryKM: driverData.basicSalaryKm[serviceType],
                        };

                        return {
                            ...driverData,
                            salaryDetails,
                        };
                    } else {
                        console.log('Service type not supported by the driver');
                        return { ...driverData, salaryDetails: null };
                    }
                } else {
                    console.log('Phone and/or password do not match');
                    return null;
                }
            } else {
                console.log('No such driver found!');
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
              const querySnapshot = await getDocs(query(collection(db, 'bookings'), where('selectedDriver', '==', driverId)));
              const dataWithIndex = querySnapshot.docs.map((doc, index) => ({
                  index: index + 2000,
                  ...doc.data(),
                  id: doc.id,
              }));

              const filteredData = await Promise.all(
                  dataWithIndex.map(async (booking) => {
                      const driverDetails = await fetchDriverDetails(booking.selectedDriver, booking.serviceType);
                      if (driverDetails && driverDetails.phone === phone && driverDetails.password === password) {
                          return booking;
                      } else {
                          return null;
                      }
                  })
              );

              const filteredRecordsData = filteredData.filter((booking) => booking !== null);

              setRecordsData(filteredRecordsData);
              console.log('first', filteredRecordsData);
          } catch (error) {
              console.error('Error fetching data: ', error);
          }
      };
      fetchData();
  }, [db, phone, password, driverId]);
  useEffect(() => {
    if (recordsData.some((booking) => booking.status === 'booking added')) {
        if (audioRef.current) {
            audioRef.current.loop = true; // Make sure the audio loops
            audioRef.current.play();
        }
    } else {
        if (audioRef.current) {
            audioRef.current.loop = false; // Stop looping
            audioRef.current.pause(); // Pause the audio
            audioRef.current.currentTime = 0; // Reset to the beginning
        }
    }
}, [recordsData]);
    const handleOkClick = async (booking) => {
        const { customerName, pickupLocation, totalSalary, id } = booking;
    
        try {
            await updateDoc(doc(db, 'bookings', id), {
                status: 'Order Received',
            });
    
            setSelectedBooking(booking);
    
            const pickupPlaceName = pickupLocation?.name || null;
            console.log('Current LocationNew:', currentLocation);

            navigate(`/pickup/${id}`, {
                state: {
                    pickupLocation: {
                        placename: pickupPlaceName,
                        lat: pickupLocation?.lat,
                        lng: pickupLocation?.lng,
                    },
                    
                    customerName,
                    id,
                    totalSalary,
                    currentLocation,
                },
            });
        } catch (error) {
            console.error('Error handling booking operation: ', error);
        }
    };
    

    const handleRejectClick = async (id: string) => {
        try {
            const confirmed = window.confirm('Are you sure you want to reject this booking?');
            if (confirmed) {
                await updateDoc(doc(db, 'bookings', id), {
                    status: 'Rejected',
                });
                // Optionally refresh the bookings list or show a notification
                alert('Booking rejected.');
                setRecordsData((prev) => prev.filter((booking) => booking.id !== id)); // remove from UI
            } else {
                // Handle rejection cancellation if needed
                console.log('Booking rejection cancelled.');
            }
        } catch (error) {
            console.error('Error rejecting booking: ', error);
        }
    };

   
  const handlePhoneClick = async (bookingId: string) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'called to customer',
        });
    } catch (error) {
        console.error('Error updating booking status: ', error);
    }
};
    return (
        <div>
                      <audio ref={audioRef} src="/emergency-alarm-with-reverb-29431.mp3" />

          <div className="panel mt-6">
            <h5 className="font-semibold text-lg dark:text-white-light mb-5">New Bookings</h5>
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
              <h5 className="font-semibold text-lg dark:text-white-light mb-5">Completed Bookings</h5>
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
            <Link to={`/bookings/closedbooking?phone=${phone}`} className="link">
              <button
                className="btn mt-6"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: '#fff',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
              >
                View Status
              </button>
            </Link>
          </div>
        </div>
      );
};

export default NewBooking;