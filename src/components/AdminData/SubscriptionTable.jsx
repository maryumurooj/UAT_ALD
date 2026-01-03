import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore"; // Firestore methods
import { db } from "../../services/firebaseConfig"; // Firestore config
import styles from "./SubscriptionTable.module.css";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import MyDocument from "../PrintComps/SubPrintComp.jsx";
import { deleteDoc } from "firebase/firestore";
import SkeletonTableRow from '../Skeletons/SkeletonTableRow';


const SubscriptionTable = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(""); // State for selected plan
  const [selectedStatus, setSelectedStatus] = useState(""); // State for selected status
  const [filters, setFilters] = useState({
    planName: "",
    status: "",
    creationDate: "",
    endingDate: "",
    username: "", // New filter for username
  });

  const [updatePlan, setUpdatePlan] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [usernames, setUsernames] = useState({}); // Store usernames by uid

  const [loading, setLoading] = useState(true); // Add this


  const handlePlanChange = (e) => {
    setSelectedPlan(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Formatting the date and time on separate lines
    return `${day}/${month}/${year}\n${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    setLoading(true); // Start loading

  
    const unsubscribe = onSnapshot(
      collection(db, "subscriptions"),
      async (querySnapshot) => {
        try {
          // Fetch billing data in one go
          const billingSnapshot = await getDocs(collection(db, "billing"));
          const billingMap = {};
          billingSnapshot.forEach((doc) => {
            billingMap[doc.id] = doc.data();
          });

          const subscriptionsList = [];
          const usernamesMap = {};

          // Prepare all userDoc fetch promises in parallel
          const fetchPromises = querySnapshot.docs.map(async (docSnapshot) => {
            const subData = docSnapshot.data();
            const billing = billingMap[subData.uid];
            const representative = billing?.representative || "N/A";

            subscriptionsList.push({
              id: docSnapshot.id,
              ...subData,
              representative,
            });

            if (subData.uid) {
              try {
                const userDoc = await getDoc(doc(db, "users", subData.uid));

                let displayName = "";

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  displayName = userData.displayName?.trim();

                  if (!displayName && billing) {
                    const fullName = `${billing.firstName || ""} ${
                      billing.lastName || ""
                    }`.trim();
                    if (fullName) displayName = fullName;
                  }

                  if (!displayName && userData.username) {
                    displayName = userData.username;
                  }
                } else if (billing) {
                  const fullName = `${billing.firstName || ""} ${
                    billing.lastName || ""
                  }`.trim();
                  if (fullName) displayName = fullName;
                }

                usernamesMap[subData.uid] = displayName || "Unknown User";
              } catch (err) {
                console.error(
                  `Error fetching user or billing for UID ${subData.uid}`,
                  err
                );
                usernamesMap[subData.uid] = "Unknown User";
              }
            }
          });

          // Wait for all userDoc fetches to complete
          await Promise.all(fetchPromises);

          setSubscriptions(subscriptionsList);
          setFilteredSubscriptions(subscriptionsList);
          setUsernames(usernamesMap);

          console.log("✔ Subscriptions List:", subscriptionsList);
          console.log("✔ Usernames Map:", usernamesMap);
        } catch (error) {
          console.error("Error fetching subscriptions:", error);
        } finally {
          setLoading(false); // End loading
        }

      },
      (error) => {
        console.error("Error in onSnapshot listener:", error);
        setLoading(false); // End loading on error
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = subscriptions.filter((sub) => {
      const matchesPlan =
        filters.planName === "" || sub.planName === filters.planName;
      const matchesStatus =
        filters.status === "" || sub.subscriptionStatus === filters.status;

      const creationDate = new Date(sub.creationDate);
      const endingDate = new Date(sub.endingDate);

      const matchesCreationDate =
        filters.creationDate === "" ||
        creationDate.toLocaleDateString() ===
          new Date(filters.creationDate).toLocaleDateString();

      const matchesEndingDate =
        filters.endingDate === "" ||
        endingDate.toLocaleDateString() ===
          new Date(filters.endingDate).toLocaleDateString();

      // Filter by username
      const matchesUsername =
        filters.username === "" ||
        (usernames[sub.uid] &&
          usernames[sub.uid]
            .toLowerCase()
            .includes(filters.username.toLowerCase()));

      const matchesRepresentative =
        !filters.representative ||
        (sub.representative || "")
          .toLowerCase()
          .includes((filters.representative || "").toLowerCase());

      return (
        matchesPlan &&
        matchesStatus &&
        matchesCreationDate &&
        matchesEndingDate &&
        matchesUsername &&
        matchesRepresentative // <-- Add this condition
      );
    });
    setFilteredSubscriptions(filtered);
  }, [filters, subscriptions, usernames]);

  // Function to handle changes in the filter inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (id) => {
    setSelectedSubscriptions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((subId) => subId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredSubscriptions.map((sub) => sub.id);
      setSelectedSubscriptions(allIds);
    } else {
      setSelectedSubscriptions([]);
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!updatePlan || !updateStatus) {
      // If either of the values are missing, show an error or prevent the update
      alert("Please select both a plan and status before submitting.");
      return;
    }

    // If both values are present, proceed with the update logic
    console.log("Updating with plan:", updatePlan, "and status:", updateStatus);
    // Your update logic goes here
  };

  const getPlanDetails = (planName) => {
    let durationDays, priceValue;
    switch (planName.toLowerCase()) {
      case "free trial":
        durationDays = 14;
        priceValue = 0;
        break;
      case "quarterly plan":
        durationDays = 90;
        priceValue = 2700;
        break;
      case "half yearly plan":
        durationDays = 180;
        priceValue = 4500;
        break;
      case "yearly plan":
        durationDays = 365;
        priceValue = 6195;
        break;
      case "3 year plan":
        durationDays = 1095;
        priceValue = 17520;
        break;
      case "5 year plan":
        durationDays = 1825;
        priceValue = 27375;
        break;
      default:
        durationDays = 0;
        priceValue = 0;
    }
    return { durationDays, priceValue };
  };

  const handleUpdateSubscriptions = async () => {
    if (!selectedPlan || !selectedStatus) {
      alert("Please select both a plan and status before updating.");
      return;
    }

    const updates = selectedSubscriptions.map(async (subId) => {
      const subRef = doc(db, "subscriptions", subId);
      const { durationDays, priceValue } = getPlanDetails(selectedPlan);

      const currentSub = subscriptions.find((sub) => sub.id === subId);
      if (!currentSub) return;

      const now = new Date();
      const creationDate = now.toISOString();

      const MS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

      const endingDate = new Date(now.getTime() + durationDays * MS_IN_ONE_DAY);

      // Update the subscription status in the subscriptions collection
      await updateDoc(subRef, {
        planName: selectedPlan,
        subscriptionStatus: selectedStatus,
        price: priceValue,
        duration: durationDays,
        creationDate: creationDate,
        endingDate: endingDate.toISOString(),
      });

      // Also update the subscriptionStatus in the users collection
      const userRef = doc(db, "users", currentSub.uid);
      await updateDoc(userRef, {
        subscriptionStatus: selectedStatus === "active" ? "active" : "inactive",
      });
    });

    await Promise.all(updates);
    setSelectedSubscriptions([]); // Clear selected subscriptions after update
    setSelectedPlan(""); // Reset selected plan
    setSelectedStatus(""); // Reset selected status
  };

  // Clear filter fields and selected subscriptions
  const handleClearFilters = () => {
    setFilters({
      username: "",
      planName: "",
      status: "",
      representative: "", // <-- Add this field
      creationDate: "",
      endingDate: "",
    });
    setSelectedSubscriptions([]);
  };

  // Refresh subscriptions
  const handleRefreshSubscriptions = () => {
    setSubscriptions([]); // Clear current subscriptions to trigger re-fetching
    const fetchSubscriptions = () => {
      const unsubscribe = onSnapshot(
        collection(db, "subscriptions"),
        (querySnapshot) => {
          const subscriptionsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSubscriptions(subscriptionsList);
          setFilteredSubscriptions(subscriptionsList);
        },
        (error) => {
          console.error("Error fetching subscriptions:", error);
        }
      );

      return () => unsubscribe();
    };
    fetchSubscriptions();
  };

  const handlePrint = async () => {
    const formattedData = filteredSubscriptions.map((sub) => ({
      username: usernames[sub.uid] || "Unknown User",
      planName: sub.planName,
      subscriptionStatus: sub.subscriptionStatus,
      price: sub.price,
      duration: sub.duration,
      creationDate: formatDate(sub.creationDate),
      endingDate: formatDate(sub.endingDate),
    }));

    // Generate the PDF document component with formatted data
    const MyDocumentComponent = (
      <MyDocument
        data={formattedData}
        timestamp={new Date().toLocaleString()}
      />
    );

    // Generate the PDF as a blob
    const pdfBlob = await pdf(MyDocumentComponent).toBlob();
    const url = URL.createObjectURL(pdfBlob);

    // Open the blob in a new tab for preview
    window.open(url);
  };
  const handleDeleteSubscriptions = async () => {
    if (selectedSubscriptions.length === 0) {
      alert("No subscriptions selected for deletion.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedSubscriptions.length} subscription(s)?`
    );
    if (!confirmDelete) return;

    try {
      const deletions = selectedSubscriptions.map(async (subId) => {
        const subRef = doc(db, "subscriptions", subId);
        const subSnap = await getDoc(subRef);

        if (subSnap.exists()) {
          const subscriptionData = subSnap.data();

          // Delete the subscription
          await deleteDoc(subRef);

          // Update the user's subscription status to inactive
          const userRef = doc(db, "users", subscriptionData.uid);
          await updateDoc(userRef, {
            subscriptionStatus: "inactive",
          });
        }
      });

      await Promise.all(deletions);
      setSelectedSubscriptions([]); // Clear selection after deletion
      alert("Selected subscriptions deleted successfully.");
    } catch (error) {
      console.error("Error deleting subscriptions:", error);
      alert("Failed to delete some subscriptions.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Compact Header */}
      <div className={styles.compactHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Subscription Management</h1>
          <span className={styles.resultBadge}>
            {filteredSubscriptions.length} subscriptions
          </span>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.compactButton} onClick={handleRefreshSubscriptions}>
            Refresh
          </button>
          <button className={styles.compactButton} onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <input
          className={styles.quickFilter}
          type="text"
          name="username"
          value={filters.username}
          onChange={handleFilterChange}
          placeholder="Search name..."
        />

        <input
          className={styles.quickFilter}
          type="text"
          name="representative"
          value={filters.representative}
          onChange={handleFilterChange}
          placeholder="Representative..."
        />

        <select
          className={styles.quickFilter}
          name="planName"
          value={filters.planName}
          onChange={handleFilterChange}
        >
          <option value="">All Plans</option>
          <option value="Free Trial">Free Trial</option>
          <option value="Quarterly Plan">Quarterly</option>
          <option value="Half Yearly Plan">Half Yearly</option>
          <option value="Yearly Plan">Yearly</option>
          <option value="3 Year Plan">3 Year</option>
          <option value="5 Year Plan">5 Year</option>
        </select>

        <select
          className={styles.quickFilter}
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>

        <input
          className={styles.quickFilter}
          type="date"
          name="creationDate"
          value={filters.creationDate}
          onChange={handleFilterChange}
          placeholder="Creation date..."
        />

        <input
          className={styles.quickFilter}
          type="date"
          name="endingDate"
          value={filters.endingDate}
          onChange={handleFilterChange}
          placeholder="Ending date..."
        />

        <button className={styles.clearButton} onClick={handleClearFilters}>
          Clear
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedSubscriptions.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkText}>
            {selectedSubscriptions.length} selected:
          </span>

          <select
            className={styles.bulkSelect}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            <option value="">Select Plan</option>
            <option value="Free Trial">Free Trial</option>
            <option value="Quarterly Plan">Quarterly</option>
            <option value="Half Yearly Plan">Half Yearly</option>
            <option value="Yearly Plan">Yearly</option>
            <option value="3 Year Plan">3 Year</option>
            <option value="5 Year Plan">5 Year</option>
          </select>

          <select
            className={styles.bulkSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>

          <button
            className={styles.bulkBtn}
            onClick={handleUpdateSubscriptions}
            disabled={!selectedPlan || !selectedStatus}
          >
            Update
          </button>
          <button
            className={`${styles.bulkBtn} ${styles.delete}`}
            onClick={handleDeleteSubscriptions}
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  onChange={handleSelectAll}
                  checked={
                    selectedSubscriptions.length === filteredSubscriptions.length &&
                    filteredSubscriptions.length > 0
                  }
                />
              </th>
              <th className={styles.headerCell}>Name</th>
              <th className={styles.headerCell}>Plan</th>
              <th className={styles.headerCell}>Status</th>
              <th className={styles.headerCell}>Price</th>
              <th className={styles.headerCell}>Representative</th>
              <th className={styles.headerCell}>Duration</th>
              <th className={styles.headerCell}>Created</th>
              <th className={styles.headerCell}>Expires</th>
            </tr>
          </thead>
          <tbody>

            {loading ? (
    // Show skeleton while loading
    Array(10).fill(0).map((_, index) => (
      <SkeletonTableRow key={index} columns={9} />
    ))
  ) : filteredSubscriptions.length > 0 ? (filteredSubscriptions
              .slice()
              .sort((a, b) => {
                const dateA = a.creationDate ? new Date(a.creationDate) : 0;
                const dateB = b.creationDate ? new Date(b.creationDate) : 0;
                return dateB - dateA;
              })
              .map((sub) => (
                <tr key={sub.id} className={styles.dataRow}>
                  <td className={styles.dataCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedSubscriptions.includes(sub.id)}
                      onChange={() => handleCheckboxChange(sub.id)}
                    />
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.nameText}>
                      {usernames[sub.uid] || "Loading..."}
                    </span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.planText}>{sub.planName}</span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={`${styles.statusBadge} ${styles[sub.subscriptionStatus]}`}>
                      {sub.subscriptionStatus}
                    </span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.priceText}>₹{sub.price}</span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.repText}>{sub.representative || "N/A"}</span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.durationText}>{sub.duration} days</span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.dateText}>
                      {formatDate(sub.creationDate).split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </span>
                  </td>
                  <td className={styles.dataCell}>
                    <span className={styles.dateText}>
                      {formatDate(sub.endingDate).split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={styles.noData}>
                  No subscriptions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionTable;