import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';
import { googleMapsApiKey } from '../../config/config';

const Dropoff = () => {
  const location = useLocation();
  const { state } = location;
  const { id } = state || {};
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [kilometer, setKilometer] = useState(''); // Define kilometer state
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const navigate = useNavigate();

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
  useEffect(() => {
    const geolocationOptions = {
      enableHighAccuracy: true, // High accuracy mode
      timeout: 10000, // Timeout after 10 seconds
      maximumAge: 0 // No cache
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
        // Add document to the 'driverdropoff' collection
        const docRef = await addDoc(collection(db, 'driverdropoff'), {
          photo,
          kilometer,
      });
      
        
        // Update the status to "Vehicle Picked" in the database
        await updateDoc(doc(db, 'bookings', id), {
            status: 'Vehicle dropoff'
        });

        console.log(`Navigating to /customerverification/${id}`);
        navigate(`/customerverification/${id}`, {
          state: {
            id: id,
            statusMessage: "Vehicle DropOff"
          }
        });
        
          
    } catch (error) {
        console.error('Error adding document: ', error);
    }
};

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
    const checkReachedDestination = () => {
      if (currentLocation && dropoffLocation) {
        const google = window.google;
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
          new google.maps.LatLng(dropoffLocation.lat, dropoffLocation.lng)
        );
        if (distance < 100) {
          alert('Reached destination!');
          clearInterval(intervalId);
          setShowModal(true); // Show the modal when destination is reached


    
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
  
  // Function to open Google Maps in a new tab with the dropoff location
  const openGoogleMaps = async () => {
    if (dropoffLocation) {
      const url = `https://www.google.com/maps/search/?api=1&query=${dropoffLocation.lat},${dropoffLocation.lng}`;
      window.open(url, '_blank');

        // Update the status to "On the way to dropoff location" in the database
        try {
          await updateDoc(doc(db, 'bookings', id), {
              status: 'On the way to dropoff location'
          });
      } catch (error) {
          console.error('Error updating status:', error);
      }
    }
};


  return (
    <div>
      <h1>Dropoff Details</h1>

      {loadingLocation ? (
        <p>Loading current location...</p>
      ) : currentLocation ? (
        <>
          {/* <p>ID: {id}</p> */}
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
          <div>
            <button className='btn' onClick={openGoogleMaps}>Navigate to Dropoff Location</button>
          </div>
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
          onChange={(e) => setPhoto(e.target.value)}
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

export default Dropoff;
