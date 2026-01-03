import React from "react";
import styles from "./LoginForm.module.css"; // Ensure this import points to the correct file
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";



function LoginForm() {
   return (
     <div className={styles.LOGwrapper}>
     <div className={styles.LOGcontainer}>
       <h1 className={styles.LOGtop}> Login </h1>
     <div className={styles.LOGinputbox}>
       <input type="text" className={styles.LOGinputfields} placeholder="Enter Userame" /><FaUser className={styles.LOGicon}/>
     </div>
     <div className={styles.LOGinputbox}>
        <input type="password" className={styles.LOGinputfields} placeholder="Enter Password" /><RiLockPasswordFill className={styles.LOGicon} />
     </div>
     <div className={styles.LOGrememberforget}>

       <a href="#" className={styles.LOGforgotpassword}>Forgot Password?</a>
     </div>

       <button className={styles.LOGbutton}>Submit</button>

       <div className={styles.LOGregisterlink}>
       Dont have an account? <a href="signup">Sign Up</a>
       </div>
                   

     </div>
       </div>


  );
}

export default LoginForm;