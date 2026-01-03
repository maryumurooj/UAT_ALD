import React, { useState } from "react";
import UserTable from "../components/AdminData/UsersTable"; // Import the UserTable component
import SubscriptionTable from "../components/AdminData/SubscriptionTable"; // Import the SubscriptionTable component
import BillingTable from "../components/AdminData/BillingTable"; // Import the BillingTable component
import styles from "./AdminDashboard.module.css"; // Import CSS for styling
import LJ from "./LJReplace";
import Bookmark from "./Bookmark";
import Marquee from "../components/Marquee/Marquee"
import BookManager from "../components/BookManager/BookManager";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import SyncIcon from "@mui/icons-material/Sync";
import DBSync from "../components/dbsync/dbsync";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import GavelIcon from '@mui/icons-material/Gavel';
import ArticleIcon from '@mui/icons-material/Article';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StorageIcon from '@mui/icons-material/Storage';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import Pricing from "../components/Pricing/Pricing";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  // Function to handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Database Sync") {
      handleSyncDatabases(); // Start sync when tab is clicked
    }
  };
  
 
  const handleSyncDatabases = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch("http://localhost:5000/sync-databases", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setSyncMessage(data.message || "Database sync completed successfully. ");
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
    { id: "users", icon: <PeopleAltIcon />, text: "Users" },
    { id: "subscription", icon: <ArticleIcon />, text: "Subscription" },
    { id: "billing", icon: <PaymentIcon />, text: "Billing" },
    { id: "LJ", icon: <GavelIcon />, text: "Latest-Judgments" },
    { id: "Marquee", icon: <FormatQuoteIcon />, text: "Marquee" },
    { id: "BookManager", icon: <AutoStoriesIcon />, text: "BookManager" },
    { id: "Pricing", icon: <ShoppingCartOutlinedIcon />, text: "Pricing" },
    { id: "Database Sync", icon: <SyncIcon />, text: "Database Sync" },
  ];

  // Function to render different content based on the active tab
  const renderFormContent = () => {
    switch (activeTab) {
      case "users":
        return <UserTable />;
      case "subscription":
        return <SubscriptionTable />;
      case "billing":
        return <BillingTable />;
      case "LJ":
        return <LJ />;
      case "Bookmark":
        return <Bookmark />;
      case "Marquee":
        return <Marquee />;
      case "BookManager":
        return <BookManager />;
      case "Database Sync":
        return <DBSync />;
      case "Pricing":
        return <Pricing />;
      default:
        return <p>Select a form from the sidebar.</p>;
    }
  };
  

  return (
    <div className={styles.dashboardContainer}>
      

      {/* Sidebar */}
      <Box
        component="nav"
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          className={styles.menuButton}
        >
          <MenuIcon />
        </IconButton>

        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`${styles.listItem} ${
                activeTab === item.id ? styles.listItemActive : ""
              }`}
            >
              {item.icon}
              <span
                className={`${styles.listItemText} ${
                  !isSidebarOpen && styles.hidden
                }`}
              >
                {item.text}
              </span>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main content area */}
      <div className={styles.mainContent}>
        {activeTab === "users"}
      </div>

      {/* Form container beside the sidebar */}
      <div className={styles.formContainer}>
        {/* Dynamically render content based on the active tab */}
        {renderFormContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
