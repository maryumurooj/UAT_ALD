import React from "react";
import styles from "./RefundAndCancellationPolicy.module.css";
import Footer from "../components/MainFooter/MainFooter"


const RefundAndCancellationPolicy = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingElements}>
        <div className={styles.floatingCircle1}></div>
        <div className={styles.floatingCircle2}></div>
      </div>
      
      <div className={styles.refundContainer}>
        <h1 className={styles.title}>Refund and Cancellation</h1>
        
        <p className={styles.introParagraph}>
          We understand that our users may need to cancel or request refunds
          under certain circumstances. Below are the guidelines for <span className={styles.highlight}>refunds and
          cancellations</span>.
        </p>

        <div className={styles.refundSection}>
          <div className={styles.sectionGlow}></div>
          <h2 className={styles.sectionHeading}>
            Subscription Refunds
            <div className={styles.sectionHeadingAccent}></div>
          </h2>
          <p className={styles.paragraph}>
            <span className={styles.highlight}>Subscription payments</span> are non-refundable, except in cases of
            <span className={styles.highlight}> technical issues</span>. If a technical glitch occurs and cannot be fixed,
            you will be refunded. Refunds will be processed within <span className={styles.highlight}>7 working days</span>.
          </p>
        </div>

        <div className={styles.refundSection}>
          <div className={styles.sectionGlow}></div>
          <h2 className={styles.sectionHeading}>
            Cancellation
            <div className={styles.sectionHeadingAccent}></div>
          </h2>
          <p className={styles.paragraph}>
            Users may <span className={styles.highlight}>cancel their subscription</span> after the current period ends.
            You can cancel your subscription at any time before the <span className={styles.highlight}>next billing
            cycle</span> begins. In case of cancellation, your <span className={styles.highlight}>personal data will be
            deleted</span> upon request.
          </p>
        </div>

        <div className={styles.refundSection}>
          <div className={styles.sectionGlow}></div>
          <h2 className={styles.sectionHeading}>
            Refund Process
            <div className={styles.sectionHeadingAccent}></div>
          </h2>
          <p className={styles.paragraph}>
            In case of a refund, the amount will be <span className={styles.highlight}> credited to your account </span>
            within <span className={styles.highlight}> 7 working days </span> after the cancellation request.
          </p>
        </div>

        <p className={styles.closingParagraph}>
          By using our <span className={styles.highlight}>services</span>, you agree to abide by the terms of this Refund
          and Cancellation Policy.
        </p>
        
        <footer className={styles.footer}>
          Last updated: December 2024
        </footer>
      </div>
      <Footer/>
    </div>
  );
};

export default RefundAndCancellationPolicy;