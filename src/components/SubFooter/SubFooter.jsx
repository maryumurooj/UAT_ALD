import React from "react";
import styles from "./SubFooter.module.css"; // Ensure this import points to the correct file
import { Phone, Mail } from "lucide-react";
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
function SubFooter() {
  // Define contact information and icons in an array for better structure
  const contacts = [
    {
      id: "phone",
      icon: PhoneEnabledIcon,
      text: "Ph: 8374289998, 8374389998",
      alt: "Phone Icon",
    },
    {
      id: "email",
      icon: MailOutlineOutlinedIcon,
      text: "salesaldonline@gmail.com",
      alt: "Email Icon",
    },
  ];

  return (
    <div className={styles.subFooterFrame}>
      <hr className={styles.horizontalLine} />
      <div className={styles.contentContainer}>
        <div className={styles.textContent}>
          <i className="fas fa-copyright"></i>
          <span> Copyright © Andhra Legal Decisions</span>
        </div>
        {contacts.map((contact) => (
          <div key={contact.id} className={styles.contactInfo}>
            <img className={styles.icon} src={contact.icon} />
            <span className={styles.text}>{contact.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubFooter;
