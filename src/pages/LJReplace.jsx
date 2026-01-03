import React, { useEffect, useState } from 'react';
import styles from './LJ.module.css';
import { FaSearch } from 'react-icons/fa';

const JudgmentsTable = () => {
  const [judgments, setJudgments] = useState([]);
  const [editableCitation, setEditableCitation] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  useEffect(() => {
    const fetchJudgments = async () => {
      try {
        const response = await fetch('http://61.246.67.74:4000/api/latest-judgments');
        const data = await response.json();
        setJudgments(data);
      } catch (error) {
        console.error('Error fetching judgments:', error);
      }
    };

    fetchJudgments();
  }, []);

  const handleCitationInputChange = (judgmentId, value) => {
    setEditableCitation((prev) => ({ ...prev, [judgmentId]: value }));
  };

  const handleReplaceCitation = async (judgmentId) => {
    const newCitation = editableCitation[judgmentId];
    if (!newCitation) return;

    try {
      const response = await fetch(`http://61.246.67.74:4000/api/judgment/${judgmentId}/citation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ judgmentCitation: newCitation }),
      });

      if (response.ok) {
        setJudgments((prevJudgments) =>
          prevJudgments.map((judgment) =>
            judgment.judgmentId === judgmentId
              ? { ...judgment, judgmentCitation: newCitation }
              : judgment
          )
        );
        setEditableCitation((prev) => ({ ...prev, [judgmentId]: '' }));
        alert('Citation updated successfully');
      } else {
        const data = await response.json();
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating judgment citation:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const filteredJudgments = judgments.filter((judgment) => {
    return (
      judgment.judgmentCitation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judgment.judgmentParties.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judgment.judgmentJudges.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className={styles.judgmentsContainer}>
      <div className={styles.searchContainer }>
      <input
        type="text"
        placeholder="Search judgments..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchBar} // Style for search bar
      />
      <FaSearch className={styles.searchIcon} />
      </div>
      
      {filteredJudgments.map((judgment) => (
        <div key={judgment.judgmentId} className={styles.judgmentCard}>
          <div className={styles.judgmentContent}>
            <h3 className={styles.citation}>{judgment.judgmentCitation}</h3>
            <p className={styles.parties}>{judgment.judgmentParties}</p>
            <p className={styles.date}>Date of Judgment: {new Date(judgment.formattedDOJ).toLocaleDateString()}</p>
            <p className={styles.judges}>Judges: {judgment.judgmentJudges}</p>
          </div>
          <div className={styles.editSection}>
            <input
              type="text"
              placeholder="Edit citation"
              value={editableCitation[judgment.judgmentId] || ''}
              onChange={(e) => handleCitationInputChange(judgment.judgmentId, e.target.value)}
              className={styles.input}
            />
            <button
              onClick={() => handleReplaceCitation(judgment.judgmentId)}
              className={styles.replaceButton}
            >
              Replace
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JudgmentsTable;
