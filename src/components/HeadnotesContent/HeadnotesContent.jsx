import React, { useState, useEffect } from "react";
import styles from "./HeadnotesContent.module.css";
import {Spinner} from 'react-bootstrap';


const HeadnotesContent = ({ judgmentData, searchTerms = [] }) => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 1000); // Adjust time as needed
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [judgmentData]);

  
  const formatDate = (dateString) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const day = parseInt(dateString.substring(0, 2), 10);
    const monthIndex = parseInt(dateString.substring(2, 4), 10) - 1;
    const year = parseInt(dateString.substring(4), 10);

    const formattedDate = `${toOrdinal(day)} day of ${months[monthIndex]}, ${year}`;
    return formattedDate;
  };

  const toOrdinal = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const highlightText = (text, searchTerms) => {
    if (!text || !Array.isArray(searchTerms) || !searchTerms.length) return text;

    const regexPattern = searchTerms.map(term => term.replace(/[()]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${regexPattern})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };


  return (
    <div className={styles.scrollableText}>
      <div>
        <h3>HEADNOTES</h3>
        {judgmentData && judgmentData.ShortNotes && judgmentData.ShortNotes.length > 0 ? (
          judgmentData.ShortNotes.map((shortNote) => (
            <div key={shortNote.shortNoteId}>
              <h4>{highlightText(shortNote.shortNoteText, searchTerms)}</h4>
              {shortNote.LongNotes.map((longNote) => (
                <div key={longNote.longNoteId}>
                  {longNote.LongNoteParas.map((longNotePara) => (
                    <p key={longNotePara.longNoteParaId}>
                      {highlightText(longNotePara.longNoteParaText, searchTerms)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default HeadnotesContent;
