import React from "react";
import styles from "./ContactForm.module.css"; // Ensure this import points to the correct file

function ContactForm() {
  return (
    <div className={styles.formcarryWrapper}>
      <div className={styles.formcarryContainer}>
        <h1 className={styles.formcarryTop}>Contact Us</h1>
        <form className={styles.Cform} action="https://formcarry.com/s/CGNSNY682Wl" method="POST" encType="multipart/form-data">
          <div className={styles.formcarryBlock}>
            <input
              type="text"
              name="name"
              id="fc-generated-1-name"
              placeholder="Your first and last name"
              className={styles.formcarryInput}
            />
          </div>

          <div className={styles.formcarryBlock}>
            <input
              type="email"
              name="email"
              id="fc-generated-1-email"
              placeholder="john@doe.com"
              className={styles.formcarryInput}
            />
          </div>

          <div className={styles.formcarryBlock}>
            <textarea
              name="message"
              id="fc-generated-1-message"
              placeholder="Enter your message..."
              className={styles.formcarryInput}
            ></textarea>
          </div>
          <div className={styles.formcarryBlock}>
            <button type="submit" className={styles.formcarryButton}>Send</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
