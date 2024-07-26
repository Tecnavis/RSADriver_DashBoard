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
    const { currentLocation } = location.state || {};
    const { state } = location;
    const { id, pickupLocation, customerName } = state || {};
    console.log("currentLocationpick",currentLocation)
    const [showModal, setShowModal] = useState(false); 
    const [kilometer, setKilometer] = useState(''); 
    const [photo, setPhoto] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState<{ kilometer?: string; photo?: string }>({});
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
                    currentLocation: currentLocation 
                }
            });
        } catch (error) {
            console.error('Error updating document or uploading photo: ', error);
        }
    };

    

    const openGoogleMaps = async () => {
        if (pickupLocation && pickupLocation.lat && pickupLocation.lng) {
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
        const checkReachedDestination = () => {
            if (
                currentLocation?.latitude && currentLocation?.longitude &&
                pickupLocation?.lat && pickupLocation?.lng
            ) {
                const dist = calculateDistance(currentLocation, pickupLocation);
                setDistance(dist);
    
                if (dist < 2) {
                    (async () => {
                        try {
                            await updateDoc(doc(db, 'bookings', id), {
                                status: 'Vehicle Confirmed'
                            });
                            alert('Reached destination!');
                            setShowModal(true);
                            setErrors({});
                            clearInterval(intervalId);
                        } catch (error) {
                            console.error('Error updating status:', error);
                        }
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
    {currentLocation?.latitude && currentLocation?.longitude ? (
        <p className="text-gray-700">
            Latitude: <span className="font-semibold">{currentLocation.latitude}</span>, 
            Longitude: <span className="font-semibold">{currentLocation.longitude}</span>
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
                                    onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                                    className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.photo && <p className="text-red-500 text-xs italic mt-1">{errors.photo}</p>}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-4"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pickup;
