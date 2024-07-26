import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';

const Dropoff = () => {
  const location = useLocation();
  const { state } = location;
  const { id, currentLocation } = state || {};
  console.log("currentLocation",currentLocation)
  const [showModal, setShowModal] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [kilometerdrop, setKilometerdrop] = useState('');
  const [photodrop, setPhotodrop] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState<{ kilometerdrop?: string; photodrop?: string }>({});
  const navigate = useNavigate();
  const db = getFirestore();
  const storage = getStorage();

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

 

  const calculateDistance = (coord1: { latitude: number, longitude: number }, coord2: { latitude: number, longitude: number }): number => {
    const toRadians = (degree: number) => degree * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers

    const lat1 = toRadians(coord1.latitude);
    const lon1 = toRadians(coord1.longitude);
    const lat2 = toRadians(coord2.lat);
    const lon2 = toRadians(coord2.lng);
console.log("lat1",lat1)
console.log("lon1",lon1)

console.log("lat2",lat2)

console.log("lon2",lon2)

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
};

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const bookingDocRef = doc(db, 'bookings', id);
        const bookingSnapshot = await getDoc(bookingDocRef);
        if (bookingSnapshot.exists()) {
          const data = bookingSnapshot.data();
          setStatus(data.status);
          setDropoffLocation(data.dropoffLocation); // Set the dropoffLocation
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    if (id) {
      fetchBookingData();
    }
  }, [id, db]);
  useEffect(() => {
    const checkReachedDestination = () => {
        if (
            currentLocation?.latitude && currentLocation?.longitude &&
            dropoffLocation?.lat && dropoffLocation?.lng
        ) {
            const dist = calculateDistance(currentLocation, dropoffLocation);
            setDistance(dist);
  

          if (dist < 2) {
              (async () => {
                  try {
                      await updateDoc(doc(db, 'bookings', id), {
                          status: 'Reached In Destination'
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

  return () => clearInterval(intervalId);
  }, [currentLocation, dropoffLocation]);

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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Dropoff Details</h2>

      {currentLocation ? (
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700">Current Location:</p>
          <p className="text-gray-600">
            Latitude: <span className="font-semibold">{currentLocation.latitude}</span>, 
            Longitude: <span className="font-semibold">{currentLocation.longitude}</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Fetching current location...</p>
      )}

      {dropoffLocation ? (
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700">Dropoff Location:</p>
          <p className="text-gray-600">{dropoffLocation.name}</p>
          <p className="text-gray-600">
            Latitude: <span className="font-semibold">{dropoffLocation.lat}</span>
          </p>
          <p className="text-gray-600">
            Longitude: <span className="font-semibold">{dropoffLocation.lng}</span>
          </p>
        
        </div>
      ) : (
        <p className="text-gray-500">Dropoff location not available.</p>
      )}

      {distance && (
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700">Distance to Dropoff Location:</p>
          <p className="text-gray-600">
            <span className="font-semibold">{distance}</span> km
          </p>
        </div>
      )}

      <div className="flex justify-center mb-4">
        <button
          className="btn bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={openGoogleMaps}
        >
          Navigate to Dropoff Location
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Dropoff Confirmation</h2>
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
                <button
                  type="button"
                  className="btn bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 ml-2"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropoff;
