import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, addDoc, query, where } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import IconPhone from '../../components/Icon/IconPhone';

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
    const phone = localStorage.getItem('phone');
    const password = localStorage.getItem('password'); 
    console.log('driverId', driverId);
    console.log('phone', phone);

    console.log('password', password);

    console.log('phone', phone);
    const [selectedBooking, setSelectedBooking] = useState<RecordData | null>(null);

    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [recordsData, setRecordsData] = useState<RecordData[]>([]);
    const [driverDetailsMap, setDriverDetailsMap] = useState<{ [key: string]: { totalDriverSalary: number; totalDistance: number } }>({});
    const db = getFirestore();
    const navigate = useNavigate();
    const completedBookings = recordsData.filter((booking) => booking.status === 'Order Completed');
    const nonCompletedBookings = recordsData.filter((booking) => booking.status !== 'Order Completed');
    const fetchCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = { lat: latitude, lng: longitude };
                    setCurrentLocation(location);
                    console.log('Current Location:', location);
                },
                (error) => {
                    console.error('Error fetching current location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };
    
    useEffect(() => {
        fetchCurrentLocation();
    }, []);

    const calculateDrivingDistance = (origin, destination) => {
        return new Promise((resolve, reject) => {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin,
                    destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (response, status) => {
                    if (status === 'OK') {
                        const route = response.routes[0];
                        const distance = route.legs[0].distance.value / 1000; // distance in kilometers
                        resolve(distance);
                    } else {
                        reject(`Directions request failed due to ${status}`);
                    }
                }
            );
        });
    };

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
    const handleOkClick = async (booking) => {
        const { customerName, pickupLocation, totalSalary, id } = booking;
    
        try {
            await updateDoc(doc(db, 'bookings', id), {
                status: 'Order Received',
            });
    
            setSelectedBooking(booking);
    
            // Navigate to pickup page
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

    const calculateDriverSalary = (basicSalary, basicSalaryKM, totalDistance, salaryPerKM) => {
        const numericBasicSalary = parseFloat(basicSalary);
        const numericBasicSalaryKM = parseFloat(basicSalaryKM);
        const numericTotalDistance = parseFloat(totalDistance);
        const numericSalaryPerKM = parseFloat(salaryPerKM);

        if (isNaN(numericBasicSalary) || isNaN(numericBasicSalaryKM) || isNaN(numericTotalDistance) || isNaN(numericSalaryPerKM)) {
            console.error('Invalid numeric values for salary calculation');
            return 0;
        }

        const excessKm = Math.max(0, numericTotalDistance - numericBasicSalaryKM);
        return numericBasicSalary + excessKm * numericSalaryPerKM;
    };

    const handleDriverDetails = async (selectedDriverId, serviceType, pickupLocation, dropoffLocation, bookingId) => {
        if (!currentLocation) {
            console.error('Current location not available');
            return;
        }

        try {
            const distanceToPickup = await calculateDrivingDistance(currentLocation, pickupLocation);
            const distancePickupToDropoff = await calculateDrivingDistance(pickupLocation, dropoffLocation);
            const distanceDropoffToCurrent = await calculateDrivingDistance(dropoffLocation, currentLocation);

            console.log("distanceToPickup", distanceToPickup);
            console.log("distancePickupToDropoff", distancePickupToDropoff);
            console.log("distanceDropoffToCurrent", distanceDropoffToCurrent);

            const totalDistance = distanceToPickup + distancePickupToDropoff + distanceDropoffToCurrent;

            const details = await fetchDriverDetails(selectedDriverId, serviceType);
            if (details && details.salaryDetails) {
                const totalDriverSalary = calculateDriverSalary(details.salaryDetails.basicSalary, details.salaryDetails.basicSalaryKM, totalDistance, details.salaryDetails.salaryPerKM);
                setDriverDetailsMap((prevState) => ({
                    ...prevState,
                    [bookingId]: {
                        ...details,
                        totalDriverSalary,
                        totalDistance,
                    },
                }));
            } else {
                console.error('Driver details or salary details are missing');
            }
        } catch (error) {
            console.error('Error handling driver details: ', error);
        }
    };
    return (
        <div>
          <div className="panel mt-6">
            <h5 className="font-semibold text-lg dark:text-white-light mb-5">New Bookings</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
             {nonCompletedBookings.map((booking) => (
  <div
    key={booking.id}
    style={{
      border: '1px solid #e0e0e0',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      backgroundColor: '#fff',
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
    <p style={{ margin: '5px 0', color: '#555', display: 'inline-flex', alignItems: 'center' }}>
      <IconPhone style={{ marginRight: '8px' }} />{' '}
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
    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Pickup Location: {booking.pickupLocation.name}</p>
    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Dropoff Location: {booking.dropoffLocation.name}</p>
    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Total Distance: {booking.totalDistance}</p>
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

    <button
      className="btn btn-info"
      style={{
        marginTop: '10px',
        backgroundColor: '#3498db',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
      onClick={() =>
        handleDriverDetails(
          booking.selectedDriver,
          booking.serviceType,
          booking.pickupLocation,
          booking.dropoffLocation,
          booking.id
        )
      }
    >
      View Driver Details
    </button>
    {driverDetailsMap[booking.id] && (
      <div>
        {driverDetailsMap[booking.id].salaryDetails && (
          <>
            <p className="mt-2">Basic Salary: {driverDetailsMap[booking.id].salaryDetails.basicSalary}</p>
            <p>Salary per KM: {driverDetailsMap[booking.id].salaryDetails.salaryPerKM}</p>
            <p>Basic Salary KM: {driverDetailsMap[booking.id].salaryDetails.basicSalaryKM}</p>
            <p>Total Distance: {driverDetailsMap[booking.id].totalDistance}</p>

            <p
              style={{
                color: '#c0392b',
                fontSize: '18px',
                fontWeight: 'bold',
                marginTop: '10px',
              }}
            >
              Total Salary: {driverDetailsMap[booking.id].totalDriverSalary.toFixed(2)}
            </p>
          </>
        )}
      </div>
    )}

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
      
                  <button
                    className="btn btn-info"
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#3498db',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
                    onClick={() =>
                      handleDriverDetails(
                        booking.selectedDriver,
                        booking.serviceType,
                        booking.pickupLocation,
                        booking.dropoffLocation,
                        booking.id
                      )
                    }
                  >
                    View Driver Details
                  </button>
                  {driverDetailsMap[booking.id] && (
                    <div>
                      {driverDetailsMap[booking.id].salaryDetails && (
                        <>
                          <p className="mt-2">Basic Salary: {driverDetailsMap[booking.id].salaryDetails.basicSalary}</p>
                          <p>Salary per KM: {driverDetailsMap[booking.id].salaryDetails.salaryPerKM}</p>
                          <p>Basic Salary KM: {driverDetailsMap[booking.id].salaryDetails.basicSalaryKM}</p>
      
                          <p
                            style={{
                              color: '#c0392b',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              marginTop: '10px',
                            }}
                          >
                            Total Salary: {driverDetailsMap[booking.id].totalDriverSalary.toFixed(2)}
                          </p>
                        </>
                      )}
                    </div>
                  )}
      
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