import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ this should come *after* initializeApp

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXxoGGvUmmzbism1pFy4tWbodavaLplog",
    authDomain: "tutorcoachportal.firebaseapp.com",
    projectId: "tutorcoachportal",
    storageBucket: "tutorcoachportal.firebasestorage.app",
    messagingSenderId: "847204632877",
    appId: "1:847204632877:web:abadbff409681260fceba4"
  };

const app = initializeApp(firebaseConfig); // ✅ make sure this line comes BEFORE getAuth or getFirestore

export const auth = getAuth(app); // ✅ this is good
export const db = getFirestore(app); // ✅ this must come AFTER app is initialized




