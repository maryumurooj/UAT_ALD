import React from "react";
import styles from "./EditBar.module.css"; // Import CSS module

function EditBar() {
  const icons = [
    { icon: "▢", label: "Square" },
    { icon: "○", label: "Circle" },
    { icon: "↑", label: "Arrow" },
    { icon: "✎", label: "Pen" },
    { icon: "A", label: "Text" },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.content}>
        {icons.map((item, index) => (
          <React.Fragment key={index}>
            <button className={styles.iconButton}>{item.icon}</button>
            {index < icons.length - 1 && <div className={styles.divider}></div>}
          </React.Fragment>
        ))}
      </div>
      {/* Rectangle with curved edges */}
      
    </div>
  );
}

export default EditBar;
