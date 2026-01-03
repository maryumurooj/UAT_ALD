import React, { useState, useEffect } from 'react';
import styles from './SubscriptionTier.module.css';
import { useNavigate } from "react-router-dom";
import { db } from '../../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../services/AuthContext';
import axios from 'axios';
import SkeletonCard from '../Skeletons/SkeletonCard'; // Import the skeleton component


// PricingCard Component
function PricingCard({ plan = {} }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Destructure plan properties with proper conversions
  const {
    plan_type: type = '',
    title = '',
    description = '',
    price = 0,
    original_price: originalPrice = null,
    show_original_price: showOriginalPrice = false,
    most_popular: mostPopular = false,
    is_free_trial: isFreeTrial = false,
    duration_days: durationDays = 0
  } = plan;

  const handleSubscription = async () => {
    if (!user) {
      alert('You must be logged in to subscribe. Please log in or sign up first.');
      navigate('/login');
      return;
    }
  
    setIsSubmitting(true);
  
    const subscriptionRef = collection(db, 'subscriptions');
    const subscriptionQuery = query(subscriptionRef, where('uid', '==', user.uid));
    const subscriptionSnapshot = await getDocs(subscriptionQuery);
    const userDocRef = doc(db, 'users', user.uid);
    let hasActiveSubscription = false;
    let existingInactiveDocId = null;
  
    subscriptionSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.subscriptionStatus === 'active') {
        hasActiveSubscription = true;
      } else if (
        data.subscriptionStatus === 'pending' || 
        data.subscriptionStatus === 'expired'
      ) {
        existingInactiveDocId = doc.id;
      }
    });

    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      alert('User record not found.');
      setIsSubmitting(false);
      return;
    }
    const userData = userSnap.data();

    // Check free trial eligibility
    if (isFreeTrial) {
      if (userData.freeTrialStatus !== 'available') {
        alert('You have already used your free trial.');
        setIsSubmitting(false);
        return;
      }
    }
  
    if (hasActiveSubscription) {
      alert('You already have an active subscription. Please check your subscription in your account settings.');
      navigate('/profiledashboard');
      setIsSubmitting(false);
      return;
    }
  
    // Use duration directly from database
    const creationDate = new Date();
    const deadline = new Date();
    deadline.setTime(creationDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  
    const subscriptionData = {
      uid: user.uid,
      planName: title,
      duration: durationDays,
      price: price,
      subscriptionStatus: 'pending',
      creationDate: creationDate.toISOString(),
      endingDate: deadline.toISOString(),
    };
  
    try {
      let docRef;
  
      if (existingInactiveDocId) {
        const docToUpdate = doc(db, 'subscriptions', existingInactiveDocId);
        await updateDoc(docToUpdate, subscriptionData);
        docRef = docToUpdate;
      } else {
        docRef = await addDoc(subscriptionRef, subscriptionData);
      }
  
      alert('Subscription saved! Proceeding to billing information.');
      navigate('/billingAddress', { state: { subscriptionId: docRef.id } });
  
    } catch (error) {
      console.error('Error saving subscription data:', error);
      alert('Failed to save subscription data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.glassCard} ${mostPopular ? styles.popularCard : ''} ${isFreeTrial ? styles.freeCard : ''}`}>
      {mostPopular && (
        <div className={styles.popularBadge}>
          <span>Limited Time Offer</span>
        </div>
      )}
      
      <div className={styles.cardContent}>
        <div className={styles.planHeader}>
          <h3 className={styles.planTitle}>{title}</h3>
          <p className={styles.planDuration}>{description}</p>
        </div>
        
        <div className={styles.priceSection}>
          {isFreeTrial ? (
            <div className={styles.freePrice}>FREE</div>
          ) : (
            <>
              <div className={styles.priceDisplay}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>{Number(price).toLocaleString()}</span>
              </div>
              {showOriginalPrice && originalPrice && (
                <div className={styles.originalPrice}>₹{Number(originalPrice).toLocaleString()}</div>
              )}
            </>
          )}

          <div className={styles.gstNote}>
            {!isFreeTrial && '(Inclusive of GST)'}
          </div>
        </div>
        
        <button 
          className={`${styles.subscribeBtn} ${isFreeTrial ? styles.freeTrial : ''}`}
          onClick={handleSubscription}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Processing...' : isFreeTrial ? 'Start Trial' : 'Choose Plan'}</span>
        </button>
      </div>
    </div>
  );
}
// Features Component
function FeaturesSection() {
  const features = [
    'Access key Judgments and selected articles',
    'Search within search for refined results',
    'Fast, advanced, and accurate search system',
    'User-friendly interface for legal research',
    'Customizable printing options, true print format for court use',
    'Bookmark important documents easily',
    'Access anytime, anywhere with cloud-based storage'
  ];

  return (
    <div className={styles.featuresContainer}>
      <div className={styles.featuresGrid}>
        <div className={styles.featuresBox}>
          <h3 className={styles.featuresTitle}>Software Features</h3>
          <div className={styles.featuresList}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>✓</div>
                <span className={styles.featureText}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.corporateBox}>
          <h3 className={styles.corporateTitle}>Corporate Users</h3>
          <p className={styles.corporateSubtitle}>For Bulk Orders</p>
          <div className={styles.contactDetails}>
            <p className={styles.contactLabel}>Please Contact:</p>
            <div className={styles.phoneNumbers}>
            <span>📞 8374289998</span>
              <span>📞 837438998</span>
              
            </div>
            <p className={styles.timing}>🕒 10:30 AM - 7:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
// Main Component
function Price() {
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.heroSection}>
        <h1 className={styles.mainTitle}>Choose Your Subscription Plan</h1>
        <p className={styles.subtitle}>Select the perfect plan for your legal research needs</p>
      </div>
      
      <div className={styles.plansContainer}>

      {loading ? (
          // Show 6 skeleton cards while loading
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
          ) : error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : !plansData || plansData.length === 0 ? (
            <div className={styles.errorMessage}>No subscription plans available</div>
          ) : (
        plansData.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}  // ✅ Pass the entire plan object
          />
        ))
      )}
      </div>
      
      <FeaturesSection />
    </div>
  );
}


export default Price;