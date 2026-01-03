import React from "react";
import styles from "./PrivacyPolicy.module.css";
import Footer from "../components/MainFooter/MainFooter"

const PrivacyPolicy = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingElements}>
        <div className={styles.floatingCircle1}></div>
        <div className={styles.floatingCircle2}></div>
      </div>
      
      <div className={styles.privacyContainer}>
        <h1 className={styles.title}>Privacy Policy</h1>
        
        <div className={styles.privacySection}>
          <div className={styles.sectionGlow}></div>
          <p className={styles.paragraph}>
            At <span className={styles.highlight}>ALD Online</span>, we respect your privacy and are committed to protecting
            your personal information. This Privacy Policy outlines how we collect,
            use, and protect your personal data.
          </p>
        </div>

        <div className={styles.privacySection}>
          <div className={styles.sectionGlow}></div>
          <h2 className={styles.sectionHeading}>
            Information Collection
            <div className={styles.sectionHeadingAccent}></div>
          </h2>
          <p className={styles.paragraph}>
            We collect personal data such as your <span className={styles.highlight}>email address</span>, <span className={styles.highlight}>house address</span>,
            <span className={styles.highlight}> name</span>, and <span className={styles.highlight}>designation</span> for in-house use only. We will not share your
            personal data with any third party except those assisting us with our
            operations, and they are bound by confidentiality agreements.
          </p>
        </div>

        <div className={styles.privacySection}>
          <div className={styles.sectionGlow}></div>
          <h2 className={styles.sectionHeading}>
            Data Protection
            <div className={styles.sectionHeadingAccent}></div>
          </h2>
          <p className={styles.paragraph}>
            We have implemented <span className={styles.highlight}>security measures</span> to protect your personal
            information from unauthorized access or breaches. All data is stored
            securely and can be <span className={styles.highlight}>updated or deleted</span> upon your request.
          </p>
        </div>

        <div className={styles.privacySection}>
          <div className={styles.sectionGlow}></div>
          <h2 className={styles.sectionHeading}>
            User Rights
            <div className={styles.sectionHeadingAccent}></div>
          </h2>
          <p className={styles.paragraph}>
            You have the right to <span className={styles.highlight}>access</span>, <span className={styles.highlight}>modify</span>, or <span className={styles.highlight}>request deletion</span> of your
            personal data. If you wish to exercise these rights, please contact us
            at <span className={styles.highlight}>support@aldonline.com</span>.
          </p>
        </div>

        <div className={styles.privacySection}>
          <div className={styles.sectionGlow}></div>
          <p className={styles.paragraph}>
            By using our <span className={styles.highlight}>Web Site</span>, you consent to the collection and use of your
            personal data as described in this Privacy Policy.
          </p>
        </div>

        <footer className={styles.footer}>
          Last updated: December 2024
        </footer>
      </div>
      <Footer/>
    </div>
  );
};

export default PrivacyPolicy;