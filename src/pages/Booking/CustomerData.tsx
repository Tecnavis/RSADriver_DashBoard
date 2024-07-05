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
        // if (rcBookImages.length === 0) {
        //     tempErrors['rcBookImages'] = 'At least one RC book image is required';
        //     isValid = false;
        // }
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
    
   
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Customer Data</h1>
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Customer Name:</label>
                    <input 
                        type="text" 
                        value={customerName} 
                        onChange={handleCustomerNameChange} 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Email:</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Phone:</label>
                    <input 
                        type="tel" 
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Vehicle Number:</label>
                    <input 
                        type="text" 
                        value={vehicleNumber}
                        onChange={handleVehicleNumberChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.vehicleNumber && <p className="text-red-500 text-sm mt-1">{errors.vehicleNumber}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Upload RC Book Images (Optional):</label>
                    <ImageUploading multiple value={rcBookImages} onChange={handleRcBookImagesChange} maxNumber={maxNumber} dataURLKey="dataURL">
                        {({ imageList, onImageUpload, onImageRemove }) => (
                            <div>
                               <button 
    onClick={onImageUpload} 
    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none mb-2"
>
    Upload RC Book Images
</button>

                                <div className="flex flex-wrap">
                                    {imageList.map((image, index) => (
                                        <div key={index} className="relative w-1/3 p-2">
                                            <img src={image.dataURL} alt={`RC Book Image ${index}`} className="w-full h-auto rounded-lg" />
                                            <button 
                                                onClick={() => onImageRemove(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 focus:outline-none"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ImageUploading>
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Upload Vehicle Images:</label>
                    <ImageUploading multiple value={vehicleImages} onChange={handleVehicleImagesChange} maxNumber={maxNumber} dataURLKey="dataURL">
                        {({ imageList, onImageUpload, onImageRemove }) => (
                            <div>
                                <button 
                                    onClick={onImageUpload} 
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none mb-2"
                                >
                                    Upload Vehicle Images
                                </button>
                                <div className="flex flex-wrap">
                                    {imageList.map((image, index) => (
                                        <div key={index} className="relative w-1/3 p-2">
                                            <img src={image.dataURL} alt={`Vehicle Image ${index}`} className="w-full h-auto rounded-lg" />
                                            <button 
                                                onClick={() => onImageRemove(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 focus:outline-none"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.vehicleImages && <p className="text-red-500 text-sm mt-1">{errors.vehicleImages}</p>}
                            </div>
                        )}
                    </ImageUploading>
                </div>

                <button 
                    onClick={handleSubmit}
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default CustomerData;
