import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your actual Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBFMDoh2sCyTspTt4ek6_lQn8VZJ3xUYes",
  authDomain: "pet-pulse-81b82.firebaseapp.com",
  projectId: "pet-pulse-81b82",
  storageBucket: "pet-pulse-81b82.firebasestorage.app",
  messagingSenderId: "814817094642",
  appId: "1:814817094642:web:6103d8f6de0aa908a0d96b",
  measurementId: "G-SJQRWMN48B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export auth
export const auth = getAuth(app);
