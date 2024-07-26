
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { getFirestore, doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
// import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';
// import { googleMapsApiKey, storage } from '../../config/config';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Add this import at the top

// const Pickup = () => {
//   const location = useLocation();
//   const { state } = location;
//   const { id } = state || {};
//   const [showModal, setShowModal] = useState(false); // State for controlling modal visibility
//   const [pickupLocation, setPickupLocation] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [loadingLocation, setLoadingLocation] = useState(true);
//   const [currentLocationName, setCurrentLocationName] = useState('');

//   const [directions, setDirections] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [kilometer, setKilometer] = useState(''); 
//   const [photo, setPhoto] = useState<File | null>(null);
//   const [status, setStatus] = useState('');
//   const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});
//   const navigate = useNavigate();
// console.log("T8ky",id)
// console.log("status",status)

//   const db = getFirestore();
//   const handleModalClose = () => {
//     setShowModal(false);
//     setKilometer('');
//     setPhoto(null);
//     setErrors({});
//   };
 
//   const handleSubmit = async () => {
//     let validationErrors = {};
  
//     if (!kilometer) {
//       validationErrors.kilometer = 'Kilometer is required';
//     }
//     if (!photo) {
//       validationErrors.photo = 'Photo is required';
//     }
  
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
  
//     try {
//       if (!(photo instanceof File)) {
//         throw new Error('The photo must be a File object.');
//       }
  
//       const storageRef = ref(storage, `photos/${id}/${photo.name}`); // Using the booking id and photo name as a reference path
//       const snapshot = await uploadBytes(storageRef, photo);
//       const photoUrl = await getDownloadURL(snapshot.ref); // Get the download URL of the uploaded photo
  
//       // Update the document in the 'bookings' collection
//       await updateDoc(doc(db, 'bookings', id), {
//         photo: photoUrl,
//         kilometer: kilometer,
//         status: 'Vehicle Picked'
//       });
  
//       // Navigate to the customer data route
//       navigate(`/customerdata/${id}`, {
//         state: {
//           id: id,
//         }
//       });
//     } catch (error) {
//       console.error('Error updating document or uploading photo: ', error);
//     }
//   };
  
//   useEffect(() => {
//     const geolocationOptions = {
//       enableHighAccuracy: true,
//       timeout: 10000, 
//       maximumAge: 0 
//     };

//     const getCurrentLocation = () => {
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           async (position) => {
//             const { latitude, longitude } = position.coords;
//             setCurrentLocation({ lat: latitude, lng: longitude });
//             setLoadingLocation(false);
    
//             // Fetch location name using geocoding
//             fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`)
//               .then(response => response.json())
//               .then(data => {
//                 if (data.results && data.results.length > 0) {
//                   setCurrentLocationName(data.results[0].formatted_address);
//                 } else {
//                   console.log('No address found');
//                 }
//               })
//               .catch(error => {
//                 console.error('Error fetching location name:', error);
//               });
    
//           },
//           (error) => {
//             console.error('Error getting current location:', error);
//             setLoadingLocation(false);
//           },
//           geolocationOptions
//         );
//       } else {
//         console.error('Geolocation is not supported by this browser.');
//         setLoadingLocation(false);
//       }
//     };
    
//     getCurrentLocation();
//   }, []);

//   useEffect(() => {
//     const fetchPickupLocation = async () => {
//       try {
//         const pickupDocRef = doc(db, 'bookings', id);
//         const pickupSnapshot = await getDoc(pickupDocRef);
//         if (pickupSnapshot.exists()) {
//           const data = pickupSnapshot.data();
//           setPickupLocation(data.pickupLocation);
//         } else {
//           console.log('No such document!');
//         }
//       } catch (error) {
//         console.error('Error fetching document: ', error);
//       }
//     };

//     if (id) {
//       fetchPickupLocation();
//     }
//   }, [id, db]);

//   useEffect(() => {
//     const calculateRoute = () => {
//       if (currentLocation && pickupLocation) {
//         const google = window.google;
//         const DirectionsService = new google.maps.DirectionsService();

//         DirectionsService.route(
//           {
//             origin: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
//             destination: new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng),
//             travelMode: google.maps.TravelMode.DRIVING,
//           },
//           (result, status) => {
//             if (status === google.maps.DirectionsStatus.OK) {
//               setDirections(result);
//               setDistance(result.routes[0].legs[0].distance.text);
//             } else {
//               console.error('Failed to load directions:', status);
//             }
//           }
//         );
//       }
//     };

//     calculateRoute();
//   }, [currentLocation, pickupLocation]);

//   useEffect(() => {
//     const checkReachedDestination = async () => {
//         if (currentLocation && pickupLocation) {
//             const google = window.google;
//             const distance = google.maps.geometry.spherical.computeDistanceBetween(
//                 new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
//                 new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng)
//             );
//             if (distance < 500) {
//                 // Update the status to "Vehicle Confirmed" in the database
//                 try {
//                     await updateDoc(doc(db, 'bookings', id), {
//                         status: 'Vehicle Confirmed'
//                     });
//                 } catch (error) {
//                     console.error('Error updating status:', error);
//                 }
//                 alert('Reached destination!');
//                 // Show the modal
//                 setShowModal(true);
//                 setErrors({});
//                 clearInterval(intervalId);
//             }
//         }
//     };

//     const intervalId = setInterval(checkReachedDestination, 1000);

//     return () => clearInterval(intervalId);
// }, [currentLocation, pickupLocation]);


//   const containerStyle = {
//     width: '100%',
//     height: '400px'
//   };
//   // Function to open Google Maps in a new tab with the pickup location
//   const openGoogleMaps = async () => {
//     if (pickupLocation) {
//         const url = `https://www.google.com/maps/search/?api=1&query=${pickupLocation.lat},${pickupLocation.lng}`;
//         window.open(url, '_blank');

//         // Update the status to "On the way to pickup location" in the database
//         try {
//             await updateDoc(doc(db, 'bookings', id), {
//                 status: 'On the way to pickup location'
//             });
//         } catch (error) {
//             console.error('Error updating status:', error);
//         }
//     }
// };

// useEffect(() => {
//   const fetchBookingStatus = async () => {
//     try {
//       const bookingDocRef = doc(db, 'bookings', id);
//       const bookingSnapshot = await getDoc(bookingDocRef);
//       if (bookingSnapshot.exists()) {
//         const data = bookingSnapshot.data();
//         setStatus(data.status); // Set the status state variable
//       } else {
//         console.log('No such document!');
//       }
//     } catch (error) {
//       console.error('Error fetching document: ', error);
//     }
//   };

//   if (id) {
//     fetchBookingStatus();
//   }
// }, [id, db]);

//   return (
//     <div>
//       <h1>Pickup Details</h1>

//       {loadingLocation ? (
//         <p>Loading current location...</p>
//       ) : currentLocation ? (
//         <>
//           {/* <p>ID: {id}</p> */}
//           <p>Current Location: {currentLocationName}</p>
//           {pickupLocation && (
//             <>
//               <p>Pickup Location: {pickupLocation.name}</p>
//               <p>Distance: {distance}</p>
//             </>
//           )}
//           <GoogleMap mapContainerStyle={containerStyle} center={currentLocation || { lat: 0, lng: 0 }} zoom={15}>
//             <AdvancedMarkerElement position={currentLocation} />
//             {pickupLocation && <AdvancedMarkerElement position={pickupLocation} />}
//             {directions && <DirectionsRenderer directions={directions} />}
//           </GoogleMap>
//           <div>         <button className='btn' onClick={openGoogleMaps}>Navigate to Pickup Location</button></div> 

//         </>
//       ) : (
//         <p>Current location not available.</p>
//       )}
//      {showModal && (
//   <div className="modal" style={{ position: 'fixed', top: '50%', left: '55%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', width: '700px', }}>
//     <form>
//       <div className="mb-4">
//         <label htmlFor="kilometer" className="block text-sm font-medium text-gray-700">
//           Kilometer
//         </label>
//         <input
//           type="text"
//           id="kilometer"
//           name="kilometer"
//           placeholder='Enter KM'
//           value={kilometer}
//           onChange={(e) => setKilometer(e.target.value)}
//           className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//         />
//                         {errors.kilometer && <p className="text-red-500 text-xs italic">{errors.kilometer}</p>}

//       </div>
//       <div className="mb-4">
//         <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
//           Photo
//         </label>
//         <input
//           type="file"
//           id="photo"
//           name="photo"
//           accept="image/*"
//           capture="camera" 
//           onChange={(e) => setPhoto(e.target.files[0])}
//           className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//         />
//                         {errors.photo && <p className="text-red-500 text-xs italic">{errors.photo}</p>}

//       </div>
//       <div className="flex justify-end">
//         <button type="button" onClick={handleModalClose} className="btn btn-secondary mr-2">
//           Cancel
//         </button>
//         <button type="button" onClick={handleSubmit} className="btn btn-primary mr-2">
//           Submit
//         </button>
//       </div>
//     </form>
//   </div>
// )}
//     </div>
//   );
// };

// export default Pickup;
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';

const Pickup = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const db = getFirestore();
    const storage = getStorage();
    
    const { state } = location;
    const { id, pickupLocation, customerName } = state || {};
    console.log("T8ky", id);
    
    const [showModal, setShowModal] = useState(false); 
    const [kilometer, setKilometer] = useState(''); 
    const [photo, setPhoto] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});
    const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });
    const [distance, setDistance] = useState<number | null>(null);
    
    const handleModalClose = () => {
        setShowModal(false);
        setKilometer('');
        setPhoto(null);
        setErrors({});
    };

    const handleSubmit = async () => {
        let validationErrors: { kilometer?: string; photo?: string } = {};
    
        if (!kilometer) {
            validationErrors.kilometer = 'Kilometer is required';
        }
        if (!photo) {
            validationErrors.photo = 'Photo is required';
        }
    
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        try {
            if (!(photo instanceof File)) {
                throw new Error('The photo must be a File object.');
            }
    
            const storageRef = ref(storage, `photos/${id}/${photo.name}`);
            const snapshot = await uploadBytes(storageRef, photo);
            const photoUrl = await getDownloadURL(snapshot.ref);
    
            await updateDoc(doc(db, 'bookings', id), {
                photo: photoUrl,
                kilometer: kilometer,
                status: 'Vehicle Picked'
            });
    
            navigate(`/customerdata/${id}`, {
                state: {
                    id: id,
                }
            });
        } catch (error) {
            console.error('Error updating document or uploading photo: ', error);
        }
    };
// Function to receive location data from Flutter app
const receiveLocationFromFlutter = (locationJson: string) => {
    try {
      const locationData = JSON.parse(locationJson) as { latitude: number; longitude: number };
      const locationObj: LocationObj = {
        lat: locationData.latitude,
        lng: locationData.longitude,
      };
      setCurrentLocation(locationObj);
    } catch (error) {
      console.error('Failed to parse location data:', error);
    }
  };

  // Attach receiveLocationFromFlutter to the window object
  useEffect(() => {
    (window as any).receiveLocationFromFlutter = receiveLocationFromFlutter;
  }, []);

  // Function to request location from Flutter app
  const requestLocation = () => {
    if ((window as any).flutter) {
      (window as any).flutter.postMessage('requestLocation');
    }
  };

  // Automatically request location when component mounts
  useEffect(() => {
    requestLocation();
  }, []);

    
    // const fetchCurrentLocation = () => {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 const { latitude, longitude } = position.coords;
    //                 const location = { lat: latitude, lng: longitude };
    //                 setCurrentLocation(location);
    //                 console.log('Current Location:', location);
    //             },
    //             (error) => {
    //                 console.error('Error fetching current location:', error);
    //             }
    //         );
    //     } else {
    //         console.error('Geolocation is not supported by this browser.');
    //     }
    // };

    const calculateDistance = (location1, location2) => {
        const toRadians = (degree) => degree * (Math.PI / 180);

        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRadians(location2.lat - location1.lat);
        const dLng = toRadians(location2.lng - location1.lng);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(location1.lat)) * Math.cos(toRadians(location2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    };

    // useEffect(() => {
    //     fetchCurrentLocation();
    // }, []);
  const openGoogleMaps = async () => {
    if (pickupLocation) {
        const url = `https://www.google.com/maps/search/?api=1&query=${pickupLocation.lat},${pickupLocation.lng}`;
        window.open(url, '_blank');

        // Update the status to "On the way to pickup location" in the database
        try {
            await updateDoc(doc(db, 'bookings', id), {
                status: 'On the way to pickup location'
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }
};
    useEffect(() => {
        const checkReachedDestination = () => {
            if (currentLocation.lat && currentLocation.lng && pickupLocation?.lat && pickupLocation?.lng) {
                const dist = calculateDistance(currentLocation, pickupLocation);
                setDistance(dist);

                if (dist < 1) {
                    (async () => {
                        try {
                            await updateDoc(doc(db, 'bookings', id), {
                                status: 'Vehicle Confirmed'
                            });
                          } catch (error) {
                            console.error('Error updating status:', error);
                        }
                            alert('Reached destination!');
                            setShowModal(true);
                            setErrors({});
                            clearInterval(intervalId);
                    })();
                }
            }
        };

        const intervalId = setInterval(checkReachedDestination, 1000);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [currentLocation, pickupLocation, id, db]);

    return (
      
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Pickup Details</h2>

      <div className="mb-6">
          <p className="text-lg font-semibold text-gray-800">Current Location:</p>
          {currentLocation.lat && currentLocation.lng ? (
              <p className="text-gray-700">
                  Latitude: <span className="font-semibold">{currentLocation.lat}</span>, 
                  Longitude: <span className="font-semibold">{currentLocation.lng}</span>
              </p>
          ) : (
              <p className="text-gray-500">Fetching current location...</p>
          )}
      </div>

      {pickupLocation ? (
          <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800">Pickup Location:</p>
              <p className="text-gray-700">
                  Place: <span className="font-semibold">{pickupLocation.placename}</span>
              </p>
              <p className="text-gray-700">
                  Latitude: <span className="font-semibold">{pickupLocation.lat}</span>
              </p>
              <p className="text-gray-700">
                  Longitude: <span className="font-semibold">{pickupLocation.lng}</span>
              </p>
          </div>
      ) : (
          <p className="text-gray-500">Pickup location not available.</p>
      )}

      <div className="mb-6">
          <p className="text-lg font-semibold text-gray-800">Customer Name:</p>
          <p className="text-gray-700 font-semibold">{customerName}</p>
      </div>

      {distance !== null && (
          <div className="mb-6">
              <p className="text-lg font-semibold text-gray-800">Distance to Pickup Location:</p>
              <p className="text-gray-700 font-semibold">{distance.toFixed(2)} km</p>
          </div>
      )}

      <div className="flex justify-center mb-6">
          <button
              className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={openGoogleMaps}
          >
              Navigate to Pickup Location
          </button>
      </div>

      {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">Enter Details</h3>
                  <form>
                      <div className="mb-4">
                          <label htmlFor="kilometer" className="block text-sm font-medium text-gray-700">
                              Kilometer
                          </label>
                          <input
                              type="text"
                              id="kilometer"
                              name="kilometer"
                              placeholder="Enter KM"
                              value={kilometer}
                              onChange={(e) => setKilometer(e.target.value)}
                              className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          {errors.kilometer && <p className="text-red-500 text-xs italic mt-1">{errors.kilometer}</p>}
                      </div>
                      <div className="mb-6">
                          <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                              Photo
                          </label>
                          <input
                              type="file"
                              id="photo"
                              name="photo"
                              accept="image/*"
                              capture="camera"
                              onChange={(e) => setPhoto(e.target.files[0])}
                              className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          {errors.photo && <p className="text-red-500 text-xs italic mt-1">{errors.photo}</p>}
                      </div>
                      <div className="flex justify-end">
                          <button type="button" onClick={handleModalClose} className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2">
                              Cancel
                          </button>
                          <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              Submit
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
  </div>
    );
}

export default Pickup;





