import React from "react";
import styles from "./SignupForm.module.css"; // Ensure this import points to the correct file
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";



function SignupForm() {
   return (
     <div className={styles.LOGwrapper}>
     <div className={styles.LOGcontainer}>
       <h1 className={styles.LOGtop}> Sign Up </h1>
         <div className={styles.LOGinputbox}>
            <input type="text" className={styles.LOGinputname} placeholder="First Name" />
           <input type="text" className={styles.LOGinputname} placeholder="Last Name" />
         </div>
       <div className={styles.LOGinputbox}>
         <input type="text" className={styles.LOGinput} placeholder="Enter Username" />
       </div>

         <div className={styles.LOGinputbox}>
            <input type="password" className={styles.LOGinput} placeholder="Re-Enter Password" />
         </div>
         <div className={styles.LOGinputbox}>
            <input type="phone" className={styles.LOGinput} placeholder="Phone Number" />
         </div>
         <div className={styles.LOGinputbox}>
            <input type="text" className={styles.LOGinput} placeholder="Address" />
           
         </div>
       <div className={styles.LOGinputbox}>
           <input type="text" className={styles.LOGinput} placeholder="Pincode" />

        </div>



         <button className={styles.LOGbutton}>Submit</button>


     </div>
       </div>


  );
}

export default SignupForm;