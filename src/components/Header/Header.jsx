import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom"; // Use useNavigate instead of Navigate
import * as classes from "./Header.module.css";
import Navbar from "./Navbar";
import Ham from './Ham';
import titleImage from "../../assets/aldtitle.png";
import logo from "../../assets/logo.png";
import { useAuth } from '../../services/AuthContext';
import pic from '../../assets/logo.png';
import Dropdown from 'react-bootstrap/Dropdown';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; // Import your Firestore config
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { red } from '@mui/material/colors';
import UpdateNameModal from '../Modals/UpdateNameModal'; // Adjust path if needed


const HeaderComponent = () => {

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHamMenu, setShowHamMenu] = useState(false);
  const [remainingDays, setRemainingDays] = useState(null);
  const { user } = useAuth();
  const [profilePic, setProfilePic] = useState(AccountCircleIcon);
  const navigate = useNavigate(); // Initialize navigate hook
  const [userName, setuserName] = useState(user?.displayName || "");


  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setuserName(userData.username)
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (user?.photoURL) {
      setProfilePic(user.photoURL);
      localStorage.setItem("profilePic", user.photoURL); // Store in localStorage
    } else {
      setProfilePic(pic);
      localStorage.removeItem("profilePic"); // Clear if no user
    }
  
    checkWindowSize();
    window.addEventListener("resize", checkWindowSize);
  
    if (user) {
      fetchSubscriptionDays();
      fetchUserData();
    }
  
    return () => {
      window.removeEventListener("resize", checkWindowSize);
    };
  }, [user]);
  

  const checkWindowSize = () => {
    if (window.innerWidth < 800) {
      setIsMobile(true);
      setShowHamMenu(false); // Close Ham menu on smaller screens
    } else {
      setIsMobile(false);
    }
  };

  const fetchSubscriptionDays = async () => {
    try {
      
      console.log("fetchdays");
      const q = query(
        collection(db, "subscriptions"),
        where("uid", "==", user.uid),      
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const subscriptionData = querySnapshot.docs[0].data();
        console.log("Subscription data:", subscriptionData); // Add this line
  
        console.log("not empty snap query");
        if (subscriptionData.subscriptionStatus === "active") {
          console.log("active sub");
          const creationDate = new Date(subscriptionData.creationDate).toDateString();
          const endingDate = new Date(subscriptionData.endingDate);
          const currentDate = new Date();
  
          const differenceInTime = endingDate - currentDate;
          const remainingDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)); // Convert ms to days
  
          setRemainingDays(remainingDays > 0 ? remainingDays : 0); // Show remaining days only if active
          
          console.log(`Creation Date: ${creationDate} `);
          console.log(`Ending Date: ${endingDate.toDateString()}`);
          console.log(`Remaining Days: ${remainingDays}`);
        } else {
        console.log("inactive sub");
          setRemainingDays(null); // Hide display for inactive subscriptions
        }
      } else {
        setRemainingDays(null); // Hide if no subscription found
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleHamMenuToggle = () => {
    setShowHamMenu(!showHamMenu);
  };

  const handleProfileClick = () => {
    navigate('/profiledashboard'); // Redirect to the profile dashboard
  };

 // Custom toggle to display profile picture, name, and the subscription badge
 const CustomToggle = React.forwardRef(({ onClick }, ref) => (
  <div className={classes.pfpusername} onClick={handleProfileClick}>
    
    <div className={classes.displayname}>
    
    {user.displayName}
      
    </div>
    <AccountCircleIcon  onClick={(e) => {
        e.stopPropagation();
        handleProfileClick();
        
      }} className={classes.iconpic}
      sx={{ fontSize: 30, color: red[500] }}
      color="action"/>
   
  </div>
));


return (
  <div className={classes.headerComponent}>
    <div onClick={() => navigate("/home")} className={classes.titlelogo}>
      <img className={classes.logoImage} src={logo} alt="Logo" />
      <img className={classes.titleImage} src={titleImage} alt="Title" />
    </div>

    <div className={classes.headerComponentInner}>
      {isMobile ? (
        <Ham
          showMenu={showHamMenu}
          onToggleMenu={handleHamMenuToggle}
          className={classes.Ham}
        />
      ) : (
        <Navbar className={classes.navBarDefault} />
      )}
    </div>
    {(remainingDays !== null && user) && (
        <span className={classes.subscriptionBadge}>
          {remainingDays} {remainingDays === 1 ? 'day' : 'days Left'}
        </span>
      )}

    <div className={classes.profilebutton}>
      {user ? (
        
        
        <Dropdown>
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" />
          {/* Dropdown menu items would go here */}
        </Dropdown>
      
        
      ) : (
        <Link to="/auth">
          <button className={classes.loginButton}>LOGIN</button>
        </Link>
      )}
    </div>
  </div>
);
};

export default HeaderComponent;
