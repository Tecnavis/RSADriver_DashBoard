import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFirestore, query, collection, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'; // Import Firebase storage functions
import { storage } from '../../config/config';

const AccountSettings = () => {
    const phone = localStorage.getItem('phone');
    const [driverName, setDriverName] = useState('');
    const [personalphone, setPersonalPhone] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null); // State to store profile image file
    const [loading, setLoading] = useState(false);
  
    const navigate = useNavigate();
    const db = getFirestore();
    
    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                const q = query(collection(db, 'driver'), where('phone', '==', phone));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    setDriverName(data.driverName);
                    setPersonalPhone(data.personalphone);
                    setProfileImageUrl(data.profileImageUrl); // Set profile image URL
                });
            } catch (error) {
                console.error('Error fetching driver data:', error);
            }
        };
        
        if (phone) {
            fetchDriverData();
        }
    }, [db, phone]);
    
    
    const handleChangeDriverName = (e) => {
        setDriverName(e.target.value);
    };
    
    const handleChangePersonalPhone = (e) => {
        setPersonalPhone(e.target.value);
    };

    const handleProfileImageChange = (e) => {
        setProfileImageUrl(e.target.files[0]);
    };
    
    const addOrUpdateItem = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'driver'), where('phone', '==', phone));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, {
                    driverName: driverName,
                    personalphone: personalphone,
                    profileImageUrl:profileImageUrl
                });
            });

            if (profileImageUrl) {
                const storageRef = ref(storage, `profile_images/${phone}/${profileImageUrl.name}`);
                                await uploadBytes(storageRef, profileImageUrl);
                                const imageUrl = await getDownloadURL(storageRef);
                                querySnapshot.forEach(async (doc) => {
                    await updateDoc(doc.ref, { profileImageUrl: imageUrl });
                });
            }

            setLoading(false);
            console.log('Data updated successfully');
            navigate('/users/profile');
        } catch (error) {
            setLoading(false);
            console.error('Error updating driver data:', error);
        }
    };
    
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Users
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Driver Account Settings</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Driver Details</h5>
                </div>
                <div></div>

                <div>
                    <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
                        <h6 className="text-lg font-bold mb-5">General Information</h6>
                        <div className="flex flex-col sm:flex-row">
                        <div className="ltr:sm:mr-4 rtl:sm:ml-4 w-full sm:w-2/12 mb-5">
    <img 
        src={profileImageUrl instanceof Blob ? URL.createObjectURL(profileImageUrl) : (profileImageUrl || "/assets//images/profile-34.jpeg")} 
        alt="Profile" 
        className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" 
    />
    <input type="file" accept="image/*" onChange={handleProfileImageChange} className="mt-2" />
</div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="driverName">Driver Name</label>
                                    <input id="driverName" type="text" placeholder="Enter driver Name" className="form-input" value={driverName} onChange={handleChangeDriverName} />
                                </div>
                                <div>
                                    <label htmlFor="personalphone">Personal PhoneNumber</label>
                                    <input id="personalphone" type="text" className="form-input" value={personalphone} onChange={handleChangePersonalPhone} />
                                </div>

                                <div className="sm:col-span-2 mt-3">
                                    <button className="btn btn-primary" onClick={addOrUpdateItem} disabled={loading}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
