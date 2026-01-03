// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import auth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBoCILdJ6n1fK-iJ3fGALfvVP91aNBprQ",
  authDomain: "aldonline.firebaseapp.com",
  projectId: "aldonline",
  storageBucket: "aldonline.appspot.com",
  messagingSenderId: "88584327701",
  appId: "1:88584327701:web:033ebf095081ccfa7d741c",
  measurementId: "G-KZ8JBEPKRX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Authentication
const db = getFirestore(app);
const auth = getAuth(app);

// Export Firestore and Auth
export { db, auth };
