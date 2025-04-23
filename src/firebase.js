// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAiW07DVil-H7A-kPYhKbyM8vyP6iTmi1w",
  authDomain: "petpulse17.firebaseapp.com",
  projectId: "petpulse17",
  storageBucket: "petpulse17.appspot.com",
  messagingSenderId: "1015263179162",
  appId: "1:1015263179162:web:4e075b1f6cfc1079ab8a23",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // <-- Add this

export { auth, db }; // ✅ Export both