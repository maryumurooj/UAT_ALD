import React, { useState, useEffect } from "react";
import styles from "./NotesContent.module.css";

const NotesContent = ({ uid, judgmentId }) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(
          `http://61.246.67.74:4000/api/notes?uid=${uid}&judgmentId=${judgmentId}`
        );
        const data = await response.json();
        if (data.length > 0) {
          setNotes(data[0].notesText);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    if (uid && judgmentId) fetchNotes();
  }, [uid, judgmentId]);

  const saveNotes = async () => {
    try {
      const response = await fetch("http://61.246.67.74:4000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, judgmentId, notesText: notes }),
      });

      if (response.ok) {
        alert("Notes saved successfully!");
      } else {
        alert("Notes failed.", error);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
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
