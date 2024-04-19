import { useState } from 'react';
import ImageUploading from 'react-images-uploading';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import Resizer from 'react-image-file-resizer'; // Import the image resizer library

const CustomerData = () => {
    const [showModal, setShowModal] = useState(true); // State for controlling modal visibility

    const [customerName, setCustomerName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [rcBookImages, setRcBookImages] = useState([]);
    const [vehicleImages, setVehicleImages] = useState([]);
    const [errors, setErrors] = useState({});

    const maxNumber = 6;
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { id } = state || {};

    console.log('T8', id);
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        if (!customerName.trim()) {
            tempErrors['customerName'] = 'Customer name is required';
            isValid = false;
        }
        if (!email) {
            tempErrors['email'] = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            tempErrors['email'] = 'Email address is invalid';
            isValid = false;
        }
        if (!phone.trim()) {
            tempErrors['phone'] = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            tempErrors['phone'] = 'Phone number is invalid, must be 10 digits';
            isValid = false;
        }
        if (!vehicleNumber.trim()) {
            tempErrors['vehicleNumber'] = 'Vehicle number is required';
            isValid = false;
        }
        if (rcBookImages.length === 0) {
            tempErrors['rcBookImages'] = 'At least one RC book image is required';
            isValid = false;
        }
        if (vehicleImages.length === 0) {
            tempErrors['vehicleImages'] = 'At least one vehicle image is required';
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };
    const handleCustomerNameChange = (event) => {
        setCustomerName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePhoneChange = (event) => {
        setPhone(event.target.value);
    };

    const handleVehicleNumberChange = (event) => {
        setVehicleNumber(event.target.value);
    };

    const handleRcBookImagesChange = (imageList) => {
        console.log('New RC Book Images:', imageList);
        setRcBookImages(imageList);
    };

    const handleVehicleImagesChange = (imageList) => {
        console.log('New Vehicle Images:', imageList);
        setVehicleImages(imageList);
    };

    const resizeImages = async (images) => {
        const resizedImages = [];
        const maxSize = 300; // Set maximum width or height for the resized images (adjust as needed)

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
        if (validateForm()) {
            try {
                // Resize RC Book Images
                const resizedRcBookImages = await resizeImages(rcBookImages);
                // Resize Vehicle Images
                const resizedVehicleImages = await resizeImages(vehicleImages);
    
                // Construct customer data object
                const customerData = {
                    customerName,
                    email,
                    phone,
                    vehicleNumber,
                    rcBookImageURLs: resizedRcBookImages.map(image => image.dataURL),
                    vehicleImageURLs: resizedVehicleImages.map(image => image.dataURL),
                    status: 'To DropOff Location' // Assuming you want to update the status as well
                };
    
                // Update the booking in the Firestore
                const db = getFirestore();
                const bookingRef = doc(db, 'bookings', id);
    
                await updateDoc(bookingRef, customerData);
    
                // Clear form fields after successful submission
                setCustomerName('');
                setEmail('');
                setPhone('');
                setVehicleNumber('');
                setRcBookImages([]);
                setVehicleImages([]);
    
                // Navigate to Dropoff page
                navigate(`/dropoff/${id}`, {
                    state: {
                        id,
                    },
                });
            } catch (error) {
                console.error('Error updating document: ', error);
            }
        }
    };
    
    const inputStyle = {
        padding: '0.5rem',
        fontSize: '1rem',
        width: '100%',
        maxWidth: '20rem',
        margin: '0 auto',
        boxSizing: 'border-box',
    };
    const errorStyle = {
        color: 'red',
        fontSize: '0.8rem',
    };
    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
    };
    const removeButtonStyle = {
        position: 'absolute', 
        top: '0.5rem', 
        right: '0.5rem', 
        padding: '0.25rem', 
        backgroundColor: 'red', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '50%', 
        cursor: 'pointer'
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Customer Data</h1>
            <div style={{ margin: '30px auto', maxWidth: '700px', width: '90%', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>Customer Name:</label>
                    <input type="text" value={customerName} onChange={handleCustomerNameChange} style={inputStyle} />
                    {errors.customerName && <p style={errorStyle}>{errors.customerName}</p>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        style={{
                            padding: '0.5rem',
                            fontSize: '1rem',
                            width: '100%',
                            maxWidth: '20rem',
                            margin: '0 auto',
                            boxSizing: 'border-box',
                        }}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>Phone:</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        style={{
                            padding: '0.5rem',
                            fontSize: '1rem',
                            width: '100%', // Ensure the input takes up the full width
                            maxWidth: '20rem', // Limit the maximum width to maintain readability
                            margin: '0 auto', // Center the input horizontally
                            boxSizing: 'border-box', // Include padding and border in the width
                        }}
                    />
                    {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Vehicle Number:</label>
                    <input
                        type="text"
                        value={vehicleNumber}
                        onChange={handleVehicleNumberChange}
                        style={{
                            padding: '0.5rem',
                            fontSize: '1rem',
                            width: '100%',
                            maxWidth: '20rem',
                            margin: '0 auto',
                            boxSizing: 'border-box',
                        }}
                    />
                    {errors.vehicleNumber && <p style={errorStyle}>{errors.vehicleNumber}</p>}
                </div>
                <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Upload RC Book Images:</label>
        <ImageUploading multiple={true} value={rcBookImages} onChange={handleRcBookImagesChange} maxNumber={maxNumber} dataURLKey="dataURL">
            {({ imageList, onImageUpload, onImageRemove }) => (
                <div>
                    <button
                        style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none', marginBottom: '0.5rem' }}
                        onClick={onImageUpload}
                    >
                        Upload RC Book Images
                    </button>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                        {imageList.map((image, index) => (
                            <div key={index} style={{ width: 'calc(33.333% - 10px)', margin: '5px', position: 'relative' }}>
                                <img src={image.dataURL} alt={`RC Book Image ${index}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                <button
                                                                      style={{ position: 'absolute', top: '0.15rem', right: '0.15rem', padding: '0.2rem', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '25%', cursor: 'pointer' }}

                                    onClick={() => onImageRemove(index)}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.rcBookImages && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.rcBookImages}</p>}
                </div>
            )}
        </ImageUploading>

        <label style={{ fontSize: '1.2rem', marginRight: '1.5rem', marginTop: '1rem' }}>Upload Vehicle Images:</label>
        <ImageUploading multiple={true} value={vehicleImages} onChange={handleVehicleImagesChange} maxNumber={maxNumber} dataURLKey="dataURL">
            {({ imageList, onImageUpload, onImageRemove }) => (
                <div>
                    <button
                        style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none', marginBottom: '0.5rem' }}
                        onClick={onImageUpload}
                    >
                        Upload Vehicle Images
                    </button>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                        {imageList.map((image, index) => (
                            <div key={index} style={{ width: 'calc(33.333% - 10px)', margin: '5px', position: 'relative' }}>
                                <img src={image.dataURL} alt={`Vehicle Image ${index}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                <button
                                                                   style={{ position: 'absolute', top: '0.15rem', right: '0.15rem', padding: '0.2rem', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '25%', cursor: 'pointer' }}

                                    onClick={() => onImageRemove(index)}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                    {errors.vehicleImages && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.vehicleImages}</p>}
                </div>
            )}
        </ImageUploading>
                <button style={{ ...buttonStyle, marginTop: '1rem' }} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    );
};

export default CustomerData;
