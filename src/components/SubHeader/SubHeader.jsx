import React, { useState, useEffect } from 'react';
import styles from './SubHeader.module.css'; // Ensure this import points to the correct CSS file

function SubHeader({ judgmentData, onToggleFullScreen, isFullScreen }) {
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      const mainHeaderHeight = 100; // Adjust this to match your main header's height
      if (offset > mainHeaderHeight) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`${styles.frame} ${isSticky ? styles.sticky : ''}`}>
      <div className={styles.textBlock}>
        <div className={styles.citation}>
          {judgmentData ? judgmentData.judgmentCitation : null}
        </div>
        <div className={styles.caseTitle}>
          {judgmentData ? judgmentData.judgmentParties : null}
        </div>
      </div>
      <button
        className={styles.fullScreenButton}
        onClick={onToggleFullScreen}
      >
        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
      </button>
    </div>
  );
}

export default SubHeader;