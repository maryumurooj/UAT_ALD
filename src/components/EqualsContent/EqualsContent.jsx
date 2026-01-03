import React from "react";
import styles from "./EqualsContent.module.css";
import HighlightWords from 'react-highlight-words'; // Import the HighlightWords component

// Reusable function to highlight text
const highlightText = (text, searchTerms) => {
  if (!text || !searchTerms.length) return text;

  const regexPattern = searchTerms.map(term => term.replace(/[()]/g, '\\$&')).join('|');
  const regex = new RegExp(`\\bsection\\s*(-)?\\s*\\d+\\b|(${regexPattern})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
  );
};

const EqualsContent = ({ judgmentData, searchTerms }) => {
  return (
    <div className={styles.scrollableText}>
  <h3>EQUALS</h3>
  {judgmentData?.EqualCitations?.length > 0 ? (
    <div style={{ textAlign: 'left' }}>
      <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
        {judgmentData.EqualCitations.map((citation, index) => (
          <li key={citation.equalCitationId}>
            {index + 1}. {highlightText(citation.equalCitationText, searchTerms)}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <p>No equal citations available</p>
  )}
</div>


  );
};

export default EqualsContent;
