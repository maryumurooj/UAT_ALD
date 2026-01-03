import React from "react";
import Styles from "./LoginDash.module.css"; // Ensure this import points to the correct file

function Dash() {
  // Define contact information and icons in an array for better structure


  return (
  <div className={Styles.container}>

    <div className={Styles.contents}>
      <div className={Styles.admin}>




      </div>
    </div>
    <button className={Styles.contents}>ALD Home</button>
    <button className={Styles.contents}>Index</button>
    <button className={Styles.contents}>Case Finder</button>
    <button className={Styles.contents}>Statues</button>
    <button className={Styles.contents}>Accounts</button>
    <button className={Styles.contents}>Settings</button>
  </div>
  );
}

export default Dash;
