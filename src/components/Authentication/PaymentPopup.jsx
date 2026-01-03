import React from 'react';
import { FaPhoneAlt, FaEnvelope } from 'react-icons/fa'; // Importing specific icons
import './PaymentPopup.css'; // Styling for the popup
import logo from '../../assets/logo.png'; // Import ALD logo

const CustomPopup = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  const contacts = [
    {
      id: "phone",
      icon: <FaPhoneAlt className="icon" />, // Using React Icons
      text: "Ph: 8374289998, 8374389998",
    },
    {
      id: "email",
      icon: <FaEnvelope className="icon" />, // Using React Icons
      text: "salesaldonline@gmail.com",
    },
  ];

  return (
    <div className="custom-popup-overlay">
      <div className="custom-popup-container">
        <img src={logo} alt="ALD Logo" className="custom-popup-logo" />
        <h2>Your Subscription is Pending</h2>
        <p>It will be activated as soon as the payment is received.</p>

        {/* Contact Info Section */}
        <div className="custom-popup-contact">
          <p><strong>Contact Us:</strong></p>
          {contacts.map((contact) => (
            <div key={contact.id} className="contact-info">
              {contact.icon} {/* Displaying React Icon */}
              <span className="text">{contact.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons Section */}
        <div className="custom-popup-buttons">
          <button
            className="contact-btn"
            onClick={() => window.open('tel:+8374289998')}
          >
            Contact Us
          </button>
          <p>OR</p>
          <button className="continue-btn" onClick={onContinue}>
            Continue with Online Payment
          </button>
        </div>

        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default CustomPopup;
