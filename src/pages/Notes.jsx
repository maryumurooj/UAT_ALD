import React, { useState, useEffect } from "react";
import styles from "./Notes.module.css";
import { useNavigate } from "react-router";

const NotesViewer = ({ uid }) => {
  // Pass `uid` as a prop
  const [notesData, setNotesData] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotesData = async () => {
      try {
        const response = await fetch(
          `http://61.246.67.74:4000/api/user-notes/${uid}`
        );
        const data = await response.json();
        setNotesData(data || []); // Ensure an empty array if no data
        console.log("notesData:", notesData, typeof notesData);
        console.log("Received data:", data); // <-- Log here
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setNotesData([]); // Fallback to an empty array on error
      }
    };
    fetchNotesData();
  }, []);

  const handleCardClick = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
    setEditMode(null); // Reset edit mode when toggling the card
  };

  const handleEditClick = (id) => {
    setEditMode(id);
  };

  const handleSaveClick = async (id, updatedNotes) => {
    const noteToSave = notesData.find((note) => note.noteId === id);
    setNotesData((prevNotes) =>
      prevNotes.map((note) =>
        note.noteId === id ? { ...note, notesText: updatedNotes } : note
      )
    );

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          judgmentId: noteToSave.judgmentId,
          notesText: updatedNotes,
        }),
      });

      if (response.ok) {
        alert("Notes saved successfully!");
      } else {
        alert("Notes failed.", error);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }

    setEditMode(null);
  };

  const handleOpen = (citation) => {
    if (citation) {
      localStorage.setItem("referredCitation", citation);
    }
    navigate("/index");
  };

  console.log('Rendering NotesViewer with:', { 
    uid, 
    notesData, 
    notesDataLength: notesData.length,
    isArray: Array.isArray(notesData)
  });
  

  return (
    <div className={styles.notesContainer}>
      
      {notesData.length === 0 ? (
        <div
          className={styles.noNotesMessage}
          
        >
          No notes saved yet
        </div>
      ) : (
        notesData.map((note) => (
          <div
            key={note.noteId}
            className={`${styles.noteCard} ${
              expandedCard === note.noteId ? styles.expanded : ""
            }`}
            onClick={() => handleCardClick(note.noteId)}
          >
            {/* Header section containing citation and button */}
            <div className={styles.noteHeader}>
              <h3 className={styles.citation}>{note.judgmentCitation}</h3>
              <button
                className={styles.openButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(note.judgmentCitation);
                }}
              >
                Open Judgment
              </button>
            </div>

            {editMode === note.noteId ? (
              <textarea
                className={styles.noteTextEdit}
                value={note.notesText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  setNotesData((prevNotes) =>
                    prevNotes.map((n) =>
                      n.noteId === note.noteId
                        ? { ...n, notesText: e.target.value }
                        : n
                    )
                  )
                }
              />
            ) : (
              <p className={styles.noteText}>
                {expandedCard === note.noteId
                  ? note.notesText
                  : `${note.notesText.slice(0, 100)}...`}
              </p>
            )}

            {expandedCard === note.noteId && (
              <div className={styles.actions}>
                {editMode === note.noteId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveClick(note.noteId, note.notesText);
                    }}
                    className={styles.saveButton}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(note.noteId);
                    }}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NotesViewer;
