
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';

// const ViewMore = () => {
//   const { id } = useParams();
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const db = getFirestore();

//   useEffect(() => {
//     const fetchBookingDetails = async () => {
//       try {
//         const docRef = doc(db, 'bookings', id);
//         const docSnap = await getDoc(docRef);
      
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setBookingDetails(data);
//         } else {
//           console.log(`Document with ID ${id} does not exist!`);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchBookingDetails().catch(console.error);
//   }, [db, id]);

//   if (!bookingDetails) {
//     return <div>Loading...</div>;
//   }

//   const containerStyle = {
//     margin: '2rem',
//     padding: '1rem',
//     boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
//     borderRadius: '10px',
//   };

 

//   const tableStyle = {
//     width: '100%',
//     borderCollapse: 'collapse',
//   };

//   const thStyle = {
//     backgroundColor: '#f2f2f2',
//     padding: '8px',
//     textAlign: 'left',
//     fontWeight: 'bold',
//   };

//   const tdStyle = {
//     padding: '8px',
//     borderBottom: '1px solid #ddd',
//   };

//   return (
//     <div style={containerStyle}>
//  <h5 className="font-semibold text-lg dark:text-white-light mb-5">
//           Booking Details {' '}
       
//         </h5>
//       <table style={tableStyle}>
//         <tbody>
//           {/* <tr>
//             <th style={thStyle}>Field</th>
//             <th style={thStyle}>Value</th>
//           </tr> */}
//           {/* <tr>
//             <td style={thStyle}>Location :</td>
//             <td style={tdStyle}>{bookingDetails.location} </td>
//           </tr> */}
//           <tr>
//             <td style={thStyle}>Company :</td>
//             <td style={tdStyle}>{bookingDetails.company}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>File Number :</td>
//             <td style={tdStyle}>{bookingDetails.fileNumber}</td>
//           </tr>
//           {/* <tr>
//             <td style={thStyle}>ShowRoom :</td>
//             <td style={tdStyle}>{bookingDetails.showroom}</td>
//           </tr> */}
//           <tr>
//             <td style={thStyle}>CustomerName :</td>
//             <td style={tdStyle}>{bookingDetails.customerName}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>Driver :</td>
//             <td style={tdStyle}>{bookingDetails.driver}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>VehicleNumber :</td>
//             <td style={tdStyle}>{bookingDetails.vehicleNumber}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>VehicleModel :</td>
//             <td style={tdStyle}>{bookingDetails.vehicleModel}</td>
//           </tr>  
//           <tr>
//             <td style={thStyle}>phoneNumber :</td>
//             <td style={tdStyle}>{bookingDetails.phoneNumber}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>MobileNumber :</td>
//             <td style={tdStyle}>{bookingDetails.mobileNumber}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>PickupLocation :</td>
//             <td style={tdStyle}>{bookingDetails.pickupLocation}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>DropOffLocation:</td>
//             <td style={tdStyle}>{bookingDetails.dropoffLocation}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>Distance :</td>
//             <td style={tdStyle}>{bookingDetails.distance}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>ServiceType  :</td>
//             <td style={tdStyle}>{bookingDetails.serviceType}</td>
//           </tr>
//           <tr>
//             <td style={thStyle}>ServiceVehicle :</td>
//             <td style={tdStyle}>{bookingDetails.serviceVehicle}</td>
//           </tr>  
//           <tr>
//             <td style={thStyle}>Comments :</td>
//             <td style={tdStyle}>{bookingDetails.comments}</td>
//           </tr>  
//                 </tbody>
//       </table>
//     </div>
//   );
// };

// export default ViewMore;
