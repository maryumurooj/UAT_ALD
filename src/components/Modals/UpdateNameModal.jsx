import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../../services/firebaseConfig";
import { useAuth } from "../../services/AuthContext";
import styles from "./FreeTrialModal.module.css"; // reusing existing modal styles

const UpdateUsernameModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phonenumber, setPhoneNumber] = useState(user?.phonenumber || "");
  const [displayNameError, setDisplayNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const validateDisplayName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 100) return "Name must be less than 100 characters";
    return "";
  };

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return "Phone number is required";
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) return "Phone number must be 10 digits";
    return "";
  };

  const handleSubmit = async () => {
    const nameError = validateDisplayName(displayName);
    const phoneErrorMsg = validatePhoneNumber(phonenumber);

    setDisplayNameError(nameError);
    setPhoneError(phoneErrorMsg);

    if (nameError || phoneErrorMsg) {
      return;
    }

    try {
      // Update Firebase Auth profile (note: Firebase Auth doesn't support phone number in updateProfile)
      await updateProfile(user, {
        displayName: displayName
      });

      // Update Firestore document with both fields
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        phonenumber: phonenumber
      });

      onClose();
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while saving your details.");
    }
  };

  return (
    <div className={styles.modaloverlay}>
      <div className={styles.modalcontent}>
        <div className={styles.modalheader}>
          <h2>Complete Your Profile</h2>
          <button className={styles.closebutton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalbody}>
          <div className={styles.formgroup}>
            <label htmlFor="displayName">Full Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dr Jon Doe"
            />
            {displayNameError && <div style={{color: 'red', fontSize: '12px', marginTop: '4px'}}>{displayNameError}</div>}
          </div>
          <div className={styles.formgroup}>
            <label htmlFor="phonenumber">Phone Number</label>
            <input
              id="phonenumber"
              type="text"
              value={phonenumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
            />
            {phoneError && <div style={{color: 'red', fontSize: '12px', marginTop: '4px'}}>{phoneError}</div>}
          </div>
          <div className={styles.modalactions}>
            <button className={styles.cancelbtn} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.submitbtn} onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUsernameModal;