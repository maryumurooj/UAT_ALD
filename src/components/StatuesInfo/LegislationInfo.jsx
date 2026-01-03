import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LegislationInfo.module.css";

const LegislationInfo = ({ legislationInfo, searchTerm, bareActName }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1); // Display 1 short note per page
  const [currentItems, setCurrentItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const { shortNotes } = legislationInfo;
  const navigate = useNavigate();

  useEffect(() => {
    if (shortNotes) {
      const totalItems = shortNotes.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      updateCurrentItems(1);
    }
  }, [legislationInfo, searchTerm, bareActName]);

  const updateCurrentItems = (pageNumber) => {
    const indexOfLastItem = pageNumber * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const itemsToDisplay = shortNotes.slice(indexOfFirstItem, indexOfLastItem);
    setCurrentItems(itemsToDisplay);
  };

  const getCitationsAndPartiesForCurrentNote = () => {
    const currentNoteIndex = currentPage - 1;
    if (shortNotes && shortNotes[currentNoteIndex]) {
      const currentNote = shortNotes[currentNoteIndex];
      return {
        citations: currentNote.judgmentCitation ? [currentNote.judgmentCitation] : [],
        parties: currentNote.judgmentParties || []
      };
    }
    return { citations: [], parties: [] };
  };

  const highlightSearchTerm = (text, searchTerm, bareActName) => {
    if (!text) return '';

    // Replace newlines with <br> for HTML rendering
    let formattedText = text.replace(/\n/g, '<br>');

    // Highlight searchTerm
    if (searchTerm) {
      const searchTermRegex = new RegExp(`(${searchTerm})`, 'gi');
      formattedText = formattedText.replace(searchTermRegex, '<mark>$1</mark>');
    }

    // Highlight bareActName
    if (bareActName) {
      const bareActNameRegex = new RegExp(`(${bareActName})`, 'gi');
      formattedText = formattedText.replace(bareActNameRegex, '<mark>$1</mark>');
    }

    return formattedText;
  };

  const handleOpenClick = () => {
    const currentNoteIndex = currentPage - 1;
    if (shortNotes && shortNotes[currentNoteIndex]) {
      const currentNote = shortNotes[currentNoteIndex];
      if (currentNote.judgmentCitation) {
        localStorage.setItem('referredCitation', currentNote.judgmentCitation);
      }
    }
    navigate('/index');
  };

  return (
    <div className={styles.legislationInfo}>
      {/* Horizontal Bar for Judgment Citations and Parties */}
      <div className={styles.citationsBar}>
        <div className={styles.citationsList}>
          {getCitationsAndPartiesForCurrentNote().citations.concat(getCitationsAndPartiesForCurrentNote().parties).map((item, index) => (
            <span key={index} className={styles.citationItem}>
              <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(item, searchTerm, bareActName) }} />
            </span>
          ))}
        </div>
        <button className={styles.openButton} onClick={handleOpenClick}>Open</button>
      </div>

      {/* Display Short Notes */}
      {currentItems.map((shortNote, index) => (
        <div key={index} className={styles.shortNote}>
          <div className={styles.shortNoteHeader}></div>
          <div className={styles.shortNoteText}>
            {/* Render HTML with line breaks preserved */}
            <span dangerouslySetInnerHTML={{ __html: highlightSearchTerm(shortNote.shortNoteText, searchTerm, bareActName) }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LegislationInfo;
