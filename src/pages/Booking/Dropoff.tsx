// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { getFirestore, doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
// import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';
// import { googleMapsApiKey , storage } from '../../config/config';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Add this import at the top

// const Dropoff = () => {
//   const location = useLocation();
//   const { state } = location;
//   const { id } = state || {};
//   const [dropoffLocation, setDropoffLocation] = useState(null);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [currentLocationName, setCurrentLocationName] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [kilometerdrop, setKilometerdrop] = useState(''); // Define kilometerdrop state
//   const [photodrop, setPhotodrop] = useState<File | null>(null);
//   const [errors, setErrors] = useState<{ kilometerdrop?: string; photodrop?: string }>({});
//   const [loadingLocation, setLoadingLocation] = useState(true);
//   const [directions, setDirections] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const navigate = useNavigate();

//   const db = getFirestore();
//   const handleModalClose = () => {
//     setShowModal(false);
//     setKilometerdrop('');
//     setPhotodrop(null);
//     setErrors({});
//   };
//   const loadGoogleMapsScript = () => {
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);
  
//     // Optional: Cleanup the script when the component unmounts
//     return () => {
//       document.head.removeChild(script);
//     };
//   };
  
//   useEffect(() => {
//     loadGoogleMapsScript();
//   }, []); // Empty dependency array to run only once on mount
//   useEffect(() => {
//     const geolocationOptions = {
//       enableHighAccuracy: true, // High accuracy mode
//       timeout: 10000, // Timeout after 10 seconds
//       maximumAge: 0 // No cache
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

//   const handleSubmit = async () => {
//     let validationErrors: { kilometerdrop?: string; photodrop?: string } = {};

//     if (!kilometerdrop) {
//       validationErrors.kilometerdrop = 'Kilometerdrop is required';
//     }
//     if (!photodrop) {
//       validationErrors.photodrop = 'Photodrop is required';
//     }

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }
//     try {
//         // Add document to the 'driverdropoff' collection
//       //   await updateDoc(doc(db, 'bookings', id), {
//       //     photodrop,
//       //     kilometerdrop,
//       //     status: 'Vehicle dropoff'

//       // });
//       // Ensure 'photo' is a File object
//       if (!(photodrop instanceof File)) {
//         throw new Error('The photo must be a File object.');
//       }
  
//       const storageRef = ref(storage, `photos/${id}/${photodrop.name}`); // Using the booking id and photo name as a reference path
//       const snapshot = await uploadBytes(storageRef, photodrop);
//       const photoUrl = await getDownloadURL(snapshot.ref); // Get the download URL of the uploaded photo
  
//       // Update the document in the 'bookings' collection
//       await updateDoc(doc(db, 'bookings', id), {
//         photodrop: photoUrl,
//         kilometerdrop: kilometerdrop,
//         status: 'Vehicle dropoff'
//       });
//         console.log(`Navigating to /customerverification/${id}`);
//         navigate(`/customerverification/${id}`, {
//           state: {
//             id: id,
//           }
//         });
        
          
//     } catch (error) {
//         console.error('Error adding document: ', error);
//     }
// };

//   useEffect(() => {
//     const fetchDropoffLocation = async () => {
//       try {
//         const dropoffDocRef = doc(db, 'bookings', id);
//         const dropoffSnapshot = await getDoc(dropoffDocRef);
//         if (dropoffSnapshot.exists()) {
//           const data = dropoffSnapshot.data();
//           setDropoffLocation(data.dropoffLocation);
//         } else {
//           console.log('No such document!');
//         }
//       } catch (error) {
//         console.error('Error fetching document: ', error);
//       }
//     };

//     if (id) {
//       fetchDropoffLocation();
//     }
//   }, [id, db]);

//   useEffect(() => {
//     const calculateRoute = () => {
//       if (currentLocation && dropoffLocation) {
//         const google = window.google;
//         const DirectionsService = new google.maps.DirectionsService();

//         DirectionsService.route(
//           {
//             origin: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
//             destination: new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng),
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
//   }, [currentLocation, dropoffLocation]);

//   useEffect(() => {
//     const checkReachedDestination = () => {
//       if (currentLocation && dropoffLocation) {
//         const google = window.google;
//         const distance = google.maps.geometry.spherical.computeDistanceBetween(
//           new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
//           new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng)
//         );
//         if (distance < 500) {
//           alert('Reached destination!');
//           clearInterval(intervalId);
//           setShowModal(true); // Show the modal when destination is reached


    
//         }

//       }
//     };

//     const intervalId = setInterval(checkReachedDestination, 1000);

//     return () => clearInterval(intervalId);
//   }, [currentLocation, dropoffLocation]);

//   const containerStyle = {
//     width: '100%',
//     height: '400px'
//   };
  
//   // Function to open Google Maps in a new tab with the dropoff location
//   const openGoogleMaps = async () => {
//     if (dropoffLocation) {
//       const url = `https://www.google.com/maps/search/?api=1&query=${dropoffLocation.lat},${dropoffLocation.lng}`;
//       window.open(url, '_blank');

//         // Update the status to "On the way to dropoff location" in the database
//         try {
//           await updateDoc(doc(db, 'bookings', id), {
//               status: 'On the way to dropoff location'
//           });
//       } catch (error) {
//           console.error('Error updating status:', error);
//       }
//     }
// };


//   return (
//     <div>
//       <h1>Dropoff Details</h1>

//       {loadingLocation ? (
//         <p>Loading current location...</p>
//       ) : currentLocation ? (
//         <>
//           {/* <p>ID: {id}</p> */}
//           <p>Current Location: {currentLocationName}</p>
//           {dropoffLocation && (
//             <>
//               <p>Dropoff Location: {dropoffLocation.name}</p>
//               <p>Distance: {distance}</p>
//             </>
//           )}
//           <GoogleMap mapContainerStyle={containerStyle} center={currentLocation || { lat: 0, lng: 0 }} zoom={15}>
//             <AdvancedMarkerElement position={currentLocation} />
//             {dropoffLocation && <AdvancedMarkerElement position={dropoffLocation} />}
//             {directions && <DirectionsRenderer directions={directions} />}
//           </GoogleMap>
//           <div>
//             <button className='btn' onClick={openGoogleMaps}>Navigate to Dropoff Location</button>
//           </div>
//         </>
//       ) : (
//         <p>Current location not available.</p>
//       )}
//  {showModal && (
//   <div className="modal" style={{ position: 'fixed', top: '50%', left: '55%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', width: '700px', }}>
//     <form>
//       <div className="mb-4">
//         <label htmlFor="kilometerdrop" className="block text-sm font-medium text-gray-700">
//           Kilometer
//         </label>
//         <input
//           type="text"
//           id="kilometerdrop"
//           name="kilometerdrop"
//           placeholder='Enter KM'
//           value={kilometerdrop}
//           onChange={(e) => setKilometerdrop(e.target.value)}
//           className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//         />
//                         {errors.kilometerdrop && <p className="text-red-500 text-xs italic">{errors.kilometerdrop}</p>}

//       </div>
//       <div className="mb-4">
//         <label htmlFor="photodrop" className="block text-sm font-medium text-gray-700">
//           Photo
//         </label>
//         <input
//           type="file"
//           id="photodrop"
//           name="photodrop"
//           accept="image/*"
//           capture="camera" 
//           onChange={(e) => setPhotodrop(e.target.files[0])}
//           className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//         />
//                         {errors.photodrop && <p className="text-red-500 text-xs italic">{errors.photodrop}</p>}

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

// export default Dropoff;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';
import { googleMapsApiKey, storage } from '../../config/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Dropoff = () => {
  const location = useLocation();
  const { state } = location;
  const { id } = state || {};
  const [showModal, setShowModal] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [kilometerdrop, setKilometerdrop] = useState(''); 
  const [photodrop, setPhotodrop] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});
  const navigate = useNavigate();
  const db = getFirestore();

  const handleModalClose = () => {
    setShowModal(false);
    setKilometerdrop('');
    setPhotodrop(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    let validationErrors = {};
  
    if (!kilometerdrop) {
      validationErrors.kilometerdrop = 'Kilometer is required';
    }
    if (!photodrop) {
      validationErrors.photodrop = 'Photo is required';
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      if (!(photodrop instanceof File)) {
        throw new Error('The photo must be a File object.');
      }
  
      const storageRef = ref(storage, `photos/${id}/${photodrop.name}`);
      const snapshot = await uploadBytes(storageRef, photodrop);
      const photoUrl = await getDownloadURL(snapshot.ref);
  
      await updateDoc(doc(db, 'bookings', id), {
        photodrop: photoUrl,
        kilometerdrop: kilometerdrop,
        status: 'Vehicle Dropped'
      });
  
      navigate(`/customerverification/${id}`, {
        state: {
          id: id,
        }
      });
    } catch (error) {
      console.error('Error updating document or uploading photo: ', error);
    }
  };

  useEffect(() => {
    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLoadingLocation(false);
    
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`)
              .then(response => response.json())
              .then(data => {
                if (data.results && data.results.length > 0) {
                  setCurrentLocationName(data.results[0].formatted_address);
                } else {
                  console.log('No address found');
                }
              })
              .catch(error => {
                console.error('Error fetching location name:', error);
              });
    
          },
          (error) => {
            console.error('Error getting current location:', error);
            setLoadingLocation(false);
          },
          geolocationOptions
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        setLoadingLocation(false);
      }
    };
    
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const fetchDropoffLocation = async () => {
      try {
        const dropoffDocRef = doc(db, 'bookings', id);
        const dropoffSnapshot = await getDoc(dropoffDocRef);
        if (dropoffSnapshot.exists()) {
          const data = dropoffSnapshot.data();
          setDropoffLocation(data.dropoffLocation);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    if (id) {
      fetchDropoffLocation();
    }
  }, [id, db]);

  useEffect(() => {
    const calculateRoute = () => {
      if (currentLocation && dropoffLocation) {
        const google = window.google;
        const DirectionsService = new google.maps.DirectionsService();

        DirectionsService.route(
          {
            origin: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
            destination: new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng),
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirections(result);
              setDistance(result.routes[0].legs[0].distance.text);
            } else {
              console.error('Failed to load directions:', status);
            }
          }
        );
      }
    };

    calculateRoute();
  }, [currentLocation, dropoffLocation]);

  useEffect(() => {
    const checkReachedDestination = async () => {
        if (currentLocation && dropoffLocation) {
            const google = window.google;
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
                new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng)
            );
            if (distance < 500) {
                try {
                    await updateDoc(doc(db, 'bookings', id), {
                        // status: 'Vehicle Confirmed'
                    });
                } catch (error) {
                    console.error('Error updating status:', error);
                }
                alert('Reached destination!');
                setShowModal(true);
                setErrors({});
                clearInterval(intervalId);
            }
        }
    };

    const intervalId = setInterval(checkReachedDestination, 1000);

    return () => clearInterval(intervalId);
}, [currentLocation, dropoffLocation]);

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  const openGoogleMaps = async () => {
    if (dropoffLocation) {
        const url = `https://www.google.com/maps/search/?api=1&query=${dropoffLocation.lat},${dropoffLocation.lng}`;
        window.open(url, '_blank');

        try {
            await updateDoc(doc(db, 'bookings', id), {
                status: 'On the way to dropoff location'
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }
  };

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const bookingDocRef = doc(db, 'bookings', id);
        const bookingSnapshot = await getDoc(bookingDocRef);
        if (bookingSnapshot.exists()) {
          const data = bookingSnapshot.data();
          setStatus(data.status);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    if (id) {
      fetchBookingStatus();
    }
  }, [id, db]);

  return (
    <div>
      <h1>Dropoff Details</h1>

      {loadingLocation ? (
        <p>Loading current location...</p>
      ) : currentLocation ? (
        <>
          <p>Current Location: {currentLocationName}</p>
          {dropoffLocation && (
            <>
              <p>Dropoff Location: {dropoffLocation.name}</p>
              <p>Distance: {distance}</p>
            </>
          )}
          <GoogleMap mapContainerStyle={containerStyle} center={currentLocation || { lat: 0, lng: 0 }} zoom={15}>
            <AdvancedMarkerElement position={currentLocation} />
            {dropoffLocation && <AdvancedMarkerElement position={dropoffLocation} />}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
          <div><button className='btn' onClick={openGoogleMaps}>Navigate to Dropoff Location</button></div> 
        </>
      ) : (
        <p>Current location not available.</p>
      )}
     {showModal && (
  <div className="modal" style={{ position: 'fixed', top: '50%', left: '55%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', width: '700px', }}>
    <form>
      <div className="mb-4">
        <label htmlFor="kilometerdrop" className="block text-sm font-medium text-gray-700">
          Kilometer
        </label>
        <input
          type="text"
          id="kilometerdrop"
          name="kilometerdrop"
          placeholder='Enter KM'
          value={kilometerdrop}
          onChange={(e) => setKilometerdrop(e.target.value)}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.kilometerdrop && <p className="text-red-500 text-xs italic">{errors.kilometerdrop}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="photodrop" className="block text-sm font-medium text-gray-700">
          Photo
        </label>
        <input
          type="file"
          id="photodrop"
          name="photodrop"
          accept="image/*"
          capture="camera"
          onChange={(e) => setPhotodrop(e.target.files[0])}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.photodrop && <p className="text-red-500 text-xs italic">{errors.photodrop}</p>}
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={handleModalClose} className="btn btn-secondary mr-2">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} className="btn btn-primary mr-2">
          Submit
        </button>
      </div>
    </form>
  </div>
)}
    </div>
  );
};

export default Dropoff;
