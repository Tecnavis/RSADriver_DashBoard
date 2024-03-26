

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const Pickup = () => {
  const location = useLocation();
  const { state } = location;
  const { id } = state || {};
  const [pickupLocation, setPickupLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const navigate = useNavigate();
console.log("T8ky",id)
  const db = getFirestore();

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

          navigate(`/customerdata/${id}`, {
            state:{
              id,
            }
          });
          // window.location.href = '/customerdata';
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
          <p>ID: {id}</p>
          <p>Current Location: {currentLocation.lat}, {currentLocation.lng}</p>
          {pickupLocation && (
            <>
              <p>Pickup Location: {pickupLocation.lat}, {pickupLocation.lng}</p>
              <p>Distance: {distance}</p>
            </>
          )}
          <GoogleMap mapContainerStyle={containerStyle} center={currentLocation || { lat: 0, lng: 0 }} zoom={15}>
            <Marker position={currentLocation} />
            {pickupLocation && <Marker position={pickupLocation} />}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
          <div>         <button className='btn' onClick={openGoogleMaps}>Navigate to Pickup Location</button></div> 

        </>
      ) : (
        <p>Current location not available.</p>
      )}
    </div>
  );
};

export default Pickup;


