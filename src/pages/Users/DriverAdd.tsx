import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, getFirestore, doc, updateDoc } from 'firebase/firestore';

const DriverAdd = () => {
    const [driverName, setDriverName] = useState('');
    const [idnumber, setIdnumber] = useState('');

    const [phone, setPhone] = useState('');
    const [personalphone, setPersonalPhone] = useState('');
    const [service, setService] = useState('');
    const [basicSalary, setBasicSalary] = useState('');
    const [salarykm, setSalarykm] = useState('');
    const [editData, setEditData] = useState(null);
    const navigate = useNavigate();
    const db = getFirestore();
    const { state } = useLocation(); // Use the useLocation hook to access location state

    useEffect(() => {
        if (state && state.editData) {
            setEditData(state.editData);
            setDriverName(state.editData.driverName || '');
            setIdnumber(state.editData.idnumber || '');
            setPhone(state.editData.phone || '');
            setPersonalPhone(state.editData.personalphone || '');
            setService(state.editData.service || '');
            setBasicSalary(state.editData.basicSalary || '');
            setSalarykm(state.editData.salarykm || '')

        }
    }, [state]);
    const addOrUpdateItem = async () => {
        try {
            const itemData = {
                driverName,
                idnumber,
                phone,
                personalphone,
                service,
                basicSalary,
                salarykm,
            };

            if (editData) {
                const docRef = doc(db, 'driver', editData.id);
                await updateDoc(docRef, itemData);
                console.log('Document updated');
            } else {
                const docRef = await addDoc(collection(db, 'driver'), itemData);
                console.log('Document written with ID: ', docRef.id);
            }

            navigate('/users/driver');
        } catch (e) {
            console.error('Error adding/updating document: ', e);
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
                                <img src="/assets//images/profile-34.jpeg" alt="img" className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" />
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="driverName">Driver Name</label>
                                    <input id="driverName" type="text" placeholder="Enter driver Name" className="form-input" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="idnumber">ID number</label>
                                    <input id="idnumber" type="idnumber"  className="form-input" value={idnumber} onChange={(e) => setIdnumber(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="phone">Phone</label>
                                    <input id="phone" type="phone" placeholder="" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                

                                <div>
                                    <label htmlFor="personalphone">Personal PhoneNumber</label>
                                    <input id="personalphone" type="personalphone" className="form-input" value={personalphone} onChange={(e) => setPersonalPhone(e.target.value)} />
                                </div>
                                <div>
    <label htmlFor="service">Service Type</label>
    <select
        id="service"
        className="form-input"
        value={service}
        onChange={(e) => setService(e.target.value)}
    >
        <option value="">Select Service Type</option>
        <option value="Flat bed">Flat bed</option>
        <option value="Under Lift">Under Lift</option>
        <option value="Rsr By Car">Rsr By Car</option>
        <option value="Rsr By Bike">Rsr By Bike</option>
        <option value="Custody">Custody</option>
        <option value="Hydra Crane">Hydra Crane</option>
        <option value="Jump start">Jump start</option>
        <option value="Tow Wheeler Fbt">Tow Wheeler Fbt</option>
        <option value="Zero Digri Flat Bed">Zero Digri Flat Bed</option>
        <option value="Undet Lift 407">Undet Lift 407</option>
        <option value="S Lorry Crane Bed">S Lorry Crane Bed</option>
    </select>
</div>

                                <div>
                                    <label htmlFor="basicSalary">Basic Salary</label>
                                    <input id="basicSalary" placeholder="Basic Salary" className="form-input" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="salarykm">Salary (KM)</label>
                                    <input id="salarykm" placeholder="Salary per KM" className="form-input" value={salarykm} onChange={(e) => setSalarykm(e.target.value)} />
                                </div>
                                <div className="sm:col-span-2 mt-3">
            <button type="button" className="btn btn-primary" onClick={addOrUpdateItem}>
                {editData ? 'Update' : 'Save'}
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

export default DriverAdd;
