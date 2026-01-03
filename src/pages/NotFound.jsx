import React from 'react';
import { Home, Search, ArrowLeft, Mail, Phone } from 'lucide-react';
import styles from './NotFound.module.css';

const NotFound = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    // Replace with your actual home route
    window.location.href = '/';
  };

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.errorVisual}>
          <div className={styles.errorCode}>404</div>
          <div className={styles.errorText}>Page Not Found</div>
        </div>
        
        <div className={styles.errorMessage}>
          <h1>Oops! Something went wrong</h1>
          <p>The page you're looking for doesn't exist or has been moved. Don't worry, even the best legal minds sometimes take a wrong turn.</p>
        </div>

        <div className={styles.actionButtons}>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleGoHome}>
            <Home size={20} />
            Go to Homepage
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleGoBack}>
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        <div className={styles.searchSuggestion}>
          <div className={styles.searchIcon}>
            <Search size={24} />
          </div>
          <p>Try searching for legal resources, case laws, or browse our FAQ section for assistance.</p>
        </div>

        <div className={styles.contactSection}>
          <h2>Need Help?</h2>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail size={20} />
              <span>salesaldonline@gmail.com</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={20} />
              <span>83742 89998 | 83743 89998</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;