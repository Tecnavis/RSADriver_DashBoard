

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { GoogleMap, Marker as AdvancedMarkerElement, DirectionsRenderer } from '@react-google-maps/api';

const Pickup = () => {
  const location = useLocation();
  const { state } = location;
  const { id } = state || {};
  const [showModal, setShowModal] = useState(false); // State for controlling modal visibility
  const [pickupLocation, setPickupLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [kilometer, setKilometer] = useState(''); // Define kilometer state
  const [photo, setPhoto] = useState(null); // Initialize photo state variable

  const navigate = useNavigate();
console.log("T8ky",id)
  const db = getFirestore();
  const handleModalClose = () => {
    setShowModal(false);
  };
  const handleSubmit = () => {
    addDoc(collection(db, 'driverdropoff'), {
      photo,
      kilometer,
    }).then((docRef) => {
      navigate(`/customerdata/${docRef.id}`, {
        state: {
          id: id,
        }
      });
    }).catch((error) => {
      console.error('Error adding document: ', error);
    });
  };
  
  useEffect(() => {
    const geolocationOptions = {
      enableHighAccuracy: true, // High accuracy mode
      timeout: 10000, // Timeout after 10 seconds
      maximumAge: 0 // No cache
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLoadingLocation(false);
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
    const checkReachedDestination = () => {
      if (currentLocation && pickupLocation) {
        const google = window.google;
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
          new google.maps.LatLng(pickupLocation.lat, pickupLocation.lng)
        );
        if (distance < 100) {
          alert('Reached destination!');
          // Show the modal
          setShowModal(true);
          // Stop checking for destination
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
  const openGoogleMaps = () => {
    if (pickupLocation) {
      const url = `https://www.google.com/maps/search/?api=1&query=${pickupLocation.lat},${pickupLocation.lng}`;
      window.open(url, '_blank');
    }
  };
  return (
    <div>
      <h1>Pickup Details</h1>

      {loadingLocation ? (
        <p>Loading current location...</p>
      ) : currentLocation ? (
        <>
          {/* <p>ID: {id}</p> */}
          <p>Current Location: {currentLocation.lat}, {currentLocation.lng}</p>
          {pickupLocation && (
            <>
              <p>Pickup Location: {pickupLocation.lat}, {pickupLocation.lng}</p>
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
  <div className="modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', width: '700px', }}>
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


