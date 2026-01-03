import React from "react";
import styles from "./FrontDBS.module.css"; // Import CSS module

function FrontDBS({ handlePrint }) {
  const items = ["Print", "Bookmark"];

  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <button
              className={styles.textButton}
              onClick={item === "Print" ? handlePrint : null} // Call handlePrint for the Print button
            >
              {item}
            </button>
          </React.Fragment>
        ))}
      </div>
      {/* Rectangle with curved edges */}
      <div className={styles.rectangle}></div>
    </div>
  );
}

export default FrontDBS;
