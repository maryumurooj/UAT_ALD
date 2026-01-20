import React, { useState, useEffect } from "react";
import styles from "./NotesContent.module.css";
import api from "../../axios"

const NotesContent = ({ uid, judgmentId }) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get("/api/notes", {
          params: { uid, judgmentId }, // ✅ send query params
        });
  
        if (response.data.length > 0) {
          setNotes(response.data[0].notesText);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
  
    if (uid && judgmentId) fetchNotes();
  }, [uid, judgmentId]);
  
  const saveNotes = async () => {
    try {
      const response = await api.post("/api/notes", {
        uid,
        judgmentId,
        notesText: notes,
      });
  
      if (response.data.success || response.status === 200) {
        alert("Notes saved successfully!");
      } else {
        alert("Failed to save notes.");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Error saving notes. Please try again.");
    }
  };

  return (
    <div
      className={styles.scrollableText}
      style={{ filter: !judgmentId && !uid ? "blur(4px)" : "none" }}
    >
      <div className={styles.centered}>
        <h2>Notes</h2>
        <textarea
          className={styles.notesArea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
        />

        <button onClick={saveNotes} className={styles.saveButton}>
          Save Notes
        </button>
      </div>
    </div>
  );
};

export default NotesContent;
