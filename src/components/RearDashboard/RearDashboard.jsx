import React, {
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./RearDashboard.module.css";
import JudgmentsTable from "../JudgmentsTable/JudgmentsTable";
import { notify } from "../../utils/notify";
import api from "../../axios";

const RearDashboard = forwardRef(
  (
    {
      results,
      onRowClick,
      onSaveToPad,
      judgmentCount,
      onClear,
      setIsLoading,
      selectedIndex,
      searchContext,
    },
    ref
  ) => {
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

    const handleClear = () => {
      console.log("Clearing child component...");
      setSelectedRow(null);
      setFromDate("");
      setToDate("");
      setFilterType("All");
      setCourtType("All");
      setFilteredResults(results);
      setSearchQuery("");
      setCurrentJudgmentCitation("");
      onClear?.(); // Call parent onClear if defined
    };
    useImperativeHandle(ref, () => ({
      handleClear,
    }));

    const handleShowClick = () => {
      setShowTable(!showTable);
      if (!showTable && selectedRow) {
        onSaveToPad(selectedRow);
      }
    };

    const handleNextClick = () => {
      setIsLoading(true);
      const currentIndex = filteredResults.findIndex(
        (row) => row === selectedRow
      );
      const nextIndex =
        currentIndex < filteredResults.length - 1 ? currentIndex + 1 : 0;
      const nextRow = filteredResults[nextIndex];
      setSelectedRow(nextRow);
      setCurrentJudgmentCitation(nextRow.judgmentCitation);
      onRowClick(nextRow);
    };

    const handlePrevClick = () => {
      setIsLoading(true);
      const currentIndex = filteredResults.findIndex(
        (row) => row === selectedRow
      );
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : filteredResults.length - 1;
      const prevRow = filteredResults[prevIndex];
      setSelectedRow(prevRow);
      setCurrentJudgmentCitation(prevRow.judgmentCitation);
      onRowClick(prevRow);
    };

    const handleFirstClick = () => {
      setIsLoading(true);
      const firstRow = filteredResults[0];
      setSelectedRow(firstRow);
      setCurrentJudgmentCitation(firstRow.judgmentCitation);
      onRowClick(firstRow);
    };

    const handleLastClick = () => {
      setIsLoading(true);
      const lastRow = filteredResults[filteredResults.length - 1];
      setSelectedRow(lastRow);
      setCurrentJudgmentCitation(lastRow.judgmentCitation);
      onRowClick(lastRow);
    };

    const handleSaveToPadClick = () => {
      console.log("Search context received in child:", searchContext);
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

        // --- Compute date range ---
        let from = fromDate;
        let to = toDate;

        // Today's date in same format as the other dates
        const today = new Date().toLocaleDateString();

        // Extract date objects from results:
        const dates = filteredResults
          .map((result) => {
            if (!result.judgmentDOJ || result.judgmentDOJ.length !== 8)
              return null;
            return new Date(
              result.judgmentDOJ.slice(4, 8) +
                "-" +
                result.judgmentDOJ.slice(2, 4) +
                "-" +
                result.judgmentDOJ.slice(0, 2)
            );
          })
          .filter((dateObj) => !!dateObj);

        if (fromDate && !toDate) {
          // Start date is picked, end should be today
          to = today;
          from = new Date(fromDate).toLocaleDateString();
        } else if (!fromDate && toDate) {
          // End date is picked, start is earliest in results
          if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            from = minDate.toLocaleDateString();
            to = new Date(toDate).toLocaleDateString();
          } else {
            from = "N/A";
            to = new Date(toDate).toLocaleDateString();
          }
        } else if (!fromDate && !toDate) {
          // Neither set, use full span
          if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            from = minDate.toLocaleDateString();
            to = maxDate.toLocaleDateString();
          } else {
            // If results are empty, fall back
            from = "N/A";
            to = "N/A";
          }
        } else {
          // Both set
          from = new Date(fromDate).toLocaleDateString();
          to = new Date(toDate).toLocaleDateString();
        }

        // Choose 'All time records' only if really using min/max and no user input was set
        let dateRangeText;
        if (!fromDate && !toDate) {
          dateRangeText = `(All time records) ${from} to ${to}`;
        } else {
          dateRangeText = `${from} to ${to}`;
        }

        // --- Add date range to searchContext/displayText ---
        // Compose date info into a new display text that merges with previous criteria, if any
        const criteriaText = searchContext.displayText
          ? `${searchContext.displayText} | Date: ${dateRangeText}`
          : `Date: ${dateRangeText}`;

        // CREATE PAD DATA OBJECT WITH SEARCH CONTEXT
        const padData = {
          id: Date.now(), // Unique identifier for this pad entry
          results: filteredResults,
          searchContext: {
            ...searchContext,
            dateRangeText, // optional, for extra access
            displayText: criteriaText,
          },
          savedAt: new Date().toISOString(),
          resultCount: filteredResults.length,
          // Add display summary for easy identification
          searchSummary: searchContext.displayText || "No search criteria",
        };

        // ADD THE NEW PAD DATA TO EXISTING DATA
        const newData = [...existingData, padData];
        localStorage.setItem("padData", JSON.stringify(newData));

        console.log("Saved to pad with search context:", padData);
        notify.success(
          `${filteredResults.length} results saved to Pad with search context!`
        );
      } else {
        notify.error("No results to save!");
      }
    };

    const handleRowClick = (judgment) => {
      setIsLoading(true);
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
          result.judgmentDOJ.slice(4, 8) +
            "-" +
            result.judgmentDOJ.slice(2, 4) +
            "-" +
            result.judgmentDOJ.slice(0, 2)
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
        const filtered = results.filter(
          (result) => !result.judgmentCitation.includes("(Crl.)")
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
          const isMatch =
            result.courtName &&
            result.courtName.toUpperCase() === courtType.toUpperCase();
          console.log(
            `Filtering result: ${result.courtName}, Match: ${isMatch}`
          );
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

    //Function that selects first result by default, old version
    /*useEffect(() => {
    if (filteredResults.length > 0) {
      handleInitialLoad(filteredResults[0]);  // Ensure first row is loaded
      setShowTable(true);  // Automatically show the table when results are loaded
    }
  }, [filteredResults, handleInitialLoad]);*/

    //new version
    useEffect(() => {
      if (filteredResults.length > 0) {
        let isMounted = true; // ✅ Prevent state updates if unmounted

        setTimeout(() => {
          if (!isMounted) return;

          const rowToSelect =
            selectedIndex !== null &&
            selectedIndex >= 0 &&
            selectedIndex < filteredResults.length
              ? filteredResults[selectedIndex]
              : filteredResults[0]; // ✅ Use stored index if valid, else fallback to first row

          if (rowToSelect) {
            setSelectedRow(rowToSelect);
            handleRowClick(rowToSelect);
            setShowTable(true);
          } else {
            console.warn("⚠️ No valid row found for selection.");
          }
        }, 50); // Small delay ensures smoother UI updates

        return () => {
          isMounted = false; // ✅ Cleanup function to prevent state updates after unmount
        };
      }
    }, [filteredResults, selectedIndex]); // ✅ Dependencies ensure effect runs when data updates

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
        return fieldsToSearch.some(
          (field) => field && field.toLowerCase().includes(query)
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
          const response = await api.get("/api/all-courts");
          //  console.log("Raw courts response:", response);

          // The API returns an array directly
          const courtsArray = response.data;

          if (Array.isArray(courtsArray)) {
            setCourtList(courtsArray);
            // console.log("Courts fetched:", courtsArray);
          } else {
            console.error("Unexpected courts data format:", courtsArray);
          }
        } catch (error) {
          console.error("Error fetching courts:", error.message || error);
        }
      };

      fetchCourts();
    }, []);

    return (
      <main className={styles.main}>
        <div className={styles.rectangle}>
          <div className={styles.dateRangeSelector}>
            <label className={styles.dateLabel}>From</label>
            <input
              className={styles.dateInput}
              type="date"
              placeholder="mm/dd/yyyy"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <span className={styles.toLabel}>To</span>
            <input
              className={styles.dateInput}
              type="date"
              placeholder="mm/dd/yyyy"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button className={styles.clearButton} onClick={handleClear}>
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

          <div className={styles.paginationContainer}>
            <button
              className={styles.paginationButton}
              onClick={handleFirstClick}
            >
              &#x21E6; {/* Left double arrow for "First" */}
            </button>
            <button
              className={styles.paginationButton}
              onClick={handlePrevClick}
            >
              &#x2190; {/* Left arrow for "Prev" */}
            </button>
            <span className={styles.paginationInfo}>
              {filteredResults.findIndex((row) => row === selectedRow) + 1} of{" "}
              {filteredResults.length}
            </span>
            <button
              className={styles.paginationButton}
              onClick={handleNextClick}
            >
              &#x2192; {/* Right arrow for "Next" */}
            </button>
            <button
              className={styles.paginationButton}
              onClick={handleLastClick}
            >
              &#x21E8; {/* Right double arrow for "Last" */}
            </button>
          </div>

          <div className={styles.caseInfo}>
            {currentJudgmentCitation
              ? currentJudgmentCitation
              : "Judgment Citation"}
          </div>

          <div className={styles.searchContainer}>
            <input
              className={styles.searchblock}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/*<button
            className={styles.searchButton}
            onClick={() => handleSearch()}
          >
            Search
          </button>*/}
          </div>

          <button
            className={styles.padButton}
            onClick={handleSaveToPadClick}
            title={`Save ${filteredResults.length} results to Pad with search context`}
          >
            Pad
          </button>
          <button className={styles.showButton} onClick={handleShowClick}>
            {showTable ? "Hide" : "Show"}
          </button>
        </div>
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
);

export default RearDashboard;
