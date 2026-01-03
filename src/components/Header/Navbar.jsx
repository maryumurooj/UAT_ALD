import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => () => {
    navigate(path);
  };

  const getClassName = (path) => {
    return window.location.pathname === path
      ? `${styles.navButton} ${styles.active}`
      : styles.navButton;
  };

  return (
    <div className={styles.navBarDefault}>

      <div className={styles.frame}>
      <button
          onClick={handleNavigation("/")}
          className={getClassName("/")}
        > HOME        </button>
        <div className={styles.dropdown}>
          <button className={getClassName("/web-edition")}>
            WEB EDITION
          </button>
          <div className={styles.dropdownContent}>
            <button onClick={handleNavigation("/index")}
          className={getClassName("/index")}>INDEX</button>
            <button onClick={handleNavigation("/casefinder")}
          className={getClassName("/casefinder")}>ADVANCED SEARCH</button>
            
            <button  onClick={handleNavigation("/articles")}
          className={getClassName("/articles")}>ARTICLES</button>
            <button onClick={handleNavigation("/judges-profile")}
          className={getClassName("/judges-profile")}>JUDGES</button>
          </div>
        </div>
        <div className={styles.dropdown}>
          <button className={getClassName("/dashboard")}>DASHBOARD</button>
          <div className={styles.dropdownContent}>
            <button onClick={() => window.open("https://cdb.sci.gov.in//", "_blank")}>
              SUPREME COURT OF INDIA
            </button>
            <button onClick={() => window.open("https://aphc.gov.in/Hcdbs/displayboard.jsp", "_blank")}>
              HIGH COURT OF ANDHRA PRADESH
            </button>
            <button onClick={() => window.open("https://displayboard.tshc.gov.in/hcdbs/displayall", "_blank")}>
              HIGH COURT OF TELANGANA
            </button>
          </div>
        </div>
        <button
          onClick={handleNavigation("/judgments")}
          className={getClassName("/judgments")}
        >
          JUDGEMENTS
        </button>
        
      </div>
    </div>
  );
};

export default Navbar;
