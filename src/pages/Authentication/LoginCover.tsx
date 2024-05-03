import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, getFirestore, doc, updateDoc, GeoPoint, setDoc, getDoc, addDoc } from "firebase/firestore";
import IconLockDots from '../../components/Icon/IconLockDots';
import IconPhone from '../../components/Icon/IconPhone';

const LoginCover = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const db = getFirestore();
console.log("pho",phone)
    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedIn');
        if (loggedIn === 'true') {
            navigate('/bookings/newbooking');
        }
    }, []);

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ latitude, longitude });
                console.log('Current Location:', { latitude, longitude });
                console.log('Phone:', phone); // Log the phone variable
    
                if (phone) {
                    try {
                        const driverRef = doc(db, 'driver', phone);
                        await updateDoc(driverRef, {
                            currentLocation: new GeoPoint(latitude, longitude)
                        });
                        console.log('Driver location updated successfully for phone:', phone);
                    } catch (error) {
                        console.error('Error updating driver location:', error);
                    }
                } else {
                    console.error('Error updating driver location: Phone number is missing.');
                }
            },
            (error) => {
                console.error('Error getting current location:', error);
            }
        );
    
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [phone]);
    
    const updateDriverLocation = async (phone, location) => {
        try {
            if (!phone) {
                console.error('Error updating driver location: Phone number is missing.');
                return;
            }
    
            const driverRef = doc(db, 'driver', phone);
            const bookingRef = collection(db, 'bookings');
    
            // Update driver location in the driver collection
            await updateDoc(driverRef, {
                currentLocation: new GeoPoint(location.latitude, location.longitude)
            });
            console.log('Driver location updated successfully:', location); // Log the updated location
    
            // Add current location to the bookings collection
            await addDoc(bookingRef, {
                driverId: phone,
                location: new GeoPoint(location.latitude, location.longitude),
                timestamp: new Date()
            });
            console.log('Current location added to bookings successfully:', location);
        } catch (error) {
            console.error('Error updating driver location:', error);
        }
    };
    
const getLocationAndUpdate = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            console.log('Current Location:', { latitude, longitude });
    
            // Add or update current location in driver database
            if (phone) {
                updateDriverLocation(phone, { latitude, longitude });
            } else {
                console.error('Error updating driver location: Phone number is missing.');
            }
        },
        (error) => {
            console.error('Error getting current location:', error);
        }
    );
};

const signIn = async (e) => {
    e.preventDefault();
    try {
        const q = query(collection(db, 'driver'), where('phone', '==', phone), where('password', '==', password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            localStorage.setItem('phone', phone);
            if (keepLoggedIn) {
                localStorage.setItem('loggedIn', 'true');
            }
            // Get current location
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ latitude, longitude });
                    console.log('Current Location:', { latitude, longitude });

                    // Add or update current location in driver database
                    const driverRef = doc(db, 'driver', phone);
                    await updateDoc(driverRef, {
                        currentLocation: new GeoPoint(latitude, longitude)
                    });
                    console.log('Driver location updated successfully.');

                    // Redirect to new booking page
                    navigate(`/bookings/newbooking?phone=${phone}&password=${password}`);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                }
            );
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        console.error('Error signing in:', error);
    }
};

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
                    <div
                        className="relative hidden w-full items-center justify-center p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]"
                        style={{ background: 'linear-gradient(225deg, rgba(255, 255, 255, 1) 0%, rgba(255, 0, 0, 1) 100%)' }}
                    >
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                            <Link to="/" className="w-48 block lg:w-72 ms-10">
                                <img src="/assets/images/auth/rsa-png.png" alt="log" className="w-full" />
                            </Link>
                            <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                                <img src="/assets/images/auth/login.svg" alt="Cover Image" className="w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-danger md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={signIn}>
                                <div>
                                    <label htmlFor="phone">PhoneNumber</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="phone"
                                            type="phone"
                                            placeholder="Enter Phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="form-input ps-10 placeholder:text-white-dark"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconPhone fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="Password"
                                            type="password"
                                            placeholder="Enter Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="form-input ps-10 placeholder:text-white-dark"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn !mt-6 w-full border-0 uppercase text-white shadow-[0_10px_20px_-10px_rgba(255, 0, 0, 0.44)]"
                                    style={{
                                        background: 'linear-gradient(2deg, rgba(255, 255, 255, 1) 0%, rgba(255, 0, 0, 1) 100%)',
                                    }}
                                >
                                    {' '}
                                    Sign in
                                </button>
                            </form>

                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                            </div>
                        </div>
                        <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()}.Tecnavis All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginCover;
