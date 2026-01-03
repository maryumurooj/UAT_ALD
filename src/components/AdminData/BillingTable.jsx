import React, { useEffect, useState, useRef, useMemo } from "react";
import { db } from "../../services/firebaseConfig"; // Firestore config
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore"; // Firestore methods
import styles from "./BillingTable.module.css"; // BillingTable styles
import { pdf } from "@react-pdf/renderer"; // PDF generation
import BillingPrintComp from "../PrintComps/BillingPrintComp"; // Your Billing Print Component
import { deleteDoc } from "firebase/firestore";
import SkeletonTableRow from "../Skeletons/SkeletonTableRow";

const BillingTable = () => {
  // State to hold billing data
  const [billingData, setBillingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // States for filtering inputs
  const [searchFirstName, setSearchFirstName] = useState("");
  const [searchLastName, setSearchLastName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchAlternatePhone, setSearchAlternatePhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchPincode, setSearchPincode] = useState("");
  const [searchFullAddress, setSearchFullAddress] = useState("");
  const [searchPaymentMethod, setSearchPaymentMethod] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");
  const [searchRepresentative, setSearchRepresentative] = useState("");
  const [searchCreationDate, setSearchCreationDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [searchSubscriptionStatus, setSearchSubscriptionStatus] = useState("");
  const [searchSubCreationDate, setSearchSubCreationDate] = useState("");
  const [searchSubEndingDate, setSearchSubEndingDate] = useState("");

  // Additional states for updating selected rows
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState("");
  const [updateRepresentative, setUpdateRepresentative] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);

  // ... (keep all your existing state variables)
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const [loading, setLoading] = useState(true); // Change from false to true

  // ... (keep all your existing useEffects and functions)

  // Count active filters
  useEffect(() => {
    const count = [
      searchFirstName,
      searchLastName,
      searchPhone,
      searchAlternatePhone,
      searchEmail,
      searchCity,
      searchDistrict,
      searchState,
      searchPincode,
      searchFullAddress,
      searchPaymentMethod,
      searchPaymentStatus,
      searchRepresentative,
      searchCreationDate,
      searchSubscriptionStatus,
      searchSubCreationDate,
      searchSubEndingDate,
    ].filter(Boolean).length;
    setActiveFilterCount(count);
  }, [
    searchFirstName,
    searchLastName,
    searchPhone,
    searchAlternatePhone,
    searchEmail,
    searchCity,
    searchDistrict,
    searchState,
    searchPincode,
    searchFullAddress,
    searchPaymentMethod,
    searchPaymentStatus,
    searchRepresentative,
    searchCreationDate,
    searchSubscriptionStatus,
    searchSubCreationDate,
    searchSubEndingDate,
  ]);

  const stateCityDistrictMap = {
    "Andhra Pradesh": {
      cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
      districts: ["Visakhapatnam", "Krishna", "Guntur", "Chittoor", "Nellore"],
    },
  };

  useEffect(() => {
    setLoading(true);
    const billingQuery = query(collection(db, "billing"));

    const billingUnsubscribe = onSnapshot(
      billingQuery,
      async (billingSnapshot) => {
        try {
          // Step 1: Process billing data
          const billingData = billingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBillingData(billingData);
          setFilteredData(billingData);

          // Step 2: Create a lookup map for billing by UID
          const billingMap = {};
          billingData.forEach((bill) => {
            billingMap[bill.id] = bill;
          });

          // Step 3: Fetch subscriptions
          const subsSnapshot = await getDocs(collection(db, "subscriptions"));
          const subscriptionsList = [];

          for (const subDoc of subsSnapshot.docs) {
            const subData = subDoc.data();
            const billing = billingMap[subData.uid];
            const representative = billing?.representative || "N/A";

            subscriptionsList.push({
              id: subDoc.id,
              ...subData,
              representative,
            });
          }

          // Step 4: Set subscriptions
          setSubscriptions(subscriptionsList);
          setFilteredSubscriptions(subscriptionsList);
        } catch (error) {
          console.error("Error in combined billing/subscription fetch:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching billing data:", error);
        setLoading(false);
      }
    );

    return () => billingUnsubscribe();
  }, []);
  // ✅ Place this here
  const subscriptionMap = useMemo(() => {
    const map = {};
    subscriptions.forEach((sub) => {
      if (sub.uid) {
        map[sub.uid] = sub;
      }
    });
    return map;
  }, [subscriptions]);

  useEffect(() => {
    const filterResults = billingData.filter((bill) => {
      // Match the current billing record with its subscription (via uid)
      const subscription = subscriptionMap[bill.id];

      // Existing billing filters...
      const matchesFirstName = bill.firstName
        .toLowerCase()
        .includes(searchFirstName.toLowerCase());
      const matchesLastName = bill.lastName
        .toLowerCase()
        .includes(searchLastName.toLowerCase());
      const matchesPhone = bill.phone.includes(searchPhone);
      const matchesAlternatePhone =
        bill.alternatePhone?.includes(searchAlternatePhone) ||
        "N/A".includes(searchAlternatePhone);
      const matchesEmail = bill.email
        .toLowerCase()
        .includes(searchEmail.toLowerCase());
      const matchesCity =
        bill.city && bill.city.toLowerCase().includes(searchCity.toLowerCase());
      const matchesDistrict =
        bill.district &&
        bill.district.toLowerCase().includes(searchDistrict.toLowerCase());
      const matchesState =
        bill.state &&
        bill.state.toLowerCase().includes(searchState.toLowerCase());
      const matchesPincode = bill.pincode.includes(searchPincode);
      const matchesFullAddress = bill.fullAddress
        .toLowerCase()
        .includes(searchFullAddress.toLowerCase());
      const matchesPaymentMethod = bill.paymentMethod
        .toLowerCase()
        .includes(searchPaymentMethod.toLowerCase());
      const matchesPaymentStatus = bill.payment
        .toLowerCase()
        .includes(searchPaymentStatus.toLowerCase());
      const matchesRepresentative =
        bill.representative
          ?.toLowerCase()
          .includes(searchRepresentative.toLowerCase()) ||
        "N/A".includes(searchRepresentative);
      const matchesCreationDate =
        !searchCreationDate ||
        (bill.creationDate &&
          new Date(bill.creationDate).toLocaleDateString() ===
            new Date(searchCreationDate).toLocaleDateString());

      // Subscription filters
      const matchesSubscriptionStatus =
        !searchSubscriptionStatus ||
        (subscription?.subscriptionStatus &&
          subscription.subscriptionStatus
            .toLowerCase()
            .includes(searchSubscriptionStatus.toLowerCase()));

      const matchesSubCreationDate =
        !searchSubCreationDate ||
        (subscription?.creationDate &&
          new Date(subscription.creationDate).toLocaleDateString() ===
            new Date(searchSubCreationDate).toLocaleDateString());

      const matchesSubEndingDate =
        !searchSubEndingDate ||
        (subscription?.endingDate &&
          new Date(subscription.endingDate).toLocaleDateString() ===
            new Date(searchSubEndingDate).toLocaleDateString());

      // Combine all conditions
      return (
        matchesFirstName &&
        matchesLastName &&
        matchesPhone &&
        matchesAlternatePhone &&
        matchesEmail &&
        matchesCity &&
        matchesDistrict &&
        matchesState &&
        matchesPincode &&
        matchesFullAddress &&
        matchesPaymentMethod &&
        matchesPaymentStatus &&
        matchesRepresentative &&
        matchesCreationDate &&
        matchesSubscriptionStatus &&
        matchesSubCreationDate &&
        matchesSubEndingDate
      );
    });

    setFilteredData(filterResults);
  }, [
    billingData,
    subscriptionMap,
    searchFirstName,
    searchLastName,
    searchPhone,
    searchAlternatePhone,
    searchEmail,
    searchCity,
    searchDistrict,
    searchState,
    searchPincode,
    searchFullAddress,
    searchPaymentMethod,
    searchPaymentStatus,
    searchRepresentative,
    searchCreationDate,
    // Add these dependencies for the new filters:
    searchSubscriptionStatus,
    searchSubCreationDate,
    searchSubEndingDate,
  ]);

  // Handle state, city, district changes
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity(""); // Reset city when state changes
    setSelectedDistrict(""); // Reset district when state changes
    setSearchState(newState);
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    setSelectedDistrict(""); // Reset district when city changes
    setSearchCity(newCity);
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    setSearchDistrict(newDistrict);
  };

  // Handle row selection
  const handleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle "Select All" functionality
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      const allIds = filteredData.map((row) => row.id);
      setSelectedRows(allIds); // Select all row ids
    } else {
      setSelectedRows([]); // Deselect all
    }
  };

  // Update selected rows

  const handleUpdate = async () => {
    try {
      // Check if both fields are filled
      if (!updatePaymentStatus || !updateRepresentative) {
        alert(
          "Please select both Payment Status and Representative before updating."
        );
        return; // Stop execution if either field is not selected
      }

      // Determine the new subscription status based on the payment status
      const newSubscriptionStatus =
        updatePaymentStatus === "Successful" ? "active" : "pending";

      // Proceed with updating selected rows if validation passes
      for (let rowId of selectedRows) {
        // Get the billing document reference
        const billingDocRef = doc(db, "billing", rowId);
        const billingDocSnap = await getDoc(billingDocRef);

        // If the billing document exists, proceed with the update
        if (billingDocSnap.exists()) {
          const billingData = billingDocSnap.data();

          // Get the subscriptionId from the billing document
          const subscriptionId = billingData.subscriptionId;

          // Update payment status and representative in 'billing' collection
          await updateDoc(billingDocRef, {
            payment: updatePaymentStatus,
            representative: updateRepresentative,
          });

          // Update the payment status and subscription status in the 'subscriptions' collection
          const subscriptionDocRef = doc(db, "subscriptions", subscriptionId); // Use the subscriptionId from billing data
          await updateDoc(subscriptionDocRef, {
            paymentStatus: updatePaymentStatus,
            subscriptionStatus: newSubscriptionStatus, // Update subscriptionStatus based on payment status
          });

          // Now, update the subscriptionStatus in the 'users' collection
          const subscriptionDocSnap = await getDoc(subscriptionDocRef);
          if (subscriptionDocSnap.exists()) {
            const subscriptionData = subscriptionDocSnap.data();

            // Get the user UID from the subscription data
            const userUid = subscriptionData.uid;

            // Update the subscriptionStatus in the 'users' collection
            const userDocRef = doc(db, "users", userUid); // Get the user document reference using uid
            await updateDoc(userDocRef, {
              subscriptionStatus: newSubscriptionStatus, // Update subscription status in the user's document
            });
          } else {
            console.error(
              "No subscription document found for ID:",
              subscriptionId
            );
          }
        } else {
          console.error(`No billing document found for ID: ${rowId}`);
        }
      }

      alert("Rows updated successfully");
      setSelectedRows([]); // Clear selection after update
      setUpdatePaymentStatus(""); // Reset update fields
      setUpdateRepresentative(""); // Reset update fields
    } catch (error) {
      console.error("Error updating rows:", error);
      alert("Failed to update rows");
    }
  };

  // Clear input fields
  const handleClear = () => {
    setSearchFirstName("");
    setSearchLastName("");
    setSearchPhone("");
    setSearchAlternatePhone("");
    setSearchEmail("");
    setSearchCity("");
    setSearchDistrict("");
    setSearchState("");
    setSearchPincode("");
    setSearchFullAddress("");
    setSearchPaymentMethod("");
    setSearchPaymentStatus("");
    setSearchRepresentative("");
    setSearchCreationDate("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedDistrict("");

    // Add the subscription field clears:
    setSearchSubscriptionStatus("");
    setSearchSubCreationDate("");
    setSearchSubEndingDate("");
  };

  // Refresh billing data
  const handleRefresh = () => {
    const billingQuery = query(collection(db, "billing"));
    const billingUnsubscribe = onSnapshot(
      billingQuery,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBillingData(data);
        setFilteredData(data); // Reset filtered data to fresh data
      },
      (error) => {
        console.error("Error fetching billing data:", error);
      }
    );
    // Optionally, you can also add a cleanup function for the refresh listener here if needed
  };

  //print
  const printInProgress = useRef(false);

  const printBillingData = async () => {
    if (printInProgress.current) return;

    printInProgress.current = true;
    setLoading(true);

    const formattedBillingData = filteredData.map((bill) => ({
      ...bill,
      creationDate: new Date(bill.creationDate).toLocaleDateString(),
    }));

    setLoading(false);
    const timestamp = new Date().toLocaleString();

    const MyDocumentComponent = (
      <BillingPrintComp data={formattedBillingData} timestamp={timestamp} />
    );

    const pdfBlob = await pdf(MyDocumentComponent).toBlob();
    const url = URL.createObjectURL(pdfBlob);
    window.open(url);

    setLoading(false);
    printInProgress.current = false;
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      alert("Please select rows to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedRows.length} billing record(s)?`
    );
    if (!confirmDelete) return;

    try {
      for (let rowId of selectedRows) {
        const billingDocRef = doc(db, "billing", rowId);
        await deleteDoc(billingDocRef);
      }
      alert("Selected billing record(s) deleted successfully.");
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting selected rows:", error);
      alert("Failed to delete selected rows.");
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const reps = snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.role === "representative")
        .map((user) => user.username || user.displayName);
      setRepresentatives(reps);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Compact Header */}
      <div className={styles.compactHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Billing Management</h1>
          <span className={styles.resultBadge}>
            {filteredData.length} records
          </span>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.compactButton} onClick={handleRefresh}>
            Refresh
          </button>
          <button
            className={styles.compactButton}
            onClick={printBillingData}
            disabled={filteredData.length === 0}
          >
            Print
          </button>
        </div>
      </div>

      {/* Prominent Filters Toggle Bar */}
      <div className={styles.filtersToggleBar}>
        <button
          className={`${styles.filtersToggleButton} ${
            showFilters ? styles.active : ""
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className={styles.toggleIcon}>{showFilters ? "▼" : "▶"}</span>
          <span className={styles.toggleText}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </span>
          {activeFilterCount > 0 && (
            <span className={styles.activeFilterBadge}>
              {activeFilterCount} active
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button className={styles.quickClearBtn} onClick={handleClear}>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Compact Collapsible Filters */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.compactFiltersGrid}>
            {/* Row 1 - Personal Info */}
            <input
              className={styles.filterInput}
              type="text"
              placeholder="First Name"
              value={searchFirstName}
              onChange={(e) => setSearchFirstName(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Last Name"
              value={searchLastName}
              onChange={(e) => setSearchLastName(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Phone"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Alt Phone"
              value={searchAlternatePhone}
              onChange={(e) => setSearchAlternatePhone(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="email"
              placeholder="Email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />

            {/* Row 2 - Address */}
            <select
              className={styles.filterInput}
              value={selectedState}
              onChange={handleStateChange}
            >
              <option value="">State</option>
              {Object.keys(stateCityDistrictMap).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <input
              className={styles.filterInput}
              type="text"
              placeholder="City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="text"
              placeholder="District"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Pincode"
              value={searchPincode}
              onChange={(e) => setSearchPincode(e.target.value)}
            />
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Address"
              value={searchFullAddress}
              onChange={(e) => setSearchFullAddress(e.target.value)}
            />

            {/* Row 3 - Payment & Subscription */}
            <select
              className={styles.filterInput}
              value={searchPaymentMethod}
              onChange={(e) => setSearchPaymentMethod(e.target.value)}
            >
              <option value="">Payment Method</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
            </select>
            <select
              className={styles.filterInput}
              value={searchPaymentStatus}
              onChange={(e) => setSearchPaymentStatus(e.target.value)}
            >
              <option value="">Payment Status</option>
              <option value="Pending">Pending</option>
              <option value="Successful">Successful</option>
            </select>
            <select
              className={styles.filterInput}
              value={searchRepresentative}
              onChange={(e) => setSearchRepresentative(e.target.value)}
            >
              <option value="">Representative</option>
              {representatives.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
            <select
              className={styles.filterInput}
              value={searchSubscriptionStatus}
              onChange={(e) => setSearchSubscriptionStatus(e.target.value)}
            >
              <option value="">Sub Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            {/* Row 4 - Dates */}
            <input
              className={styles.filterInput}
              type="date"
              value={searchCreationDate}
              onChange={(e) => setSearchCreationDate(e.target.value)}
              title="Creation Date"
            />
            <input
              className={styles.filterInput}
              type="date"
              value={searchSubCreationDate}
              onChange={(e) => setSearchSubCreationDate(e.target.value)}
              title="Sub Start Date"
            />
            <input
              className={styles.filterInput}
              type="date"
              value={searchSubEndingDate}
              onChange={(e) => setSearchSubEndingDate(e.target.value)}
              title="Sub End Date"
            />
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkText}>
            {selectedRows.length} selected:
          </span>

          <select
            className={styles.bulkSelect}
            value={updatePaymentStatus}
            onChange={(e) => setUpdatePaymentStatus(e.target.value)}
          >
            <option value="">Payment Status</option>
            <option value="Pending">Pending</option>
            <option value="Successful">Successful</option>
          </select>

          <select
            className={styles.bulkSelect}
            value={updateRepresentative}
            onChange={(e) => setUpdateRepresentative(e.target.value)}
          >
            <option value="">Representative</option>
            <option value="N/A">N/A</option>
            {representatives.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>

          <button
            className={styles.bulkBtn}
            onClick={handleUpdate}
            disabled={!updatePaymentStatus || !updateRepresentative}
          >
            Update
          </button>
          <button
            className={`${styles.bulkBtn} ${styles.delete}`}
            onClick={handleDeleteSelected}
          >
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className={styles.headerCell}>First Name</th>
              <th className={styles.headerCell}>Last Name</th>
              <th className={styles.headerCell}>Phone</th>
              <th className={styles.headerCell}>Alt Phone</th>
              <th className={styles.headerCell}>Email</th>
              <th className={styles.headerCell}>Sub Status</th>
              <th className={styles.headerCell}>Start Date</th>
              <th className={styles.headerCell}>End Date</th>
              <th className={styles.headerCell}>City</th>
              <th className={styles.headerCell}>District</th>
              <th className={styles.headerCell}>State</th>
              <th className={styles.headerCell}>Pincode</th>
              <th className={styles.headerCell}>Address</th>
              <th className={styles.headerCell}>Payment Method</th>
              <th className={styles.headerCell}>Payment Status</th>
              <th className={styles.headerCell}>Representative</th>
              <th className={styles.headerCell}>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Show skeleton while loading
              Array(10)
                .fill(0)
                .map((_, index) => (
                  <SkeletonTableRow key={index} columns={18} />
                ))
            ) : filteredData.length > 0 ? (
              filteredData
                .slice()
                .sort((a, b) => {
                  const dateA = a.creationDate ? new Date(a.creationDate) : 0;
                  const dateB = b.creationDate ? new Date(b.creationDate) : 0;
                  return dateB - dateA;
                })
                .map((bill) => {
                  const subscription = subscriptionMap[bill.id];
                  return (
                    <tr key={bill.id} className={styles.dataRow}>
                      <td className={styles.dataCell}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedRows.includes(bill.id)}
                          onChange={() => handleRowSelection(bill.id)}
                        />
                      </td>
                      <td className={styles.dataCell}>{bill.firstName}</td>
                      <td className={styles.dataCell}>{bill.lastName}</td>
                      <td className={styles.dataCell}>{bill.phone}</td>
                      <td className={styles.dataCell}>
                        {bill.alternatePhone || "N/A"}
                      </td>
                      <td className={styles.dataCell}>{bill.email}</td>
                      <td className={styles.dataCell}>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[subscription?.subscriptionStatus]
                          }`}
                        >
                          {subscription?.subscriptionStatus || "N/A"}
                        </span>
                      </td>
                      <td className={styles.dataCell}>
                        {subscription?.creationDate
                          ? new Date(
                              subscription.creationDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className={styles.dataCell}>
                        {subscription?.endingDate
                          ? new Date(
                              subscription.endingDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className={styles.dataCell}>{bill.city}</td>
                      <td className={styles.dataCell}>{bill.district}</td>
                      <td className={styles.dataCell}>{bill.state}</td>
                      <td className={styles.dataCell}>{bill.pincode}</td>
                      <td className={styles.dataCell}>{bill.fullAddress}</td>
                      <td className={styles.dataCell}>{bill.paymentMethod}</td>
                      <td className={styles.dataCell}>
                        <span
                          className={`${styles.paymentBadge} ${
                            styles[bill.payment?.toLowerCase()]
                          }`}
                        >
                          {bill.payment}
                        </span>
                      </td>
                      <td className={styles.dataCell}>
                        {bill.representative || "N/A"}
                      </td>
                      <td className={styles.dataCell}>
                        {bill.creationDate
                          ? new Date(bill.creationDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="18" className={styles.noData}>
                  No billing records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingTable;
