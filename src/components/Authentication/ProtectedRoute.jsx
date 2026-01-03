// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from '../../services/firebaseConfig'; // Import Firestore as db
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

const ProtectedRoute = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, 'users', user.uid); // Fetch user document using UID
      getDoc(userRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          // Allow access only for admins
          if (userData.role === "admin") {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
        setLoading(false); // Set loading to false after fetching data
      }).catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
    } else {
      setIsAuthorized(false);
      setLoading(false);
    }
  }, []);

  // Show a loading indicator while fetching user data
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is not authorized, redirect to the Auth page
  return isAuthorized ? element : <Navigate to="/auth" />;
};

export default ProtectedRoute;
