import React from 'react';
import styles from '../Authentication/SubscriptionTier.module.css';

function SkeletonCard() {
  return (
    <div className={`${styles.glassCard} ${styles.skeletonCard}`}>
      <div className={styles.cardContent}>
        <div className={styles.planHeader}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
        </div>
        
        <div className={styles.priceSection}>
          <div className={`${styles.skeleton} ${styles.skeletonPrice}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonSmallText}`}></div>
        </div>
        
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </div>
    </div>
  );
}

export default SkeletonCard;
