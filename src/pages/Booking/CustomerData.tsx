
import { useState } from 'react';
import ImageUploading from 'react-images-uploading';
import { addDoc, collection } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import Resizer from 'react-image-file-resizer'; // Import the image resizer library

const CustomerData = () => {
    const [customerName, setCustomerName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [rcBookImages, setRcBookImages] = useState([]);
    const [vehicleImages, setVehicleImages] = useState([]);
    const maxNumber = 6; 
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { id } = state || {};

    console.log("T8",id)
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
        console.log("New RC Book Images:", imageList);
        setRcBookImages(imageList);
    };
    
    const handleVehicleImagesChange = (imageList) => {
        console.log("New Vehicle Images:", imageList);
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
            vehicleImageURLs: resizedVehicleImages.map(image => image.dataURL)
        };

        // Add customer data to Firestore
        const db = getFirestore();
        const docRef = await addDoc(collection(db, 'customerdata'), customerData);

        // Clear form fields after successful submission
        setCustomerName('');
        setEmail('');
        setPhone('');
        setVehicleNumber('');
        setRcBookImages([]);
        setVehicleImages([]);

        // Navigate to Dropoff page
        navigate(`/dropoff/${docRef.id}`, {
            state: {
                id,
            }
        });
    } catch (error) {
        console.error('Error adding document: ', error);
    }
};



    return (
        <div style={{ textAlign: 'center' }}>
    <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Customer Data</h1>
    {/* <div className="modal" style={{, backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', width: '700px', maxHeight: '80vh', overflowY: 'auto' }}> */}

    <div style={{marginTop:"30px", marginLeft: "100px", marginRight: "100px", marginBottom: "100px", display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)'}}>
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>Customer Name:</label>
            <input type="text" value={customerName} onChange={handleCustomerNameChange} style={{ padding: '0.5rem', fontSize: '1rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Email:</label>
            <input type="email" value={email} onChange={handleEmailChange} style={{ padding: '0.5rem', fontSize: '1rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>Phone:</label>
            <input type="tel" value={phone} onChange={handlePhoneChange} style={{ padding: '0.5rem', fontSize: '1rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Vehicle Number:</label>
            <input type="text" value={vehicleNumber} onChange={handleVehicleNumberChange} style={{ padding: '0.5rem', fontSize: '1rem' }} />
        </div>
        <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Upload RC Book Images:</label>
                <ImageUploading
                    multiple={true}
                    value={rcBookImages}
                    onChange={handleRcBookImagesChange}
                    maxNumber={maxNumber}
                    dataURLKey="dataURL" // specify dataURL key for dataURL
                >
                    {({ imageList, onImageUpload, onImageRemove }) => (
                        <div>
                            <button
                                style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none', marginBottom: '0.5rem' }}
                                onClick={onImageUpload}
                            >
                                Upload RC Book Images
                            </button>
                            {imageList.map((image, index) => (
    <div key={index} style={{ marginBottom: '0.5rem' }}>
        <img src={image.dataURL} alt={`RC Book Image ${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
        <button
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.5rem', backgroundColor: 'red', color: '#fff', border: 'none', marginLeft: '0.5rem', cursor: 'pointer' }}
            onClick={() => {
                console.log("Removing image at index:", index);
                onImageRemove(index);
            }}
        >
            Remove
        </button>
    </div>
))}
                        </div>
                    )}
                </ImageUploading>

                <label style={{ fontSize: '1.2rem', marginRight: '1.5rem' }}>Upload Vehicle Images:</label>
                <ImageUploading
                    multiple={true}
                    value={vehicleImages}
                    onChange={handleVehicleImagesChange}
                    maxNumber={maxNumber}
                    dataURLKey="dataURL" // specify dataURL key for dataURL
                >
                    {({ imageList, onImageUpload, onImageRemove }) => (
                        <div>
                            <button
                                style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#007bff', color: '#fff', border: 'none', marginBottom: '0.5rem' }}
                                onClick={onImageUpload}
                            >
                                Upload Vehicle Images
                            </button>
                            {imageList.map((image, index) => (
                                <div key={index} style={{ marginBottom: '0.5rem' }}>
                                    <img src={image.dataURL} alt={`Vehicle Image ${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                    <button
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.5rem', backgroundColor: 'red', color: '#fff', border: 'none', marginLeft: '0.5rem', cursor: 'pointer' }}
                                        onClick={() => onImageRemove(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ImageUploading>
                <button style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '0.5rem', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '1rem' }} onClick={handleSubmit}>Submit</button>
    </div>
</div>
    );
};

export default CustomerData;