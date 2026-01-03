import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Ham.module.css";

const Ham = ({ showMenu, onToggleMenu }) => {
  const navigate = useNavigate();
  const [isMenuOpenState, setIsMenuOpenState] = useState(showMenu);

  const handleNavigation = (path) => () => {
    navigate(path);
    // Close the menu after navigation on smaller screens
    if (window.innerWidth < 800) {
      onToggleMenu();
    }
  };

  const getClassName = (path) => {
    return window.location.pathname === path
      ? `${styles.navButton} ${styles.active}`
      : styles.navButton;
  };

  return (
    <div className={styles.hamContainer}>
      <button className={styles.hamburger} onClick={onToggleMenu}>
        <span className={showMenu ? styles.close : styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <div className={`${styles.hamContent} ${showMenu ? styles.open : ''}`}>
        <div className={styles.dropdown}>
          <button onClick={handleNavigation("/")} className={getClassName("/")}>
            HOME
          </button>
          <div className={styles.dropdownContent}>
            <button onClick={handleNavigation("/home")}>ABOUT</button>
            <button onClick={handleNavigation("/contact")}>CONTACT</button>
           </div>
        </div>
        <button
          onClick={handleNavigation("/index")}
          className={getClassName("/index")}
        >
          INDEX
        </button>
        <button
          onClick={handleNavigation("/casefinder")}
          className={getClassName("/casefinder")}
        >
          CASE FINDER
        </button>
        <button
          onClick={handleNavigation("/statutes")}
          className={getClassName("/statutes")}
        >
          STATUTES
        </button>
        <button
          onClick={handleNavigation("/articles")}
          className={getClassName("/articles")}
        >
          ARTICLES
        </button>
        <button
          onClick={handleNavigation("/judges-profile")}
          className={getClassName("/judges-profile")}
        >
          JUDGES PROFILE
        </button>
      </div>
    </div>
  );
};

export default Ham;
