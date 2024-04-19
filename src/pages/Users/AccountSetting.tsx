// import { Link } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { setPageTitle } from '../../store/themeConfigSlice';
// import { useDispatch } from 'react-redux';

// const AccountSetting = () => {
//     const dispatch = useDispatch();
//     useEffect(() => {
//         dispatch(setPageTitle('Account Setting'));
//     });
   

//     return (
//         <div>
//             <ul className="flex space-x-2 rtl:space-x-reverse">
//                 <li>
//                     <Link to="#" className="text-primary hover:underline">
//                         Users
//                     </Link>
//                 </li>
//                 <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
//                     <span>Account Settings</span>
//                 </li>
//             </ul>
//             <div className="pt-5">
//                 <div className="flex items-center justify-between mb-5">
//                     <h5 className="font-semibold text-lg dark:text-white-light">Settings</h5>
//                 </div>
//                 <div>
                
//                 </div>
              
//                     <div>
//                         <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black">
//                             <h6 className="text-lg font-bold mb-5">General Information</h6>
//                             <div className="flex flex-col sm:flex-row">
//                                 <div className="ltr:sm:mr-4 rtl:sm:ml-4 w-full sm:w-2/12 mb-5">
//                                     <img src="/assets//images/profile-34.jpeg" alt="img" className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" />
//                                 </div>
//                                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
//                                     <div>
//                                         <label htmlFor="name">Full Name</label>
//                                         <input id="name" type="text" placeholder="Jimmy Turner" className="form-input" />
//                                     </div>
//                                     <div>
//                                         <label htmlFor="profession">Profession</label>
//                                         <input id="profession" type="text" placeholder="Web Developer" className="form-input" />
//                                     </div>
//                                     <div>
//                                         <label htmlFor="country">Country</label>
//                                         <select defaultValue="United States" id="country" className="form-select text-white-dark">
//                                             <option value="All Countries">All Countries</option>
//                                             <option value="United States">United States</option>
//                                             <option value="India">India</option>
//                                             <option value="Japan">Japan</option>
//                                             <option value="China">China</option>
//                                             <option value="Brazil">Brazil</option>
//                                             <option value="Norway">Norway</option>
//                                             <option value="Canada">Canada</option>
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label htmlFor="address">Address</label>
//                                         <input id="address" type="text" placeholder="New York" className="form-input" />
//                                     </div>
//                                     <div>
//                                         <label htmlFor="location">Location</label>
//                                         <input id="location" type="text" placeholder="Location" className="form-input" />
//                                     </div>
//                                     <div>
//                                         <label htmlFor="phone">Phone</label>
//                                         <input id="phone" type="text" placeholder="+1 (530) 555-12121" className="form-input" />
//                                     </div>
//                                     <div>
//                                         <label htmlFor="email">Email</label>
//                                         <input id="email" type="email" placeholder="Jimmy@gmail.com" className="form-input" />
//                                     </div>
                                   
//                                     <div>
//                                         <label className="inline-flex cursor-pointer">
//                                             <input type="checkbox" className="form-checkbox" />
//                                             <span className="text-white-dark relative checked:bg-none">Make this my default address</span>
//                                         </label>
//                                     </div>
//                                     <div className="sm:col-span-2 mt-3">
//                                         <button type="button" className="btn btn-primary">
//                                             Save
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </form>
                       
//                     </div>
              
              
              
//             </div>
//         </div>
//     );
// };

// export default AccountSetting;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, getFirestore, doc, updateDoc } from 'firebase/firestore';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconPlusCircle from '../../components/Icon/IconPlusCircle';

const AccountSettings = () => {
    const [driverName, setDriverName] = useState('');
    const [idnumber, setIdnumber] = useState('');

    const [phone, setPhone] = useState('');
    const [personalphone, setPersonalPhone] = useState('');
    const [salaryPerKm, setSalaryPerKm] = useState({});
    const [basicSalaryKm, setBasicSalaryKm] = useState({});
    const [editData, setEditData] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [basicSalaries, setBasicSalaries] = useState({}); // Ensure basicSalaries is defined here

    const serviceOptions = [
        "", // Default empty option
        "Flat bed",
        "Under Lift",
        "Rsr By Car",
        "Rsr By Bike",
        "Custody",
        "Hydra Crane",
        "Jump start",
        "Tow Wheeler Fbt",
        "Zero Digri Flat Bed",
        "Undet Lift 407",
        "S Lorry Crane Bed"
    ];


    const handleBasicSalaryChange = (service, e) => {
        const updatedSalaries = { ...basicSalaries, [service]: e.target.value };
        setBasicSalaries(updatedSalaries);
    };
    const handleBasicSalaryKmChange = (service, e) => {
        const updatedKm = { ...basicSalaryKm, [service]: e.target.value };
        setBasicSalaryKm(updatedKm);
    };
    const handleSalaryPerKmChange = (service, e) => {
        const updatedsalaryPerKm = { ...salaryPerKm, [service]: e.target.value };
        setSalaryPerKm(updatedsalaryPerKm);
    };
    const renderServiceOptions = () => {
        return (
            <div>
                {serviceOptions.map((option, index) => (
                    <label key={index} className="inline-flex items-center space-x-2">
                        <input
                            type="checkbox"
                            value={option}
                            checked={selectedServices.includes(option)}
                            onChange={(e) => handleCheckboxChange(e.target.value, e.target.checked)}
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        );
    };

    const handleCheckboxChange = (value, isChecked) => {
        if (isChecked) {
            setSelectedServices([...selectedServices, value]);
        } else {
            setSelectedServices(selectedServices.filter(service => service !== value));
        }
    };
   
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
            setSalaryPerKm(state.editData.salaryPerKm || '');
            setBasicSalaryKm(state.editData.basicSalaryKm || '');

            setSelectedServices(state.editData.selectedServices || '');

            setBasicSalaries(state.editData.basicSalaries || '');

        }
    }, [state]);
    const addOrUpdateItem = async () => {
        try {
            const itemData = {
                driverName,
                idnumber,
                phone,
                personalphone,
                salaryPerKm,
                basicSalaryKm,
                selectedServices,
                basicSalaries
               
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
    <div>
        <label style={{ cursor: 'pointer'}} className="flex items-center" onClick={() => setShowTable(true)}>
            <IconPlusCircle className="me-2"/>
            Add Service Type
        </label>
        {showTable && (
  <div style={{ 
    marginTop: '10px', 
    padding: '10px', 
    border: '1px solid #ccc', 
    borderRadius: '5px', 
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Add box shadow for depth
    maxWidth: '500px', // Limit maximum width for responsiveness
    margin: 'auto' // Center the div horizontally
}}>
    {renderServiceOptions()}
    <button 
        style={{ 
            marginTop: '10px', 
            padding: '8px 16px', // Increase padding for button
            backgroundColor: '#007bff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '5px', // Increase border radius for button
            cursor: 'pointer', 
            display: 'block', // Ensure button takes full width
            margin: 'auto' // Center the button horizontally
        }} 
        onClick={() => setShowTable(false)}
    >
        Done
    </button>
</div>

)}
</div>
{selectedServices.length > 0 && (
    <table style={{ marginTop: '20px', borderCollapse: 'collapse', width: '100%' }}>
        <thead>
            <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Service Type</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Basic Salary</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>KM for Basic Salary</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>SalaryPerKm</th>
            </tr>
        </thead>
        <tbody>
            {selectedServices.map((service, index) => (
                <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{service}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <input 
                            style={{ border: 'none', outline: 'none' }} // Set border and outline to none
                            type="text"
                            value={basicSalaries[service] || ""}
                            placeholder='Enter Basic Salary'
                            onChange={(e) => handleBasicSalaryChange(service, e)}
                        />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', position: 'relative' }}>
                        <input
                            style={{ border: 'none', outline: 'none', width: 'calc(100% - 20px)' }} // Set border and outline to none, adjust width to leave space for "KM"
                            type="text"
                            value={basicSalaryKm[service] || ""}
                            onChange={(e) => handleBasicSalaryKmChange(service, e)}
                        />
                        <span style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', color: '#555'}}>KM</span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', position: 'relative' }}>
                        <input
                            style={{ border: 'none', outline: 'none', width: 'calc(100% - 20px)' }} // Set border and outline to none, adjust width to leave space for "KM"
                            type="text"
                            value={salaryPerKm[service] || ""}
                            onChange={(e) => handleSalaryPerKmChange(service, e)}
                        />
                        <span style={{ position: 'absolute', right: '45px', top: '50%', transform: 'translateY(-50%)', color: '#555'}}>/km</span>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
)}

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

export default AccountSettings;