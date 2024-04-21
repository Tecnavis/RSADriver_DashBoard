// import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
// import React, { useState } from 'react'
// import PhoneInput from 'react-phone-input-2'
// import 'react-phone-input-2/lib/style.css'
// import { auth } from '../../config/config'

// const PhoneSignIn = () => {
//     const [phone , setPhone] =useState("")

//     const sendOtp =()=>{
//        const recaptcha = new RecaptchaVerifier(auth, "recaptcha" , {})
//        const confirmation = signInWithPhoneNumber(auth,phone,recaptcha)
//    console.log(first)
//     }
//   return (
//     <div className='phone-signin'>
//         <div className='phone-content'>
//         <PhoneInput
//   country={'us'}
//   value={phone}
//   onChange={(phone)=>setPhone("+" + phone)}
// />         <button
// onClick={sendOtp}
//   type="submit"
//   className="btn !mt-6 w-full border-0 uppercase text-white shadow-[0_10px_20px_-10px_rgba(255, 0, 0, 0.44)]"
//   style={{
//     background: 'linear-gradient(2deg, rgba(255, 255, 255, 1) 0%, rgba(255, 0, 0, 1) 100%)',
//   }}
// >                                    Send OTP
//                                 </button>
//                                 <label>Send OTP</label>
// <button
//   type="submit"
//   className="btn !mt-6 w-full border-0 uppercase text-white shadow-[0_10px_20px_-10px_rgba(255, 0, 0, 0.44)]"
//   style={{
//     background: 'linear-gradient(2deg, rgba(255, 255, 255, 1) 0%, rgba(255, 0, 0, 1) 100%)',
//   }}
// >                                    Verify OTP
//                                 </button>
//         </div>


//     </div>
//   )
// }

// export default PhoneSignIn