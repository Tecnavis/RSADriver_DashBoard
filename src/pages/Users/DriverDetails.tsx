import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const DriverDetails = () => {
    const { id } = useParams();
    const [driver, setDriver] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const docRef = doc(db, 'driver', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setDriver(data);
                } else {
                    console.log(`Document with ID ${id} does not exist!`);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDriver().catch(console.error);
    }, [db, id]);

    if (!driver) {
        return <div>Loading...</div>;
    }

    return (
      <div className="grid xl:grid-cols-1 gap-6 grid-cols-1">
        <div className='panel'>
        <h2 style={{ textAlign: 'center' }}>Driver Details</h2>

        </div>
            <table className='panel p-4' style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '600px', margin: 'auto' }}>
                <tbody>
                    {/* <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>ID:</td>
                        <td>{driver.id}</td>
                    </tr> */}
                    <tr>
                        <td  style={{ fontWeight: 'bold', paddingRight: '10px' }}>Driver Name:</td>
                        <td>{driver.driverName}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>ID Number:</td>
                        <td>{driver.idnumber}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>Phone Number:</td>
                        <td>{driver.phone}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>Personal Phone Number:</td>
                        <td>{driver.personalphone}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>Service Type:</td>
                        <td>{driver.service}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>Basic Salary:</td>
                        <td>{driver.basicSalary}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold', paddingRight: '10px' }}>Salary/KM:</td>
                        <td>{driver.salarykm}</td>
                    </tr>
                    {/* Add more rows for additional details */}
                </tbody>
            </table>
        </div>
    );
}

export default DriverDetails;
