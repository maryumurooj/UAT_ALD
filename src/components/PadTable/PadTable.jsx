import React from "react";
import styles from "./PadTable.module.css";

function PadTable({ savedData }) {
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return dateString;
    const day = dateString.slice(0, 2);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(4, 8);
    return `${day}-${month}-${year}`;
  };

  return (
    <div className={styles.tableContainer}>
      {savedData && savedData.length > 0 ? (
        savedData.map((pad, padIndex) => (
          <div key={padIndex} className={styles.padSection}>
            {/* Table Header - only show if there are results */}
            {pad.results && pad.results.length > 0 && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.headerRow}>
                      <th className={styles.headerCell}>SL</th>
                      <th className={styles.headerCell}>Date of Judgment</th>
                      <th className={styles.headerCell}>Citation</th>
                      <th className={styles.headerCell}>Parties</th>
                      <th className={styles.headerCell}>Court</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pad.results.map((judgment, index) => (
                      <tr key={index} className={styles.dataRow}>
                        <td className={styles.dataCell}>
                          <span className={styles.serialNumber}>{index + 1}</span>
                        </td>
                        <td className={styles.dataCell}>
                          <span className={styles.dateText}>
                            {formatDate(judgment.judgmentDOJ)}
                          </span>
                        </td>
                        <td className={styles.dataCell}>
                          <span className={styles.citationText}>
                            {judgment.judgmentCitation || 'N/A'}
                          </span>
                        </td>
                        <td className={styles.dataCell}>
                          <span className={styles.partiesText}>
                            {judgment.judgmentParties || 'N/A'}
                          </span>
                        </td>
                        <td className={styles.dataCell}>
                          <span className={styles.courtText}>
                            {judgment.courtName || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Empty state for pad with no results */}
            {(!pad.results || pad.results.length === 0) && (
              <div className={styles.emptyPadState}>
                <div className={styles.emptyIcon}>📭</div>
                <div className={styles.emptyMessage}>No results in this pad</div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className={styles.noDataState}>
          <div className={styles.noDataIcon}>📋</div>
          <div className={styles.noDataTitle}>No Pad Data</div>
          <div className={styles.noDataMessage}>
            Select a pad from the left panel to view its contents here.
          </div>
        </div>
      )}
    </div>
  );
}

export default PadTable;
