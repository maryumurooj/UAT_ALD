import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PadTable from "../components/PadTable/PadTable";
import FrontDBPad from "../components/PadTable/FrontDBPad";
import styles from "./PadPage.module.css"; // Add CSS module
import title from "../assets/TITLE.png";
import logo from "../assets/logo.png";
import { notify } from "../utils/notify";
import checkSubscriptionStatus from "../services/subscriptionChecker";
import { useAuth } from "../services/AuthContext";

export default function PadPage() {
  const [savedData, setSavedData] = useState([]);
  const [selectedPadIndex, setSelectedPadIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.displayName || user?.email || "User";
  // Check subscription status on component mount
  useEffect(() => {
    const verifySubscription = async () => {
      if (!user) {
        notify.error("Please log in to access this feature");
        navigate("/login");
        return;
      }

      setIsCheckingSubscription(true);

      try {
        const subscriptionResult = await checkSubscriptionStatus(user.uid);

        if (subscriptionResult.isValid) {
          setHasAccess(true);
        } else {
          notify.error("Active subscription required to access Pad feature");
          navigate("/subscription-tier");
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        notify.error("Error verifying subscription. Please try again.");
        navigate("/");
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    verifySubscription();
  }, [user, navigate]);

  // Function to load data from local storage
  useEffect(() => {
    const data = localStorage.getItem("padData");
    if (data) {
      setSavedData(JSON.parse(data));
    }
  }, []);

  // Function to clear data from local storage and state
  const clearData = () => {
    alert("Want to delete all Pads?");
    notify.delete(" All pads deleted.");
    localStorage.removeItem("padData");
    setSavedData([]);
    setSelectedPadIndex(null);
  };

  // Function to select a pad for viewing
  const selectPad = (index) => {
    setSelectedPadIndex(index);
  };

  // Function to delete specific pad
  const deletePad = (padId) => {
    const updatedData = savedData.filter((pad) => pad.id !== padId);
    setSavedData(updatedData);
    localStorage.setItem("padData", JSON.stringify(updatedData));
    notify.delete(" Pad deleted.");
    if (
      selectedPadIndex !== null &&
      savedData[selectedPadIndex]?.id === padId
    ) {
      setSelectedPadIndex(null);
    }
  };

  // Add these new print functions to your PadPage.jsx
  const printSelectedPadHTML = () => {
    if (selectedPadIndex === null) {
      alert("Please select a pad to print");
      return;
    }

    const selectedPad = savedData[selectedPadIndex];
    const currentTime = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    
    const printWindow = window.open("", "", "height=800,width=800");

    const searchQueryText = selectedPad.searchContext
      ? `${selectedPad.searchContext.type}: ${selectedPad.searchContext.displayText}`
      : "No search criteria";

    printWindow.document.write(`
      <html>
      <head>
        <title>ALD Online - Pad Results</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
          }
  
          table {
            width: 100%;
            border-collapse: collapse;
          }
  
          thead {
            display: table-header-group;
          }
  
          tbody {
            display: table-row-group;
          }
  
          .header-cell {
            padding: 15px 40px; /* Reduced padding */
            background-color: white;
            border-bottom: none;
          }
  
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
  
          .title-image {
            width: 170px;
            height: auto;
          }
  
          .timestamp {
            font-size: 10px;
            color: #666;
          }
  
          .contentcell {
            padding: 20px;
          }
  
          .container {
            height: auto;
            font-size: 12px;
            line-height: 1.5;
            text-align: center; /* Center everything */
            width: 95%; /* Slightly wider */
            max-width: 1200px; /* Increased max width */
            margin: 0 auto;
            border: none;
            padding: 0;
          }
  
          /* Compact Search Context */
          .search-context {
            text-align: center;
            margin-bottom: 15px; /* Reduced margin */
            background-color: #f8f8f8;
            padding: 10px 15px; /* Reduced padding */
            border-radius: 5px;
            border: 1px solid #eee;
            display: inline-block; /* Make it compact */
            max-width: 800px;
          }
  
          .search-context h3 {
            margin: 0 0 8px 0; /* Reduced margin */
            font-size: 16px;
            color: #333;
          }
  
          .search-info {
            display: flex;
            justify-content: center;
            gap: 30px; /* Space between type and criteria */
            flex-wrap: wrap;
            margin: 5px 0;
          }
  
          .search-info span {
            font-size: 12px;
            color: #666;
          }
  
          .search-type {
            color: #E34A3E;
            font-weight: bold;
          }
  
          .search-criteria {
            color: #333;
            font-weight: 500;
          }
  
          .result-count {
            margin-top: 8px;
            font-size: 12px;
            color: #666;
          }
  
          /* Centered Table */
          .table-wrapper {
            display: flex;
            justify-content: center;
            width: 100%;
          }
  
          .pad-table {
            width: 100%;
            max-width: 1100px; /* Limit max width */
            border-collapse: collapse;
            font-size: 14px;
            background-color: #fff;
            border: 1px solid #eee;
            border-radius: 6px;
            overflow: hidden;
            margin: 0 auto; /* Center the table */
          }
  
          .pad-table thead tr {
            background-color: #f5f5f5;
            border-bottom: 2px solid #E34A3E;
          }
  
          .pad-table th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-right: 1px solid #eee;
            white-space: nowrap;
            font-size: 13px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
  
          .pad-table th:last-child {
            border-right: none;
          }
  
          .pad-table tbody tr {
            border-bottom: 1px solid #eee;
          }
  
          .pad-table tbody tr:hover {
            background-color: #fef2f2;
          }
  
          .pad-table tbody tr:nth-child(even) {
            background-color: #fafafa;
          }
  
          .pad-table td {
            padding: 12px 16px;
            border-right: 1px solid #f0f0f0;
            vertical-align: top;
            line-height: 1.4;
            word-wrap: break-word;
            text-align: left; /* Left align table content */
          }
  
          .pad-table td:last-child {
            border-right: none;
          }
  
          .serial-number {
            display: inline-block;
            background-color: #E34A3E;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            min-width: 24px;
            text-align: center;
          }
  
          .date-text {
            font-weight: 500;
            color: #333;
            font-size: 11px;
          }
  
          .citation-text {
            color: #E34A3E;
            font-weight: 500;
            font-size: 11px;
            line-height: 1.3;
          }
  
          .parties-text {
            color: #333;
            font-size: 11px;
            line-height: 1.4;
            word-wrap: break-word;
          }
  
          .court-text {
            color: #666;
            font-size: 11px;
            font-weight: 500;
          }
  
          .footer {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #666;
            text-align: center;
          }
  
          @media print {
            thead {
              display: table-header-group;
            }
            tbody {
              display: table-row-group;
            }
            .container {
              box-shadow: none;
              border: none;
              background-color: white;
            }
            .footer {
              position: fixed;
              bottom: 5px;
              left: 50%;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <td class="header-cell">
                <div class="header-content">
                <span class="full-title">
                    <img src="${logo}" alt="Logo" style="height:40px;"/>
                    <img src="${title}" alt="Logo" style="height:40px; filter: invert(1);"/>
                </span>
                  <span class="timestamp">${currentTime}</span>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="contentcell">
                <div class="container">
                  
                  <!-- Compact Search Context Section -->
                  <div class="search-context">
                    <div class="search-info">
                      <span> Search for <span class="search-criteria">${
                        selectedPad.searchContext?.displayText || "No criteria"
                      }</span></span>
                    </div>
                    <div class="result-count">
                      <strong>Results:</strong> ${
                        selectedPad.resultCount
                      } | <strong>Saved:</strong> ${new Date(
      selectedPad.savedAt
    ).toLocaleDateString()}
                    </div>
                  </div>

                          <!-- Centered Results Table -->
                  <div class="table-wrapper">
                    <table class="pad-table">
                      <thead>
                        <tr>
                          <th style="width: 10px; text-align: center;">SL</th>
                          <th style="min-width: 60px;">Date</th>
                          <th style="width: 200px;">Citation</th>
                          <th style="min-width: 250px;">Parties</th>
                          <th style="width: 180px;">Court</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${
                          selectedPad.results && selectedPad.results.length > 0
                            ? selectedPad.results
                                .map(
                                  (judgment, index) => `
                            <tr>
                              <td style="text-align: center;">
                                <span class="serial-number">${index + 1}</span>
                              </td>
                              <td>
                                <span class="date-text">${formatDate(
                                  judgment.judgmentDOJ
                                )}</span>
                              </td>
                              <td>
                                <span class="citation-text">${
                                  judgment.judgmentCitation || "N/A"
                                }</span>
                              </td>
                              <td>
                                <span class="parties-text">${
                                  judgment.judgmentParties || "N/A"
                                }</span>
                              </td>
                              <td>
                                <span class="court-text">${
                                  judgment.courtName || "N/A"
                                }</span>
                              </td>
                            </tr>
                          `
                                )
                                .join("")
                            : '<tr><td colspan="5" style="text-align: center; color: #666;">No data available</td></tr>'
                        }
                      </tbody>
                    </table>
                  </div>
  
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; text-align: center; font-size: 12px; color: #666;">
                <div style="display: flex; justify-content: space-between;">
                  <div>Licensed to ${userName}</div>
                  <div>Copyright © Andhra Legal Decisions</div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `);

    // Helper function to format date
    function formatDate(dateString) {
      if (!dateString || dateString.length !== 8) return dateString;
      const day = dateString.slice(0, 2);
      const month = dateString.slice(2, 4);
      const year = dateString.slice(4, 8);
      return `${day}-${month}-${year}`;
    }

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  const printAllPadsHTML = () => {
    if (savedData.length === 0) {
      alert("No pads available to print");
      return;
    }

    const currentTime = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    
    const printWindow = window.open("", "", "height=800,width=800");

    const totalResults = savedData.reduce(
      (total, pad) => total + (pad.resultCount || 0),
      0
    );

    printWindow.document.write(`
      <html>
      <head>
        <title>ALD Online - All Pads Report</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
          }
  
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          tbody { display: table-row-group; }
  
          .header-cell {
            padding: 15px 40px; /* Reduced padding */
            background-color: white;
            border-bottom: none;
          }
  
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
  
          .timestamp { font-size: 10px; color: #666; }
          .contentcell { padding: 20px; }
  
          .container {
            height: auto;
            font-size: 12px;
            line-height: 1.5;
            width: 95%;
            max-width: 1200px;
            margin: 0 auto;
            text-align: center; /* Center everything */
          }
  
          .summary-section {
            text-align: center;
            margin-bottom: 25px; /* Reduced margin */
            background-color: #f0f8ff;
            padding: 15px; /* Reduced padding */ 
            border-radius: 8px;
            border: 1px solid #4a90e2;
            display: inline-block;
            max-width: 600px;
          }
  
          .summary-section h2 {
            margin: 0 0 10px 0; /* Reduced margin */
            color: #333;
            font-size: 18px;
          }
  
          /* Compact Pad Separator */
          .pad-separator {
            background-color: #f8f9fa;
            padding: 10px 15px; /* Reduced padding */
            margin: 15px auto 10px auto; /* Reduced margins and centered */
            border-radius: 6px;
            border: 1px solid #dee2e6;
            page-break-inside: avoid;
            display: inline-block;
            max-width: 800px;
            text-align: center;
          }
  
          .pad-separator h3 {
            margin: 0 0 6px 0; /* Reduced margin */
            color: #333;
            font-size: 14px;
          }
  
          .pad-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin: 4px 0;
          }
  
          .pad-info span {
            font-size: 11px;
            color: #666;
          }
  
          .search-type { color: #E34A3E; font-weight: bold; }
  
          .table-wrapper {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-bottom: 20px;
          }
  
          .pad-table {
            width: 100%;
            max-width: 1100px;
            border-collapse: collapse;
            font-size: 12px;
            background-color: #fff;
            border: 1px solid #eee;
            page-break-inside: avoid;
            margin: 0 auto;
          }
  
          .pad-table thead tr {
            background-color: #f5f5f5;
            border-bottom: 2px solid #E34A3E;
          }
  
          .pad-table th {
            padding: 8px 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-right: 1px solid #eee;
            font-size: 11px;
            text-transform: uppercase;
          }
  
          .pad-table td {
            padding: 8px 12px;
            border-right: 1px solid #f0f0f0;
            border-bottom: 1px solid #eee;
            vertical-align: top;
            line-height: 1.4;
            word-wrap: break-word;
            font-size: 11px;
            text-align: left;
          }
  
          .serial-number {
            background-color: #E34A3E;
            color: white;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
          }
  
          @media print {
            .pad-separator { page-break-inside: avoid; }
            .pad-table { page-break-inside: avoid; }
            .pad-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <td class="header-cell">
                <div class="header-content">
                            <span class="full-title">
  <img src="${logo}" alt="Logo" style="height:40px;"/>
  <img src="${title}" alt="Title" style="height:40px; filter: invert(1);"/>
</span>

                  <span class="timestamp">${currentTime}</span>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="contentcell">
                <div class="container">
                  
                  
  
                  <!-- Individual Pads -->
                  ${savedData
                    .map(
                      (pad, padIndex) => `
                      <div class="pad-block">
                    <div class="pad-criteria">
  <span>Search for <strong> ${
    pad.searchContext?.displayText || "No criteria"
  }</strong></span>
</div>

                    <div class="table-wrapper">
                      <table class="pad-table">
                        <thead>
                          <tr><th style="width: 60px; text-align: center;">SL</th>
                          <th style="width: 150px;">Date of Judgment</th>
                          <th style="width: 200px;">Citation</th>
                          <th style="min-width: 250px;">Parties</th>
                          <th style="width: 180px;">Court</th>
                         </tr>
                        </thead>
                        <tbody>
                          ${
                            pad.results && pad.results.length > 0
                              ? pad.results
                                  .map(
                                    (judgment, index) => `
                              <tr>
                                <td style="text-align: center;">
                                  <span class="serial-number">${
                                    index + 1
                                  }</span>
                                </td>
                                <td>${formatDate(judgment.judgmentDOJ)}</td>
                                <td style="color: #E34A3E; font-weight: 500;">${
                                  judgment.judgmentCitation || "N/A"
                                }</td>
                                <td>${judgment.judgmentParties || "N/A"}</td>
                                <td style="color: #666;">${
                                  judgment.courtName || "N/A"
                                }</td>
                              </tr>
                            `
                                  )
                                  .join("")
                              : '<tr><td colspan="5" style="text-align: center; color: #666;">No data available</td></tr>'
                          }
                        </tbody>
                      </table>
                    </div>
                    </div>
                  `
                    )
                    .join("")}
  
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; text-align: center; font-size: 12px; color: #666;">
                <div style="display: flex; justify-content: space-between;">
                  <div>Licensed to ${userName}</div>
                  <div>Copyright © Andhra Legal Decisions</div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `);

    function formatDate(dateString) {
      if (!dateString || dateString.length !== 8) return dateString;
      const day = dateString.slice(0, 2);
      const month = dateString.slice(2, 4);
      const year = dateString.slice(4, 8);
      return `${day}-${month}-${year}`;
    }

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  return (
    <div className={styles.container}>
      {/* Floating Metadata Widget */}
      <div className={styles.metadataWidget}>
        <div className={styles.metaItem}>
          <span className={styles.metaNumber}>{savedData.length}</span>
          <span className={styles.metaLabel}>Pads</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaNumber}>
            {savedData.length > 0
              ? savedData.reduce(
                  (total, pad) => total + (pad.resultCount || 0),
                  0
                )
              : 0}
          </span>
          <span className={styles.metaLabel}>Results</span>
        </div>
        {selectedPadIndex !== null && (
          <div className={styles.metaItem}>
            <span className={styles.metaNumber}>1</span>
            <span className={styles.metaLabel}>Selected</span>
          </div>
        )}
      </div>

      {/* Title */}

      {/* Control Buttons */}
      <div className={styles.controlsSection}>
        <FrontDBPad
          clearData={clearData}
          printPadTable={printSelectedPadHTML} // Changed
          printAllPads={printAllPadsHTML}
          isLoading={isLoading}
          hasSelection={selectedPadIndex !== null}
          totalPads={savedData.length}
        />
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className={styles.mainContent}>
        {/* Left Side - Pads List */}
        <div className={styles.leftPanel}>
          <div className={styles.padsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Saved Pads</h2>
            </div>

            <div className={styles.padsList}>
              {savedData.length > 0 ? (
                savedData.map((pad, index) => (
                  <div
                    key={pad.id}
                    className={`${styles.padTile} ${
                      selectedPadIndex === index ? styles.selectedPad : ""
                    }`}
                    onClick={() => selectPad(index)}
                  >
                    <div className={styles.padTileHeader}>
                      <span className={styles.resultCount}>
                        {pad.resultCount} Judgments
                      </span>
                      <button
                        className={styles.deleteTileButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePad(pad.id);
                        }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>

                    <div className={styles.padTileContent}>
                      <div className={styles.searchTypeCompact}>
                        {pad.searchContext?.type || "Unknown"}
                      </div>
                      <div className={styles.searchCriteriaCompact}>
                        {pad.searchContext?.displayText || "No criteria"}
                      </div>
                      <div className={styles.saveTimeCompact}>
                        {new Date(pad.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>No Saved Pads</div>
                  <div className={styles.emptyDescription}>
                    Save search results to view them here
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Detail View */}
        <div className={styles.rightPanel}>
          {selectedPadIndex !== null ? (
            <div className={styles.detailSection} id="padTable">
              {/* Search Context Display */}
              {savedData.length > 0
                ? savedData[selectedPadIndex].searchContext && (
                    <div className={styles.contextCard}>
                      <div className={styles.contextGrid}>
                        <div className={styles.contextItem}>
                          <strong>Type:</strong>{" "}
                          {savedData[selectedPadIndex].searchContext.type}
                        </div>
                        <div className={styles.contextItem}>
                          <strong>Criteria:</strong>{" "}
                          {
                            savedData[selectedPadIndex].searchContext
                              .displayText
                          }
                        </div>
                        <div className={styles.contextItem}>
                          <strong>Search Time:</strong>{" "}
                          {new Date(
                            savedData[selectedPadIndex].searchContext.timestamp
                          ).toLocaleString()}
                        </div>
                        <div className={styles.contextItem}>
                          <strong> Results:</strong>{" "}
                          {savedData[selectedPadIndex].resultCount}
                        </div>
                      </div>
                    </div>
                  )
                : 0}

              {/* Table Section */}
              <div className={styles.tableSection}>
                <PadTable savedData={[savedData[selectedPadIndex]]} />
              </div>
            </div>
          ) : (
            <div className={styles.noSelectionState}>
              <h3 className={styles.noSelectionTitle}>Select a Pad</h3>
              <p className={styles.noSelectionDescription}>
                Choose a pad from the left panel to view its details and
                results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
