// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your new Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuhuX7YpLQUh_nzXWxya3ES6ZFq2woBCo",
  authDomain: "petpulse-live-demo.firebaseapp.com",
  projectId: "petpulse-live-demo",
  storageBucket: "petpulse-live-demo.appspot.com",
  messagingSenderId: "921953309659",
  appId: "1:921953309659:web:e87f47c8e4dc33e4ae4dfe",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Authentication
const auth = getAuth(app);

// ✅ Initialize Firestore Database
const db = getFirestore(app);

// ✅ Export them properly
export { auth, db };
