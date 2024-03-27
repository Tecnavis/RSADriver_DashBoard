// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYfaaoi24oJl8dJLTqigiobeRhCpDJ8Oc",
  authDomain: "rsa-dashboard-34773.firebaseapp.com",
  projectId: "rsa-dashboard-34773",
  storageBucket: "rsa-dashboard-34773.appspot.com",
  messagingSenderId: "751667160757",
  appId: "1:751667160757:web:6eac73e5039f3249ff00fc"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get the authentication instance
const auth = getAuth(app);

export { auth };
export default app;