import React, { useState, useEffect } from "react";
import styles from "./ProfileDashboard.module.css";
import Profile from "../components/Authentication/Profile";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "./../services/AuthContext";
import { notify } from "../utils/notify";

// Import MUI components
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import Box from "@mui/material/Box";
import SyncIcon from "@mui/icons-material/Sync";
import CloseIcon from "@mui/icons-material/Close";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [syncMessage, setSyncMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [clearDataOnLogout, setClearDataOnLogout] = useState(true);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSyncDatabases = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch("http://localhost:80/sync-databases", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setSyncMessage(data.message || "Database sync completed successfully.");
      } else {
        const error = await response.json();
        setSyncMessage(error.error || "Error occurred during database sync.");
      }
    } catch (error) {
      setSyncMessage("Failed to connect to the server. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const menuItems = [
    { id: "profile", icon: <PersonIcon />, text: "Profile" },

    //{ id: "settings", icon: <SettingsIcon />, text: "Settings" },
  ];

  const handleLogout = async () => {
    const confirmation = window.confirm("Are you sure you want to log out?");
    if (confirmation) {
      try {
        localStorage.removeItem("historyStack");
        localStorage.removeItem("historyResults");
        sessionStorage.removeItem("historyStack");
        sessionStorage.removeItem("historyResults");
        
        await signOut(auth);
        alert("You have successfully logged out. Your search history has been cleared.");
        navigate('/auth');
      } catch (error) {
        alert("Error during logout: " + error.message);
      }
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setClearDataOnLogout(true); // Reset to default
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);

    try {
      if (clearDataOnLogout) {
        localStorage.removeItem("padData");
        localStorage.removeItem("historyStack");
        localStorage.removeItem("historyResults");
        notify.info("Local data cleared successfully.");
      } else {
        notify.info("Your pads have been kept for next login.");
      }

      sessionStorage.clear();
      await signOut(auth);
      
      notify.success("Logged out successfully.");
      navigate('/auth');
    } catch (error) {
      notify.error("Error during logout: " + error.message);
      console.error("Logout error:", error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      default:
        return <div className={styles.defaultContent}>Select an option from the sidebar.</div>;
    }
  };

  const getActiveTabTitle = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.text : "Dashboard";
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Menu Button */}
      <div className={styles.mobileHeader}>
        <IconButton
          onClick={toggleMobileMenu}
          className={styles.mobileMenuButton}
          aria-label="toggle mobile menu"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <h1 className={styles.mobileTitle}>{getActiveTabTitle()}</h1>
      </div>

      {/* Sidebar */}
      <Box
        component="nav"
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        } ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}
      >
        {/* Desktop Menu Toggle */}
        <div className={styles.desktopMenuHeader}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={toggleSidebar}
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          
        </div>

        <List className={styles.menuList}>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`${styles.listItem} ${
                activeTab === item.id ? styles.listItemActive : ""
              }`}
            >
              <div className={styles.listItemIcon}>
                {item.icon}
              </div>
              <span
                className={`${styles.listItemText} ${
                  !isSidebarOpen && styles.hidden
                }`}
              >
                {item.text}
              </span>
            </ListItem>
          ))}

          {/* Divider */}
          <div className={styles.menuDivider}></div>

          {/* Logout Button */}
          <ListItem 
            onClick={handleLogoutClick} 
            className={`${styles.listItem} ${styles.logoutItem}`}
          >
            <div className={styles.listItemIcon}>
              <LogoutIcon />
            </div>
            <span
              className={`${styles.listItemText} ${
                !isSidebarOpen && styles.hidden
              }`}
            >
              Logout
            </span>
          </ListItem>
        </List>
      </Box>

      {/* Mobile Menu Overlay */}
{isMobileMenuOpen && (
  <div 
    className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.active : ''}`}
    onClick={() => setIsMobileMenuOpen(false)}
  ></div>
)}

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1 className={styles.contentTitle}>{getActiveTabTitle()}</h1>
        </div>
        
        <div className={styles.formContainer}>
          {renderFormContent()}
        </div>

        {/* Sync Message Display */}
        {syncMessage && (
          <div className={styles.syncMessage}>
            <p>{syncMessage}</p>
          </div>
        )}
      </div>

{/* Logout Modal - Inline */}
{showLogoutModal && (
        <div className={styles.logoutModalOverlay} onClick={handleLogoutCancel}>
          <div className={styles.logoutModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.logoutModalHeader}>
              <h2 className={styles.logoutModalTitle}> Confirm Logout</h2>
              <button className={styles.logoutCloseButton} onClick={handleLogoutCancel}>
                ×
              </button>
            </div>

            <div className={styles.logoutModalBody}>
              <p className={styles.logoutMainMessage}>
                Are you sure you want to log out?
              </p>

              <div className={styles.logoutDataOption}>
                <label className={styles.logoutCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={clearDataOnLogout}
                    onChange={(e) => setClearDataOnLogout(e.target.checked)}
                    className={styles.logoutCheckbox}
                  />
                  <span className={styles.logoutCheckboxText}>
                    <strong>Clear my saved pads and search history</strong>
                    <span className={styles.logoutCheckboxSubtext}>
                      {clearDataOnLogout 
                        ? "✓ Recommended for shared devices - all local data will be deleted"
                        : "⚠️ Your pads will remain on this browser"}
                    </span>
                  </span>
                </label>
              </div>

              <div className={styles.logoutInfoBox}>
                <p className={styles.logoutInfoText}>
                  <strong>What will be cleared:</strong>
                </p>
                <ul className={styles.logoutInfoList}>
                  <li>Saved search pads</li>
                  <li>Search history</li>
                  <li>Temporary session data</li>
                </ul>
              </div>
            </div>

            <div className={styles.logoutModalFooter}>
              <button className={styles.logoutCancelButton} onClick={handleLogoutCancel}>
                Cancel
              </button>
              <button className={styles.logoutConfirmButton} onClick={handleLogoutConfirm}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;