import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore"; // Import Firestore methods
import { db } from "../../services/firebaseConfig"; // Import your Firestore config
import styles from "./UsersTable.module.css"; // Import CSS for table styling
import PrintComp from "../PrintComps/UsersPrintComp.jsx"; // Import PrintComp
import { pdf } from "@react-pdf/renderer"; // Import PDF generation functionality
import MyDocument from "../PrintComps/UsersPrintComp.jsx"; // Your PDF component
import SkeletonTableRow from "../Skeletons/SkeletonTableRow";

const UsersTable = () => {
  const [users, setUsers] = useState([]); // State to store fetched users
  const [filteredUsers, setFilteredUsers] = useState([]); // State to store filtered users
  const [filters, setFilters] = useState({
    username: "",
    email: "",
    role: "",
    subscriptionStatus: "",
  }); // State to store filter values
  const [selectedUsers, setSelectedUsers] = useState([]); // State to manage selected users for bulk editing
  const [selectAll, setSelectAll] = useState(false); // State for "Select All"
  const [showUnverified, setShowUnverified] = useState(false);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [selectedUnverifiedUsers, setSelectedUnverifiedUsers] = useState([]);

  //print
  const [printData, setPrintData] = useState(null); // State to hold the data for printing
  const printInProgress = useRef(false);
  const [loading, setLoading] = useState(true);
  const [downloadKey, setDownloadKey] = useState(null);
  const printTable = async () => {
    if (printInProgress.current) {
      return; // Prevent multiple print actions simultaneously
    }

    printInProgress.current = true;
    setLoading(true);

    // Format the user data for printing (similar to the formattedData in Project A)
    const formattedUserData = filteredUsers.map((user) => ({
      ...user,
      creationDate: formatDate(user.creationDate), // Format the date if necessary
    }));

    setLoading(false);

    const timestamp = new Date().toLocaleString(); // Generate current timestamp
    setDownloadKey(timestamp); // Update the state to trigger re-render

    const existingPrintContainer = document.getElementById("print-container");
    if (existingPrintContainer) {
      existingPrintContainer.remove(); // Remove existing print container
    }

    const printContainer = document.createElement("div");
    printContainer.id = "print-container";
    document.body.appendChild(printContainer);

    const MyDocumentComponent = (
      <MyDocument data={formattedUserData} timestamp={timestamp} />
    );

    // Generate the PDF and open it in a new tab for preview
    const handlePreview = async () => {
      const pdfBlob = await pdf(MyDocumentComponent).toBlob();
      const url = URL.createObjectURL(pdfBlob);
      window.open(url); // Open the PDF in a new tab for preview

      setTimeout(() => {
        if (printContainer.parentNode) {
          document.body.removeChild(printContainer);
        }
        // Reset state variables after printing
        setLoading(false);
        setDownloadKey(null);
        printInProgress.current = false; // Allow new print actions
      }, 1000); // Adjust delay as needed
    };

    handlePreview();
  };

  const fetchUsers = async () => {
    setLoading(true); // Start loading
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const billingSnapshot = await getDocs(collection(db, "billing"));

      // Build a quick-access map of billing data by user ID
      const billingMap = {};
      billingSnapshot.forEach((doc) => {
        billingMap[doc.id] = doc.data();
      });

      const userData = usersSnapshot.docs.map((docSnap) => {
        const user = { id: docSnap.id, ...docSnap.data() };
        const billing = billingMap[user.id];

        let displayName = "";

        // 1️⃣ Check user.displayName
        if (user.displayName && user.displayName.trim() !== "") {
          displayName = user.displayName.trim();
        }

        // 2️⃣ If missing, check billing full name
        if (!displayName && billing) {
          const fullName = `${billing.firstName || ""} ${
            billing.lastName || ""
          }`.trim();
          if (fullName) displayName = fullName;
        }

        // 3️⃣ If still missing, check user.username
        if (!displayName && user.username) {
          displayName = user.username;
        }

        // 4️⃣ Fallback
        if (!displayName) {
          displayName = "Unknown User";
        }

        user.displayName = displayName;

        // Optionally fill phone number from billing if missing
        if (
          (!user.phonenumber || user.phonenumber.trim() === "") &&
          billing?.phone
        ) {
          user.phonenumber = billing.phone;
        }

        return user;
      });

      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching users or billing data:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component mounts
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Extracting day, month, year, hours, minutes, and seconds
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Formatting the date and time on separate lines
    return `${day}/${month}/${year}\n${hours}:${minutes}:${seconds}`;
  };

  // Function to handle changes in the filter inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Function to apply filters and update the filtered users list
  const applyFilters = () => {
    const filtered = users.filter((user) => {
      const matchesUsername =
        !filters.username ||
        user.username?.toLowerCase().includes(filters.username.toLowerCase());

      const matchesEmail =
        !filters.email ||
        user.email?.toLowerCase().includes(filters.email.toLowerCase());

      const matchesRole =
        !filters.role ||
        user.role?.toLowerCase() === filters.role.toLowerCase();

      const matchesSubscription =
        !filters.subscriptionStatus ||
        user.subscriptionStatus?.toLowerCase() ===
          filters.subscriptionStatus.toLowerCase();

      const matchesFullName =
        !filters.displayName ||
        user.displayName
          ?.toLowerCase()
          .includes(filters.displayName.toLowerCase());

      const matchesPhone =
        !filters.phonenumber || user.phonenumber?.includes(filters.phonenumber);

      const matchesCreationDate =
        !filters.creationDate ||
        (user.creationDate &&
          new Date(user.creationDate).toLocaleDateString() ===
            new Date(filters.creationDate).toLocaleDateString());

      return (
        matchesUsername &&
        matchesEmail &&
        matchesRole &&
        matchesSubscription &&
        matchesFullName &&
        matchesPhone &&
        matchesCreationDate
      );
    });

    setFilteredUsers(filtered);
  };

  // Reapply filters when the filter inputs change
  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  // Function to toggle role (user/admin)
  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "user" ? "admin" : "user"; // Toggle between user/admin
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole }); // Update the user's role in Firestore
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      ); // Update the local state and trigger re-filtering
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Function to toggle subscription status (active/inactive)
  const toggleSubscription = async (userId, currentStatus) => {
    const newStatus = currentStatus === "inactive" ? "active" : "inactive"; // Toggle between active/inactive
    try {
      await updateDoc(doc(db, "users", userId), {
        subscriptionStatus: newStatus,
      }); // Update subscription status
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, subscriptionStatus: newStatus } : user
        )
      ); // Update the local state and trigger re-filtering
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  };

  // Function to delete a user
  const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId)); // Delete the user from Firestore
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId)); // Remove the user from local state
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Function to clear all filter inputs
  const clearFields = () => {
    setFilters({
      username: "",
      email: "",
      role: "",
      subscriptionStatus: "",
      displayName: "",
      creationDate: "",
    });
    setSelectedUsers([]); // Clear selected users as well
  };

  // Function to refresh the users list
  const refreshUsers = () => {
    fetchUsers();
  };

  // Function to handle checkbox selection
  const handleCheckboxChange = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId)); // Unselect if already selected
    } else {
      setSelectedUsers([...selectedUsers, userId]); // Select user
    }
  };

  // Function for bulk toggle role to user
  const bulkToggleRoleToUser = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => {
          return updateDoc(doc(db, "users", userId), { role: "user" });
        })
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, role: "user" } : user
        )
      );
      setSelectedUsers([]); // Clear selection after bulk edit
    } catch (error) {
      console.error("Error updating roles to user:", error);
    }
  };

  // Function for bulk toggle role to admin
  const bulkToggleRoleToAdmin = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => {
          return updateDoc(doc(db, "users", userId), { role: "admin" });
        })
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, role: "admin" } : user
        )
      );
      setSelectedUsers([]); // Clear selection after bulk edit
    } catch (error) {
      console.error("Error updating roles to admin:", error);
    }
  };

  // Function for bulk toggle subscription to active
  const bulkToggleSubscriptionToActive = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => {
          return updateDoc(doc(db, "users", userId), {
            subscriptionStatus: "active",
          });
        })
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          selectedUsers.includes(user.id)
            ? { ...user, subscriptionStatus: "active" }
            : user
        )
      );
      setSelectedUsers([]); // Clear selection after bulk edit
    } catch (error) {
      console.error("Error updating subscriptions to active:", error);
    }
  };

  // Function for bulk toggle subscription to inactive
  const bulkToggleSubscriptionToInactive = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => {
          return updateDoc(doc(db, "users", userId), {
            subscriptionStatus: "inactive",
          });
        })
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          selectedUsers.includes(user.id)
            ? { ...user, subscriptionStatus: "inactive" }
            : user
        )
      );
      setSelectedUsers([]); // Clear selection after bulk edit
    } catch (error) {
      console.error("Error updating subscriptions to inactive:", error);
    }
  };

  //funciton for bulk delete users
  const bulkDeleteUsers = async () => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => deleteDoc(doc(db, "users", userId)))
      );
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedUsers.includes(user.id))
      ); // Update local state
      setSelectedUsers([]); // Clear selection after bulk delete
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  };

  //select all function
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      const allIds = filteredUsers.map((user) => user.id); // Select all filtered user IDs
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers([]); // Deselect all users
    }
  };

  const switchRoleToRepresentative = async () => {
    try {
      const updates = selectedUsers.map(async (userId) => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { role: "representative" });
      });

      await Promise.all(updates);
      alert("Selected users role updated to representative");
    } catch (error) {
      console.error("Error updating roles:", error);
      alert("Failed to update roles");
    }
  };

  //unverified users function
  const fetchUnverifiedUsers = async () => {
    try {
      const res = await fetch("http://61.246.67.74:4000/api/unverified-users");
      const data = await res.json();
      setUnverifiedUsers(data);
      setShowUnverified(true);
    } catch (error) {
      console.error("Error fetching unverified users:", error);
    }
  };

  const verifySelectedUsers = async () => {
    if (selectedUnverifiedUsers.length === 0) return;

    try {
      // Loop over each selected user
      for (const userEmail of selectedUnverifiedUsers) {
        // Find the UID for the selected email
        const user = unverifiedUsers.find((u) => u.email === userEmail);
        if (!user) continue;

        const uid = user.uid;

        // Call backend API to verify user
        const response = await fetch(
          `http://61.246.67.74:4000/api/verify-user/${uid}`,
          {
            method: "POST",
          }
        );

        const data = await response.json();
        if (!data.success) {
          console.error("Failed to verify user:", userEmail, data);
        }
      }

      alert("Selected users verified successfully!");

      // Refresh the unverified users list after verification
      fetchUnverifiedUsers(); // Assuming you already have a function that fetches unverified users
      setSelectedUnverifiedUsers([]); // Clear selections
    } catch (error) {
      console.error("Error verifying selected users:", error);
      alert("Error verifying users. Check console for details.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Compact Header Bar */}
      <div className={styles.compactHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>User Management</h1>
          <span className={styles.resultBadge}>
            {showUnverified ? unverifiedUsers.length : filteredUsers.length}{" "}
            users
          </span>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.compactButton} onClick={refreshUsers}>
            Refresh
          </button>
          <button
            className={`${styles.compactButton} ${
              showUnverified ? styles.active : ""
            }`}
            onClick={() => {
              if (showUnverified) {
                setShowUnverified(false);
              } else {
                fetchUnverifiedUsers();
              }
            }}
          >
            {showUnverified ? "All Users" : "Unverified"}
          </button>
          <button
            className={styles.compactButton}
            onClick={printTable}
            disabled={filteredUsers.length === 0}
          >
            Print
          </button>
        </div>
      </div>

      {/* Compact Filters - Collapsible */}
      <div className={styles.filtersBar}>
        <input
          className={styles.quickFilter}
          type="text"
          name="displayName"
          value={filters.displayName}
          onChange={handleFilterChange}
          placeholder="Search name..."
        />

        <input
          className={styles.quickFilter}
          type="text"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          placeholder="Search email..."
        />

        <input
          className={styles.quickFilter}
          type="tel"
          name="phonenumber"
          value={filters.phonenumber}
          onChange={handleFilterChange}
          placeholder="Phone..."
        />

        <select
          className={styles.quickFilter}
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="representative">Representative</option>
        </select>

        <select
          className={styles.quickFilter}
          name="subscriptionStatus"
          value={filters.subscriptionStatus}
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>

        <input
          className={styles.quickFilter}
          type="date"
          name="creationDate"
          value={filters.creationDate}
          onChange={handleFilterChange}
        />

        <button className={styles.clearButton} onClick={clearFields}>
          Clear
        </button>
      </div>

      {/* Bulk Actions - Only show when needed */}
      {selectedUsers.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkText}>
            {selectedUsers.length} selected:
          </span>
          <button className={styles.bulkBtn} onClick={bulkToggleRoleToUser}>
            User
          </button>
          <button className={styles.bulkBtn} onClick={bulkToggleRoleToAdmin}>
            Admin
          </button>
          <button
            className={styles.bulkBtn}
            onClick={switchRoleToRepresentative}
          >
            Rep
          </button>
          <button
            className={`${styles.bulkBtn} ${styles.delete}`}
            onClick={bulkDeleteUsers}
          >
            Delete
          </button>
        </div>
      )}

      {/* Main Table - Takes up most space */}
      <div className={styles.tableWrapper}>
        {showUnverified ? (
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={
                      unverifiedUsers.length > 0 &&
                      selectedUnverifiedUsers.length === unverifiedUsers.length
                    }
                    onChange={() => {
                      if (
                        selectedUnverifiedUsers.length ===
                        unverifiedUsers.length
                      ) {
                        setSelectedUnverifiedUsers([]);
                      } else {
                        setSelectedUnverifiedUsers(
                          unverifiedUsers.map((u) => u.email)
                        );
                      }
                    }}
                  />
                </th>
                <th className={styles.headerCell}>Name</th>
                <th className={styles.headerCell}>Email</th>
                <th className={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unverifiedUsers
                .filter((user) => {
                  const matchesName =
                    !filters.displayName ||
                    user.displayName
                      ?.toLowerCase()
                      .includes(filters.displayName.toLowerCase());
                  const matchesEmail =
                    !filters.email ||
                    user.email
                      ?.toLowerCase()
                      .includes(filters.email.toLowerCase());
                  return matchesName && matchesEmail;
                })
                .sort((a, b) => {
                  const dateA = a.creationDate ? new Date(a.creationDate) : 0;
                  const dateB = b.creationDate ? new Date(b.creationDate) : 0;
                  return dateB - dateA;
                })
                .map((user) => (
                  <tr key={user.email} className={styles.dataRow}>
                    <td className={styles.dataCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selectedUnverifiedUsers.includes(user.email)}
                        onChange={() => {
                          if (selectedUnverifiedUsers.includes(user.email)) {
                            setSelectedUnverifiedUsers((prev) =>
                              prev.filter((e) => e !== user.email)
                            );
                          } else {
                            setSelectedUnverifiedUsers((prev) => [
                              ...prev,
                              user.email,
                            ]);
                          }
                        }}
                      />
                    </td>
                    <td className={styles.dataCell}>
                      <span className={styles.nameText}>
                        {user.displayName || "—"}
                      </span>
                    </td>
                    <td className={styles.dataCell}>
                      <span className={styles.emailText}>{user.email}</span>
                    </td>
                    <td className={styles.dataCell}>
                      <button
                        className={styles.verifyBtn}
                        onClick={() => {
                          setSelectedUnverifiedUsers([user.email]);
                          verifySelectedUsers();
                        }}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
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
                <th className={styles.headerCell}>Name</th>
                <th className={styles.headerCell}>Phone</th>
                <th className={styles.headerCell}>Email</th>
                <th className={styles.headerCell}>Role</th>
                <th className={styles.headerCell}>Created</th>
                <th className={styles.headerCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Show skeleton while loading main users data
                Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <SkeletonTableRow key={index} columns={7} />
                  ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers
                  .sort((a, b) => {
                    const dateA = a.creationDate ? new Date(a.creationDate) : 0;
                    const dateB = b.creationDate ? new Date(b.creationDate) : 0;
                    return dateB - dateA;
                  })
                  .map((user) => (
                    <tr key={user.id} className={styles.dataRow}>
                      <td className={styles.dataCell}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleCheckboxChange(user.id)}
                        />
                      </td>
                      <td className={styles.dataCell}>
                        <span className={styles.nameText}>
                          {user.displayName || "—"}
                        </span>
                      </td>
                      <td className={styles.dataCell}>
                        <span className={styles.phoneText}>
                          {user.phonenumber || "—"}
                        </span>
                      </td>
                      <td className={styles.dataCell}>
                        <span className={styles.emailText}>{user.email}</span>
                      </td>
                      <td className={styles.dataCell}>
                        <span
                          className={`${styles.roleBadge} ${styles[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className={styles.dataCell}>
                        <span className={styles.dateText}>
                          {formatDate(user.creationDate)
                            .split("\n")
                            .map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                        </span>
                      </td>
                      <td className={styles.dataCell}>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[user.subscriptionStatus]
                          }`}
                        >
                          {user.subscriptionStatus}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7" className={styles.noData}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {printData && <PrintComp data={printData} />}
    </div>
  );
};

export default UsersTable;
