

// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { getFirestore, doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
// import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';
// import { auth, googleMapsApiKey, storage } from '../../config/config';
// // import { db, storage } from 'firebase/firestore'; // Adjust the path as necessary
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
//   const [kilometer, setKilometer] = useState(''); // Define kilometer state
//   const [photo, setPhoto] = useState<File | null>(null);
//   const [status, setStatus] = useState(''); // Define status state variable
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
//       console.log(auth.currentUser); // Log the current user for debugging
//       const photoRef = ref(storage, `photos/${photo.name}`);
//         const snapshot = await uploadBytes(photoRef, photo);
//         const photoUrl = await getDownloadURL(snapshot.ref);

//         // Then, add the document in Firestore with the photo URL
//         const docRef = await addDoc(collection(db, 'driverpickup'), {
//             kilometer,
//             photo: photoUrl,
//         });

//         // Additional logic as required, e.g., updating the booking status
//         navigate(`/customerdata/${docRef.id}`, {
//             state: {
//                 id: id,
//             }
//         });
//     } catch (error) {
//         console.error('Error adding document or uploading photo: ', error);
//     }
// };
  
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
//             if (distance < 100) {
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
//   type="file"
//   id="photo"
//   name="photo"
//   accept="image/*"
//   capture="camera" 
//   onChange={(e) => setPhoto(e.target.files[0])} // Use e.target.files[0] to get the file
//   className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
// />

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


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';
import { googleMapsApiKey, storage } from '../../config/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Add this import at the top

const Pickup = () => {
  const location = useLocation();
  const { state } = location;
  const { id } = state || {};
  const [showModal, setShowModal] = useState(false); // State for controlling modal visibility
  const [pickupLocation, setPickupLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [currentLocationName, setCurrentLocationName] = useState('');

  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [kilometer, setKilometer] = useState(''); // Define kilometer state
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState(''); // Define status state variable
  const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});
  const navigate = useNavigate();
console.log("T8ky",id)
console.log("status",status)

  const db = getFirestore();
  const handleModalClose = () => {
    setShowModal(false);
    setKilometer('');
    setPhoto(null);
    setErrors({});
  };
  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  
    // Optional: Cleanup the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  };
  
  useEffect(() => {
    loadGoogleMapsScript();
  }, []); // Empty dependency array to run only once on mount
  const handleSubmit = async () => {
    let validationErrors = {};
  
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
      // Ensure 'photo' is a File object
      if (!(photo instanceof File)) {
        throw new Error('The photo must be a File object.');
      }
  
      const storageRef = ref(storage, `photos/${id}/${photo.name}`); // Using the booking id and photo name as a reference path
      const snapshot = await uploadBytes(storageRef, photo);
      const photoUrl = await getDownloadURL(snapshot.ref); // Get the download URL of the uploaded photo
  
      // Update the document in the 'bookings' collection
      await updateDoc(doc(db, 'bookings', id), {
        photo: photoUrl,
        kilometer: kilometer,
        status: 'Vehicle Picked'
      });
  
      // Navigate to the customer data route
      navigate(`/customerdata/${id}`, {
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
    
            // Fetch location name using geocoding
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
    const fetchPickupLocation = async () => {
      try {
        const pickupDocRef = doc(db, 'bookings', id);
        const pickupSnapshot = await getDoc(pickupDocRef);
        if (pickupSnapshot.exists()) {
          const data = pickupSnapshot.data();
          setPickupLocation(data.pickupLocation);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    if (id) {
      fetchPickupLocation();
    }
  }, [id, db]);

  useEffect(() => {
    const calculateRoute = () => {
      if (currentLocation && pickupLocation) {
        const google = window.google;
        const DirectionsService = new google.maps.DirectionsService();

        DirectionsService.route(
          {
            origin: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
            destination: new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng),
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
  }, [currentLocation, pickupLocation]);

  useEffect(() => {
    const checkReachedDestination = async () => {
        if (currentLocation && pickupLocation) {
            const google = window.google;
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
                new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng)
            );
            if (distance < 100) {
                // Update the status to "Vehicle Confirmed" in the database
                try {
                    await updateDoc(doc(db, 'bookings', id), {
                        status: 'Vehicle Confirmed'
                    });
                } catch (error) {
                    console.error('Error updating status:', error);
                }
                alert('Reached destination!');
                // Show the modal
                setShowModal(true);
                setErrors({});
                clearInterval(intervalId);
            }
        }
    };

    const intervalId = setInterval(checkReachedDestination, 1000);

    return () => clearInterval(intervalId);
}, [currentLocation, pickupLocation]);


  const containerStyle = {
    width: '100%',
    height: '400px'
  };
  // Function to open Google Maps in a new tab with the pickup location
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
  const fetchBookingStatus = async () => {
    try {
      const bookingDocRef = doc(db, 'bookings', id);
      const bookingSnapshot = await getDoc(bookingDocRef);
      if (bookingSnapshot.exists()) {
        const data = bookingSnapshot.data();
        setStatus(data.status); // Set the status state variable
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
      <h1>Pickup Details</h1>

      {loadingLocation ? (
        <p>Loading current location...</p>
      ) : currentLocation ? (
        <>
          {/* <p>ID: {id}</p> */}
          <p>Current Location: {currentLocationName}</p>
          {pickupLocation && (
            <>
              <p>Pickup Location: {pickupLocation.name}</p>
              <p>Distance: {distance}</p>
            </>
          )}
          <GoogleMap mapContainerStyle={containerStyle} center={currentLocation || { lat: 0, lng: 0 }} zoom={15}>
            <AdvancedMarkerElement position={currentLocation} />
            {pickupLocation && <AdvancedMarkerElement position={pickupLocation} />}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
          <div>         <button className='btn' onClick={openGoogleMaps}>Navigate to Pickup Location</button></div> 

        </>
      ) : (
        <p>Current location not available.</p>
      )}
     {showModal && (
  <div className="modal" style={{ position: 'fixed', top: '50%', left: '55%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', width: '700px', }}>
    <form>
      <div className="mb-4">
        <label htmlFor="kilometer" className="block text-sm font-medium text-gray-700">
          Kilometer
        </label>
        <input
          type="text"
          id="kilometer"
          name="kilometer"
          placeholder='Enter KM'
          value={kilometer}
          onChange={(e) => setKilometer(e.target.value)}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
                        {errors.kilometer && <p className="text-red-500 text-xs italic">{errors.kilometer}</p>}

      </div>
      <div className="mb-4">
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
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
                        {errors.photo && <p className="text-red-500 text-xs italic">{errors.photo}</p>}

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

export default Pickup;