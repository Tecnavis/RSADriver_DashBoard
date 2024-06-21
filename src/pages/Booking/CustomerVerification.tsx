import React, { useState } from 'react';
import ImageUploading from 'react-images-uploading';
import Resizer from 'react-image-file-resizer';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomerVerification = () => {
    const [vehicleImages, setVehicleImages] = useState([]);
    const [fuelBillImages, setFuelBillImages] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState(''); // New state for payment status
    const [amount, setAmount] = useState(''); // New state for amount
    const [fuelBillAmount, setFuelBillAmount] = useState(''); // New state for fuel bill amount
    const maxNumber = 6;
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { id } = state || {};
    console.log("first", id)
    const [showMessage, setShowMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleVehicleImagesChange = (imageList) => {
        setVehicleImages(imageList);
    };

    const handleFuelBillImagesChange = (imageList) => {
        setFuelBillImages(imageList);
    };

    const resizeImages = async (images) => {
        const resizedImages = [];
        const maxSize = 300;

        for (const image of images) {
            const resizedImage = await new Promise((resolve) => {
                Resizer.imageFileResizer(
                    image.file,
                    maxSize,
                    maxSize,
                    'JPEG',
                    100,
                    0,
                    (uri) => {
                        resolve({ dataURL: uri });
                    },
                    'base64'
                );
            });
            resizedImages.push(resizedImage);
        }

        return resizedImages;
    };

    const handleSubmit = async () => {
        if (vehicleImages.length === 0 || fuelBillImages.length === 0 || !paymentStatus || !amount || !fuelBillAmount) {
            setErrorMessage('Please upload all required images and fill in all fields before submitting.');
            return;
        }

        setErrorMessage('');  // Clear any existing error messages

        try {
            // Resize images
            const resizedFuelBillImages = await resizeImages(fuelBillImages);
            const resizedVehicleImages = await resizeImages(vehicleImages);

            // Extract data URLs from resized images
            const fuelBillImageURLs = resizedFuelBillImages.map(image => image.dataURL);
            const vehicleImgURLs = resizedVehicleImages.map(image => image.dataURL);

            const db = getFirestore();

            // Assuming 'bookingId' is available and represents the ID of the current booking
            const bookingDocRef = doc(db, 'bookings', id);

            // Update the booking document with new image URLs, payment status, amount, and fuel bill amount
            await updateDoc(bookingDocRef, {
                status: 'Order Completed',
                fuelBillImageURLs: fuelBillImageURLs,
                vehicleImgURLs: vehicleImgURLs,
                paymentStatus: paymentStatus, // Include payment status in the update
                amount: amount, // Include amount in the update
                fuelBillAmount: fuelBillAmount // Include fuel bill amount in the update
            });

            // Clear the state for images
            setFuelBillImages([]);
            setVehicleImages([]);
            setPaymentStatus('');
            setAmount('');
            setFuelBillAmount('');

            // Show confirmation message and redirect after a delay
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                navigate('/index'); // Assuming 'navigate' is properly imported from 'react-router-dom'
            }, 3000);
        } catch (error) {
            console.error('Error updating booking document: ', error);
            setErrorMessage('Failed to update booking. Please try again.');
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>Customer Verification</h1>
            {errorMessage && (
                <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
            )}
            <div style={{ marginTop: "30px", marginLeft: "auto", marginRight: "auto", maxWidth: "500px", marginBottom: "100px", display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <label style={{ fontSize: '1.2rem', marginRight: '1rem' }}>Upload Vehicle Images:</label>
                    <ImageUploading multiple value={vehicleImages} onChange={handleVehicleImagesChange} maxNumber={maxNumber}>
                        {({ imageList, onImageUpload, onImageRemove }) => (
                            <div>
                                <button style={{ padding: '0.5rem 1rem', fontSize: '1rem', marginRight: '1rem', borderRadius: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none' }} onClick={onImageUpload}>Upload Vehicle Images</button>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                    {imageList.map((image, index) => (
                                        <div key={index} style={{ width: 'calc(33.333% - 1rem)', margin: '0.5rem', position: 'relative' }}>
                                            <img src={image.dataURL} alt={`Vehicle Image ${index}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                            <button
                                                style={{ position: 'absolute', top: '0.15rem', right: '0.15rem', padding: '0.2rem', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '25%', cursor: 'pointer' }}
                                                onClick={() => onImageRemove(index)}>X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ImageUploading>

                    <label style={{ fontSize: '1.2rem', marginRight: '1rem' }}>Upload Fuel Bill Images:</label>
                    <ImageUploading multiple value={fuelBillImages} onChange={handleFuelBillImagesChange} maxNumber={maxNumber}>
                        {({ imageList, onImageUpload, onImageRemove }) => (
                            <div>
                                <button style={{ padding: '0.5rem 1rem', fontSize: '1rem', marginRight: '1rem', borderRadius: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none' }} onClick={onImageUpload}>Upload Fuel Bill Images</button>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                    {imageList.map((image, index) => (
                                        <div key={index} style={{ width: 'calc(33.333% - 1rem)', margin: '0.5rem', position: 'relative' }}>
                                            <img src={image.dataURL} alt={`Fuel Bill Image ${index}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                            <button
                                                style={{ position: 'absolute', top: '0.15rem', right: '0.15rem', padding: '0.2rem', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '25%', cursor: 'pointer' }}
                                                onClick={() => onImageRemove(index)}
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ImageUploading>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <label style={{ fontSize: '1.2rem', marginRight: '1rem' }}>Payment Status:</label>
                        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}>
                            <option value="" disabled>Select Payment Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Not Paid">Not Paid</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <label style={{ fontSize: '1.2rem', marginRight: '1rem' }}>Paid Amount:</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <label style={{ fontSize: '1.2rem', marginRight: '1rem' }}>Fuel Bill Amount:</label>
                        <input type="number" value={fuelBillAmount} onChange={(e) => setFuelBillAmount(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                    </div>
                </div>

                <button style={{ padding: '0.75rem 1.5rem', fontSize: '1.2rem', borderRadius: '0.5rem', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={handleSubmit}>Submit</button>
            </div>

            {showMessage && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg text-center text-2xl font-semibold">Operation Completed</div>
                </div>
            )}
        </div>
    );
};

export default CustomerVerification;
