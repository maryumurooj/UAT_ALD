import React from "react";
import styles from "./FrontDBPad.module.css";

function FrontDBPad({
  clearData,
  printPadTable,
  printAllPads,
  isLoading,
  hasSelection,
  totalPads,
}) {
  const items = ["Print", "Clear"];

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.printButton}`}
          onClick={printPadTable}
          disabled={isLoading || !hasSelection}
          title={
            hasSelection
              ? "Print selected pad with search context"
              : "Select a pad to print"
          }
        >
          {isLoading ? "Generating PDF..." : "Print PDF"}
        </button>

        {/* NEW - Print All Pads Button */}
        <button
          className={`${styles.button} ${styles.printAllButton}`}
          onClick={printAllPads}
          disabled={isLoading || totalPads === 0}
          title={
            totalPads > 0
              ? `Print all ${totalPads} pads in one PDF`
              : "No pads to print"
          }
        >
          {isLoading ? "Generating PDF..." : `Print All (${totalPads})`}
        </button>

        <button
          className={`${styles.button} ${styles.clearButton}`}
          onClick={clearData}
          disabled={isLoading}
        >
          Clear All Pads
        </button>
      </div>
    </div>
  );
}

export default FrontDBPad;
