import React from "react";
import styles from "./Terms.module.css";
import Footer from "../components/MainFooter/MainFooter"


const TermsAndConditions = () => {
  return (
    <div className={styles.termspagewrapper}>
      <div className={styles.termsbackgroundoverlay}></div>
      <div className={styles.termscontainer}>
        <div className={styles.termsheader}>
          <h1 className={styles.termstitle}>Terms and Conditions</h1>
          <div className={styles.termssubtitle}>
            YOUR USE OF THIS WEB SITE CONSTITUTES YOUR AGREEMENT TO BE BOUND BY
            THESE TERMS AND CONDITIONS OF USE AS MENTIONED HEREUNDER
          </div>
          <p className={styles.termsintro}>
            This Web site, including all of its features and content (the "Web
            Site") is a service made available by ALD Online hereinafter also
            referred to as the "Provider," and all content, information, and
            software provided on and through this Web Site ("Content") shall be
            used solely under the following terms and conditions ("Terms of Use").
          </p>
        </div>

        <div className={styles.termscontent}>
          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>01</div>
            <h2 className={styles.sectiontitle}>Web Site Limited License</h2>
            <p className={styles.sectiontext}>
              As a user of this Web Site, you are granted a non-exclusive,
              non-transferable, revocable, limited license to access and use this
              Web Site and Content in accordance with these Terms of Use. Provider
              may terminate this license at any time for any reason.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>02</div>
            <h2 className={styles.sectiontitle}>Limitations on Use</h2>
            <p className={styles.sectiontext}>
              The Content on this Web Site is for your personal use only and not
              for commercial exploitation. You shall not decompile, reverse
              engineer, disassemble, rent, lease, loan, sell, sublicense, or create
              derivative works from this Web Site or the Content.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>03</div>
            <h2 className={styles.sectiontitle}>Registration</h2>
            <p className={styles.sectiontext}>
              Certain sections of this Web Site require you to register. You agree
              to provide accurate and complete registration information and inform
              the Provider of any changes. Unauthorized use of your registration
              must be reported immediately.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>04</div>
            <h2 className={styles.sectiontitle}>Limitation of Liability</h2>
            <p className={styles.sectiontext}>
              ALD Online shall not be liable for any loss, injury, claim, or damage
              resulting from your use of this Web Site. The Provider's maximum
              liability shall be limited to the price of the product or service
              provided.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>05</div>
            <h2 className={styles.sectiontitle}>Privacy</h2>
            <p className={styles.sectiontext}>
              Personal data/information collected will be used only for in-house
              purposes and will not be shared with third parties except for those
              assisting with operations. You may request the update or deletion of
              your personal information.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>06</div>
            <h2 className={styles.sectiontitle}>BO Clause</h2>
            <p className={styles.sectiontext}>
              ALD Online shall not be liable for any loss or damage arising due to
              the decline of authorization for any transaction due to the cardholder
              exceeding the preset limit.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>07</div>
            <h2 className={styles.sectiontitle}>Refund/Cancellation Policy</h2>
            <p className={styles.sectiontext}>
              Subscription payments are non-refundable except in the case of
              technical errors. Users may cancel their subscription after the
              current period ends. If cancellation occurs due to technical issues,
              refunds will be processed within 7 working days.
            </p>
          </section>

          <section className={styles.termssection}>
            <div className={styles.sectionnumber}>08</div>
            <h2 className={styles.sectiontitle}>Shipping Policy</h2>
            <p className={styles.sectiontext}>
              Subscription-based software will be activated within 24 hours from
              payment confirmation.
            </p>
          </section>
        </div>

        <div className={styles.termsfooter}>
          <div className={styles.agreementtext}>
            By using this Web Site, you agree to be bound by these Terms and
            Conditions.
          </div>
          <div className={styles.lastupdated}>
            <small>Last updated: December 2024</small>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default TermsAndConditions;