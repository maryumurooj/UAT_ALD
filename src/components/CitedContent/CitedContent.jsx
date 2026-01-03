import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CitedContent.module.css";

const CitedContent = ({ judgmentData, searchTerms }) => {
  const navigate = useNavigate();

  const highlightText = (text, searchTerms) => {
    if (!text || !searchTerms || !searchTerms.length) {
      console.log("Text or searchTerms are undefined or empty:", text, searchTerms);
      return text;
    }

    console.log("Highlighting text:", text);

    const regexPattern = searchTerms.map(term => term.replace(/[()]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${regexPattern})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

   const handleCitationClick = (citation) => {
    console.log("Clicked Citation", citation);
    // Store the citation in localStorage
    localStorage.setItem('referredCitation', citation);
    // Reload the page
    window.location.reload();
  };
  
  

  return (
    <div className={styles.scrollableText}>
      <h3>CASES CITED</h3>
      {judgmentData && judgmentData.JudgmentTexts ? (
        judgmentData.JudgmentTexts.map((text) => (
          <div key={text.judgementTextId}>
            <p>{highlightText(text.judgementTextParaText, searchTerms)}</p>
            {text.judgmentsCiteds && text.judgmentsCiteds.length > 0 ? (
              <div style={{ textAlign: 'left' }}>
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                  {text.judgmentsCiteds.map((citation, index) => (
                    <li key={index}>
  {highlightText(citation.judgmentsCitedParties, searchTerms)}
  {citation.judgmentsCitedParties && ' - '}
  
 {citation.judgmentsCitedRefferedCitation && (() => {
  const parts = citation.judgmentsCitedRefferedCitation.split("=").map(p => p.trim());

  if (parts.length === 2) {
    return (
      <>
        {', '}
        <a
          href="#"
          onClick={() => handleCitationClick(parts[0])}
        >
          {highlightText(parts[0], searchTerms)}
        </a>
        <span style={{ margin: "0 5px" }}> = </span>
        <a
          href="#"
          onClick={() => handleCitationClick(parts[1])}
        >
          {highlightText(parts[1], searchTerms)}
        </a>
      </>
    );
  }

  // If there's no equal sign, just render normally
  return (
    <>
      {', '}
      <a
        href="#"
        onClick={() => handleCitationClick(citation.judgmentsCitedRefferedCitation)}
      >
        {highlightText(citation.judgmentsCitedRefferedCitation, searchTerms)}
      </a>
    </>
  );
})()}


  {citation.judgmentsCitedRefferedCitation && citation.judgmentsCitedEqualCitation && (
    <> {' = '} </>
  )}

  {highlightText(citation.judgmentsCitedEqualCitation, searchTerms)}

  {citation.judgmentsCitedParaLink &&
    ` (${highlightText(citation.judgmentsCitedParaLink, searchTerms)})`}
</li>

                  ))}
                </ul>
              </div>
            ) : (
              <p>Citations not available</p>
            )}
          </div>
        ))
      ) : (
        'No Cited Information available'
      )}
    </div>
  );
};

export default CitedContent;
