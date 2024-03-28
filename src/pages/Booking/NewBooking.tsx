import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDoc, getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';

type RecordData = {
  index: number;
  customerName: string;
  pickupLocation: { placename: string; lat: number; lng: number };
  phoneNumber: string;
  totalSalary: string;
  lat: number; 
  lng: number
  id: string;
};

const NewBooking = () => {
  const [recordsData, setRecordsData] = useState<RecordData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [kilometer, setKilometer] = useState('');
  const [photo, setPhoto] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<RecordData | null>(null);

  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));

        const dataWithIndex = await Promise.all(querySnapshot.docs.map(async (doc, index) => {
          const bookingData = doc.data();
          const pickupLocation = bookingData.pickupLocation;
          const lat = pickupLocation.lat;
          const lng = pickupLocation.lng;
          const totalSalary = bookingData.totalSalary;
          const pickupResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pickupLocation.lat},${pickupLocation.lng}&key=AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc`);
          const pickupData = await pickupResponse.json();
          const pickupPlacename = pickupData.results[0].formatted_address;
          if (!lat || !lng) {
            throw new Error('Invalid pickup location');
          }
          return {
            index: index + 2000,
            ...bookingData,
            id: doc.id,
            totalSalary,
            pickupLocation: { placename: pickupPlacename },
            lat,
            lng
          };
        }));
        setRecordsData(dataWithIndex);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData().catch(console.error);
  }, [db]);

  const handleOkClick = async (booking: RecordData) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleRejectClick = (id: string) => {
  };

  const handleModalClose = () => {
    setShowModal(false);
    setKilometer('');
    setPhoto('');
  };

  const handleSubmit = async () => {
    try {
      const { customerName, pickupLocation, phoneNumber, totalSalary, id } = selectedBooking || {};
      const docRef = await addDoc(collection(db, 'driverpickup'), {
          photo,
          kilometer,
      });
      navigate(`/pickup/${docRef.id}`, {
          state: {
              pickupLocation: {
                  placename: pickupLocation.placename || null,
                  lat: pickupLocation.lat,
                  lng: pickupLocation.lng,
              },
              customerName,
              id,
              totalSalary,
          },
      });
    } catch (error) {
        console.error('Error adding document: ', error);
    }
  };

  return (
    <div>
      <div className="panel mt-6">
        <h5 className="font-semibold text-lg dark:text-white-light mb-5">New Bookings</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {recordsData.map((booking, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">{booking.customerName}</h2>
              <p>Phone Number: {booking.phoneNumber}</p>
              <p>Pickup Location: {booking.pickupLocation.placename}</p>
              <p>Total Salary: {booking.totalSalary}</p>
              <div className="mt-4 flex justify-end">
                <button className="btn btn-success mr-2" onClick={() => handleOkClick(booking)}>
                  OK
                </button>
                <button className="btn btn-danger" onClick={() => handleRejectClick(booking.id)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default NewBooking;
