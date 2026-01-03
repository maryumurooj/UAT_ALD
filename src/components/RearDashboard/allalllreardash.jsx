import React, { useState, useCallback, useEffect } from "react";
import styles from "./RearDashboard.module.css";
import JudgmentsTable from "../JudgmentsTable/JudgmentsTable";

function RearDashboard({ results, onRowClick, onSaveToPad, judgmentCount }) {
  const [showTable, setShowTable] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentJudgmentCitation, setCurrentJudgmentCitation] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [courtType, setCourtType] = useState("All");
  const [filteredResults, setFilteredResults] = useState(results);
  const [searchQuery, setSearchQuery] = useState("");
  const [courtList, setCourtList] = useState([]);



  const handleShowClick = () => {
    setShowTable(!showTable);
    if (!showTable && selectedRow) {
      onSaveToPad(selectedRow);
    }
  };

  const handleNextClick = () => {
    const currentIndex = filteredResults.findIndex((row) => row === selectedRow);
    const nextIndex = currentIndex < filteredResults.length - 1 ? currentIndex + 1 : 0;
    const nextRow = filteredResults[nextIndex];
    setSelectedRow(nextRow);
    setCurrentJudgmentCitation(nextRow.judgmentCitation);
    onRowClick(nextRow);
  };

  const handlePrevClick = () => {
    const currentIndex = filteredResults.findIndex((row) => row === selectedRow);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredResults.length - 1;
    const prevRow = filteredResults[prevIndex];
    setSelectedRow(prevRow);
    setCurrentJudgmentCitation(prevRow.judgmentCitation);
    onRowClick(prevRow);
  };

  const handleFirstClick = () => {
    const firstRow = filteredResults[0];
    setSelectedRow(firstRow);
    setCurrentJudgmentCitation(firstRow.judgmentCitation);
    onRowClick(firstRow);
  };

  const handleLastClick = () => {
    const lastRow = filteredResults[filteredResults.length - 1];
    setSelectedRow(lastRow);
    setCurrentJudgmentCitation(lastRow.judgmentCitation);
    onRowClick(lastRow);
  };

const handleSaveToPadClick = () => {
  if (filteredResults && filteredResults.length > 0) {
    let existingData = localStorage.getItem("padData");
    try {
      existingData = JSON.parse(existingData);
      if (!Array.isArray(existingData)) {
        existingData = [];
      }
    } catch (error) {
      existingData = [];
    }
    const newData = existingData.concat(filteredResults);
    localStorage.setItem("padData", JSON.stringify(newData));
    alert("Data saved to Pad!");
  }
};


  const handleRowClick = (judgment) => {
    setSelectedRow(judgment);
    setCurrentJudgmentCitation(judgment.judgmentCitation);
    onRowClick(judgment);
  };

  const handleInitialLoad = useCallback(
    (initialRow) => {
      if (!selectedRow) {
        setSelectedRow(initialRow);
        setCurrentJudgmentCitation(initialRow.judgmentCitation);
        onRowClick(initialRow);
      }
    },
    [selectedRow, onRowClick]
  );

  const filterResultsByDate = () => {
    const from = fromDate ? new Date(fromDate) : new Date("1900-01-01");
    const to = toDate ? new Date(toDate) : new Date();
    const filtered = results.filter((result) => {
      const judgmentDate = new Date(
        result.judgmentDOJ.slice(4, 8) + "-" + result.judgmentDOJ.slice(2, 4) + "-" + result.judgmentDOJ.slice(0, 2)
      );
      return judgmentDate >= from && judgmentDate <= to;
    });
    setFilteredResults(filtered);
  };

  const filterResultsByType = () => {
    if (filterType === "All") {
      setFilteredResults(results);
    } else if (filterType === "Criminal") {
      const filtered = results.filter((result) =>
        result.judgmentCitation.includes("(Crl.)")
      );
      setFilteredResults(filtered);
    } else if (filterType === "Civil") {
      const filtered = results.filter((result) =>
        !result.judgmentCitation.includes("(Crl.)")
      );
      setFilteredResults(filtered);
    }
  };

  const filterResultsByCourtName = () => {
  console.log("Selected court type:", courtType);
  if (courtType === "All") {
    setFilteredResults(results);
  } else {
    const filtered = results.filter((result) => {
      const isMatch = result.courtName && result.courtName.toUpperCase() === courtType.toUpperCase();
      console.log(`Filtering result: ${result.courtName}, Match: ${isMatch}`);
      return isMatch;
    });
    console.log("Filtered results:", filtered);
    setFilteredResults(filtered);
  }
};

useEffect(() => {
  filterResultsByCourtName();
}, [courtType, results]);


  useEffect(() => {
    filterResultsByDate();
  }, [fromDate, toDate, results]);

  useEffect(() => {
    filterResultsByType();
  }, [filterType, results]);

  useEffect(() => {
    if (filteredResults.length > 0) {
      handleInitialLoad(filteredResults[0]);
    }
  }, [filteredResults, handleInitialLoad]);

  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
  };

const handleSearch = () => {
  const query = searchQuery.toLowerCase();

  // Function to normalize date format to search query format (dd/mm/yyyy)
  const formatDateForSearch = (dateString) => {
    // Assuming dateString is in dd/mm/yyyy format
    const [day, month, year] = dateString.split("/");
    return `${day}/${month}/${year}`; // Use a common format for comparison
  };

  const filtered = results.filter((result) => {
    // List all fields you want to include in the search
    const fieldsToSearch = [
      result.judgmentCitation,
      result.judgmentParties,
      result.courtName,
      result.partyNames,
      formatDateForSearch(result.judgmentDOJ), // Normalize date for search
      // Add more fields as needed
    ];

    // Check if any of the fields contain the query
    return fieldsToSearch.some(field =>
      field && field.toLowerCase().includes(query)
    );
  });

  setFilteredResults(filtered);
};



useEffect(() => {
  handleSearch(); // Apply search filter when searchQuery changes
}, [searchQuery, results]);


// Fetch courts
useEffect(() => {
  const fetchCourts = async () => {
    try {
      const response = await fetch(`http://61.246.67.74:4000/api/all-courts`);
      if (!response.ok) {
        throw new Error("Failed to fetch courts");
      }
      const data = await response.json();
      setCourtList(data);
      console.log("Courts fetched:", data);
    } catch (error) {
      console.error("Error fetching courts:", error);
    }
  };
  fetchCourts();
}, []);



  return (
    <main className={styles.main}>
      <div className={styles.rectangle}></div>
      <header className={styles.header}>
        <div className={styles.dateRangeSelector}>
          <label className={styles.dateLabel}>From Date</label>
          <input
            className={styles.dateInput}
            type="date"
            placeholder="mm/dd/yyyy"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className={styles.toLabel}>To Date</span>
          <input
            className={styles.dateInput}
            type="date"
            placeholder="mm/dd/yyyy"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button className={styles.clearButton} onClick={handleClearDates}>
            Clear
          </button>
        </div>
        <div className={styles.allSelector}>
          <select
            className={styles.allDropdown}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
          </select>
        </div>
        <div className={styles.allSelector}>
  <select
    className={styles.allDropdown}
    value={courtType}
    onChange={(e) => setCourtType(e.target.value)}
  >
    <option> All </option>
    {courtList.map((court) => (
          <option key={court.id} value={court.id}>
            {court.courtName}
          </option>
        ))}
  </select>
</div>



      </header>
      <footer className={styles.footer}>
        <div className={styles.pagination}>
          <button className={styles.paginationButton} onClick={handleFirstClick}>
            First
          </button>
          <button className={styles.paginationButton} onClick={handlePrevClick}>
            Prev
          </button>
          <span className={styles.paginationInfo}>
            Judgment {filteredResults.findIndex((row) => row === selectedRow) + 1} of {filteredResults.length}
          </span>
          <button className={styles.paginationButton} onClick={handleNextClick}>
            Next
          </button>
          <button className={styles.paginationButton} onClick={handleLastClick}>
            Last
          </button>
        </div>
        <div className={styles.caseInfo}>
          {currentJudgmentCitation}
        </div>
        <button className={styles.prevCaseButton}>Prev Case</button>
       <div className={styles.searchContainer}>
          <input
            className={styles.searchblock}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className={styles.searchButton}
            onClick={() => handleSearch()}
          >
            Search
          </button>
          </div>

        <button className={styles.padButton} onClick={handleSaveToPadClick}>
          Pad
        </button>
        <button className={styles.showButton} onClick={handleShowClick}>
          {showTable ? "Hide" : "Show"}
        </button>
      </footer>
      {showTable ? (
        <div className={styles.table}>
          {filteredResults.length > 0 ? (
            <JudgmentsTable
              judgmentData={filteredResults}
              onRowClick={handleRowClick}
              selectedRow={selectedRow}
              onInitialLoad={handleInitialLoad}
            />
          ) : (
            <p>No judgments found</p>
          )}
        </div>
      ) : null}
    </main>
  );
}

export default RearDashboard;
