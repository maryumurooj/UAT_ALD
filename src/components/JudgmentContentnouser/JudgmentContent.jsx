import React, { useRef, useState, useEffect } from "react";
import styles from "./JudgmentContent.module.css";

const JudgmentContent = () => {
 
  return (
    <div className={styles.scrollableText}>
      <p className={styles.subcribetoviewtext}> Subscribe to view Judgments. </p>
    </div>
  );
};

export default JudgmentContent;