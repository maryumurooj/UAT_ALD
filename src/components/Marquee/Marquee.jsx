import React, { useState, useEffect } from "react";
import styles from "./Marquee.module.css";
import { Button } from "react-bootstrap";
import axios from "axios"; // Install axios if not already done (npm install axios)
import moment from "moment";

const Marquee = () => {
  const [currentContent, setCurrentContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [newContent, setNewContent] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    fetchCurrentContent();
  }, []);

  const fetchCurrentContent = async () => {
    try {
      const response = await axios.get("http://61.246.67.74:4000/api/marquee");
      if (response.data.success) {
        setCurrentContent(response.data.message);
        setLastUpdated(response.data.lastUpdated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put("http://61.246.67.74:4000/api/marquee", {
        message: newContent,
      });
      if (response.data.success) {
        fetchCurrentContent();
        setNewContent(""); // Clear input field
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClear = () => {
    setNewContent("");
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.currentMarqueeContainer}>
          <h2>Current Content:</h2>
          <span>
            <h5>{currentContent}</h5>
            <p>Last updated: {lastUpdated}</p>
          </span>
        </div>


        <div className={styles.inputContainer}>
          <label>Enter new content to display</label>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Type Content"
          />
          <Button variant="danger" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    </>
  );
};

export default Marquee;
