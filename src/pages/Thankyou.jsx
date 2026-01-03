import React from 'react';
import styles from './ThankYou.module.css';
import { useNavigate } from "react-router-dom";

const Confirmation = () => {  // Fixed typo in component name (was COnfirmation)
    const navigate = useNavigate();
    
    const handleAvailNow = (e) => {
        e.preventDefault(); // Prevent default behavior just in case
        console.log('Button clicked!'); // Debugging log
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <section className={styles.header}>
                    <div className={styles.headerGlow}></div>
                    <h1 className={styles.title}>Thank You for Contacting Us!</h1>
                    <p className={styles.subtitle}>
                        We've received your message and will get back to you within 24-48 hours.          
                    </p>

                    {/* Added button type and onClick handler */}
                    <button 
                        type="button" 
                        className={styles.btncontinue} 
                        onClick={handleAvailNow}
                        style={{ cursor: 'pointer' }} // Ensure cursor changes
                    >
                        Continue Browsing
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Confirmation;  // Fixed export name to match component