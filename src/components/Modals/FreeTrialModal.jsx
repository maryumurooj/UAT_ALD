import React, { useState } from "react";
import styles from "./FreeTrialModal.module.css";
import { useNavigate } from "react-router-dom";

const FreeTrialModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleAvailNow = () => {
    navigate("/subscription-tier");
    onClose(); // Close the modal after navigation
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modaloverlay}>
      <div className={styles.modalcontent}>
        <div className={styles.modalheader}>
          <h2>Start Your Free Trial Now!</h2>
          <button className={styles.closebutton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalbody}>
          <p>
            Get full access to all features with your free trial. Avail Now!
          </p>

          <div className={styles.modalactions}>
            <button
              type="button"
              className={styles.cancelbtn}
              onClick={onClose}
            >
              Maybe Later
            </button>
            <button
              type="button"
              className={styles.submitbtn}
              onClick={handleAvailNow}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialModal;
