// src/components/GoogleMapComponent.tsx

import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { googleMapsApiKey } from '../../config/config'; // Make sure you have the API key in your config

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 0, // Default latitude
  lng: 0  // Default longitude
};

const GoogleMapComponent = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error('Error getting current location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    getCurrentLocation();
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentLocation || defaultCenter}
      zoom={15}
    >
      {currentLocation && <Marker position={currentLocation} />}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
