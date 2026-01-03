import React, { useState } from 'react';
import styles from './MainFooter.module.css';
import logo from '../../assets/logo.svg'
import { Link, useNavigate } from "react-router-dom"; // Use useNavigate instead of Navigate

const MainFooter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number:'',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate(); // Initialize navigate hook


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("https://formcarry.com/s/Fe4winfwlM2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
      
      if (result.status === "success") {
        console.log('Form submitted successfully:', result);
        setIsSubmitted(true);
        setFormData({ name: '', email: '', number:'', message: '' });
        setTimeout(() => setIsSubmitted(false), 3000);
      } else {
        console.error('Form submission error:', result);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Network error:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleNavigation = (path) => {
    // Replace with your navigation logic
    console.log(`Navigate to: ${path}`);
    navigate(`/${path}`); // Redirect to the profile dashboard

  };

  return (
    <footer className={styles.footer}>
      <div className={styles.contactForm}>
        <h4>Quick Contact</h4>
        {isSubmitted ? (
          <div className={styles.successMessage}>
            <p>✓ Message sent successfully!</p>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
            />
             <input
              type="number"
              name="number"
              placeholder="Your Number"
              value={formData.number}
              onChange={handleInputChange}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleInputChange}
              rows={2}
            />
            <button onClick={handleSubmit} className={styles.submitButton}>
              Send Message
            </button>
          </div>
        )}
      </div>
      <div className={styles.footerContent}>
        <div className={styles.section}>
          <h4>Quick Links</h4>
          <div className={styles.linkGroup}>
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate('/Home')}>About</button>
            <button onClick={() => navigate('/Contact')}>Contact Us</button>
            <button onClick={() => navigate('/FAQ')}>FAQ</button>
          </div>
        </div>

        {/* Services */}
        <div className={styles.section}>
          <h4>Services</h4>
          <div className={styles.linkGroup}>
            <button onClick={() => navigate('/CaseFinder')}>Case Finder</button>
            <button onClick={() => navigate('/Statutes')}>Statutes</button>
            <button onClick={() => navigate('/articles')}>Articles</button>
            <button onClick={() => navigate('/judges')}>Judges</button>
            <button onClick={() => navigate('/index')}>Index</button>
          </div>
        </div>

        {/* Contact & Location */}
        <div className={styles.section}>
          <h4>Contact Info</h4>
          <div className={styles.contactInfo}>
            <p>21-5, opp. High Court, Gate No. 5,</p>
            <p>Ghansi Bazaar, Hyderabad, Telangana 500002</p>
            <p>Ph: 8374289998, 8374389998</p>
          </div>
          
        </div>

        {/* Contact Form & Plans */}
        <div className={styles.section}>
          <div className={styles.plansCard}>
            <h4>Premium Access</h4>
            <p>Unlock advanced legal research tools</p>
            <button 
              onClick={() => navigate('/subscription-tier')}
              className={styles.plansButton}
            >
              View Plans
            </button>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className={styles.footerBottom}>
        <img src={logo}/>
        <div className={styles.footerLinks}>
          <button onClick={() => navigate('/PrivacyPolicy')}>Privacy Policy</button>
          <button onClick={() => navigate('/Refund&CancellationPolicy')}>Refund Policy</button>
          <button onClick={() => navigate('/TermsAndConditions')}>Terms of Service</button>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;