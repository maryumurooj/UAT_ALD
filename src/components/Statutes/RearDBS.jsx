import React, { useState, useEffect } from "react";
import styles from "./RearDBS.module.css";

function RearDBS({
  onSectionClick,
  currentPage,
  totalPages,
  handleNext,
  handlePrev,
  handleFirst,
  handleLast,
  section // Added section prop
}) {
  const [showPagination, setShowPagination] = useState(true);

  const items = ["Citations", "Amendments", "<<", "<", " ", ">", ">>"];

  // Update pagination visibility whenever the section changes
  useEffect(() => {
    if (section === "Citations") {
      setShowPagination(true);
    } else if (section === "Amendments") {
      setShowPagination(false);
    }
  }, [section]);

  const handleSectionClick = (section) => {
    onSectionClick(section);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item === "<<" ? (
              showPagination && (
                <button
                  className={`${styles.textButton} ${
                    currentPage === 1 ? styles.active : ""
                  }`}
                  onClick={handleFirst}
                  disabled={currentPage === 1}
                >
                  {item}
                </button>
              )
            ) : item === "<" ? (
              showPagination && (
                <button
                  className={`${styles.textButton} ${
                    currentPage === 1 ? styles.disabled : ""
                  }`}
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  {item}
                </button>
              )
            ) : item === ">" ? (
              showPagination && (
                <button
                  className={`${styles.textButton} ${
                    currentPage === totalPages ? styles.disabled : ""
                  }`}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  {item}
                </button>
              )
            ) : item === ">>" ? (
              showPagination && (
                <button
                  className={`${styles.textButton} ${
                    currentPage === totalPages ? styles.active : ""
                  }`}
                  onClick={handleLast}
                  disabled={currentPage === totalPages}
                >
                  {item}
                </button>
              )
            ) : item === " " ? (
              showPagination && (
                <span className={styles.pageIndicator}>
                  Page {currentPage} of {totalPages}
                </span>
              )
            ) : (
              <button
                className={`${styles.textButton} ${
                  section === item ? styles.active : ""
                }`}
                onClick={() => handleSectionClick(item)}
              >
                {item}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.rectangle}></div>
    </div>
  );
}

export default RearDBS;
