import React, { useState, useEffect , useRef} from "react";
import axios from "axios";
import styles from "./dbsync.module.css";

const DBSync = () => {
  const [citationType, setCitationType] = useState("newCitation");
  const [citations, setCitations] = useState([]);
  const [selectedCitation, setSelectedCitation] = useState("");
  const [citationList, setCitationList] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [judgmentId, setJudgmentId] = useState("");
  const [judgmentAction, setJudgmentAction] = useState("add");
  const [syncMessage, setSyncMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);
  useEffect(() => {
    const fetchCitations = async () => {
      try {
        const response = await axios.get("http://61.246.67.74:4000/api/all-citations");
        setCitations(response.data);
      } catch (error) {
        console.error("Error fetching citations:", error);
      }
    };
    fetchCitations();
  }, []);
  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedCitation(value);

    if (judgmentAction === "update" && value.length > 0) {
      const filtered = citations
        .filter((item) =>
          item[citationType].toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedCitation(suggestion[citationType]);
    setSuggestions([]);
  };

  const handleAddCitation = () => {
    const trimmedCitation = selectedCitation.trim();
    if (trimmedCitation && !citationList.includes(trimmedCitation)) {
      setCitationList([...citationList, trimmedCitation]);
      setSelectedCitation("");
      setSuggestions([]);
    }
  };

  const handleRemoveCitation = (citation) => {
    setCitationList(citationList.filter((item) => item !== citation));
  };

  const handleSyncDatabases = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch(`http://61.246.67.74:5000/sync-databases?citationType=${citationType}`, {
        method: "GET",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error occurred during database sync.");
      }
      const data = await response.json();
      setSyncMessage(data.message || "Database sync completed successfully.");
    } catch (error) {
      setSyncMessage(error.message || "Failed to connect to the server. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateDatabase = async () => {
    setIsUpdating(true);
    try {
      for (const citation of citationList) {
        await axios.post("http://61.246.67.74:5000/api/update-judgment", { citation });
      }
      setCitationList([]);
      setSyncMessage("Database updated successfully.");
    } catch (error) {
      console.error("Error updating judgments:", error);
      setSyncMessage("Error updating database.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleJudgmentOperation = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
        let response;
        if (judgmentAction === "add") {
            response = await fetch("http://61.246.67.74:5000/add-judgments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ citations: citationList }),
            });
        } else { // Delete
            response = await fetch("http://61.246.67.74:5000/delete-judgments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ citations: citationList }), // Changed from judgmentIds to citations
            });
        }
  
        if (response.ok) {
            const data = await response.json();
            setSyncMessage(data.message);
            setSelectedCitation("");
            setCitationList([]);
        } else {
            const error = await response.json();
            setSyncMessage(error.error || "Error occurred during operation.");
        }
    } catch (error) {
        setSyncMessage("Failed to connect to the server. Please try again.");
    } finally {
        setIsSyncing(false);
    }
};
  const citationTypes = [
    { value: "judgmentCitation", label: "Judgment" },
    { value: "newCitation", label: "Online" },
  ];

  return (
    <div className={styles.syncContainer}>
      <div className={styles.syncPanel}>
        <h2 className={styles.title}>DB Sync</h2>
  
       {/* Citation Type Toggle */}
       <div className={styles.typeSlider}>
          {['judgmentCitation', 'newCitation'].map((type) => (
            <button
              key={type}
              className={`${styles.typeBtn} ${citationType === type ? styles.active : ''}`}
              onClick={() => setCitationType(type)}
              style={{ width: '50%' }}
            >
              {type === 'judgmentCitation' ? 'Judgment Citation' : 'New Citation'}
            </button>
          ))}
          <div
            className={styles.sliderIndicator}
            style={{
              width: '50%',
              transform: `translateX(${citationType === 'judgmentCitation' ? 0 : 100}%)`,
            }}
          />
        </div>

        {/* Judgment Action Toggle */}
        <div className={styles.typeSlider}>
          <button
            className={`${styles.typeBtn} ${judgmentAction === 'add' ? styles.active : ''}`}
            onClick={() => setJudgmentAction('add')}
            style={{ width: '50%' }}
          >
            Add
          </button>
          <button
            className={`${styles.typeBtn} ${judgmentAction === 'update' ? styles.active : ''}`}
            onClick={() => setJudgmentAction('update')}
            style={{ width: '50%' }}
          >
            Update/Delete
          </button>
          <div
            className={styles.sliderIndicator}
            style={{
              width: '50%',
              transform: `translateX(${judgmentAction === 'add' ? 0 : 100}%)`,
            }}
          />
        </div>

        {/* Logs Box */}
      

        {/* Action Buttons */}
       
        {/* Citation List */}
        <ul className={styles.citationGrid}>
          {citationList.map((citation, index) => (
            <li key={index} className={styles.citationCard}>
              <span className={styles.citationText}>{citation}</span>
              <button
                className={styles.removeGlow}
                onClick={() => handleRemoveCitation(citation)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
  
        {/* Action Buttons */}
        <div className={styles.actionBar}>
          <button
            className={`${styles.actionBtn} ${styles.sync}`}
            onClick={handleSyncDatabases}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <span className={styles.neonSpinner} /> Syncing
              </>
            ) : (
              "Sync DB"
            )}
          </button>
          {judgmentAction === "add" ? (
            <button
              className={`${styles.actionBtn} ${styles.update}`}
              onClick={handleJudgmentOperation}
              disabled={isSyncing || citationList.length === 0}
            >
              {isSyncing ? (
                <>
                  <span className={styles.neonSpinner} /> Adding
                </>
              ) : (
                "Add Judgments"
              )}
            </button>
          ) : (
            <>
              <button
                className={`${styles.actionBtn} ${styles.update}`}
                onClick={handleUpdateDatabase}
                disabled={isUpdating || citationList.length === 0}
              >
                {isUpdating ? (
                  <>
                    <span className={styles.neonSpinner} /> Updating
                  </>
                ) : (
                  "Update"
                )}
              </button>
              <button
                className={`${styles.actionBtn} ${styles.sync}`}
                onClick={handleJudgmentOperation}
                disabled={isSyncing || citationList.length === 0}
              >
                {isSyncing ? (
                  <>
                    <span className={styles.neonSpinner} /> Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </>
          )}
        </div>
  
        {/* Sync Message */}
        {syncMessage && (
          <div
            className={styles.syncMessage}
            style={{
              color: syncMessage.includes("successfully") ? "green" : "red",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            {syncMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default DBSync;