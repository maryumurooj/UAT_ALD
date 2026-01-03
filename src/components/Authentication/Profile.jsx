import React, { useState, useEffect } from "react";
import { db } from "../../services/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { useAuth } from "../../services/AuthContext";
import styles from "./Profile.module.css"; // Importing module CSS
import AccountBoxIcon from "@mui/icons-material/AccountBox";

const Profile = () => {
  const { user, subscriptionStatus } = useAuth();
  const [username, setUsername] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
    representative: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state to track edit mode

  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isUpdatingBilling, setIsUpdatingBilling] = useState(false);

  // Example state variables for each field to enable editing
  const [phone, setPhone] = useState(billingAddress.phone);
  const [alternatePhone, setAlternatePhone] = useState(
    billingAddress.alternatePhone
  );
  const [bemail, setbEmail] = useState(billingAddress.email);
  const [district, setDistrict] = useState(billingAddress.district);
  const [city, setCity] = useState(billingAddress.city);
  const [state, setState] = useState(billingAddress.state);
  const [pincode, setPincode] = useState(billingAddress.pincode);
  const [fullAddress, setFullAddress] = useState(billingAddress.fullAddress);
  const [firstName, setFirstName] = useState(billingAddress.firstName || "");
  const [lastName, setLastName] = useState(billingAddress.lastName || "");
  const [payment, setPayment] = useState(billingAddress.payment || "");
  const [paymentMethod, setPaymentMethod] = useState(
    billingAddress.paymentMethod || ""
  );
  const [representative, setRepresentative] = useState(
    billingAddress.representative || ""
  );
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isEditingBillingInModal, setIsEditingBillingInModal] = useState(false);

  const [imageLoaded, setImageLoaded] = useState(false);

  // Photo URL
  useEffect(() => {
    setProfilePic(<AccountBoxIcon />);
    if (user?.photoURL) {
      const img = new Image();
      img.src = user.photoURL;
      img.onload = () => {
        setImageLoaded(true);
        setProfilePic(user.photoURL);
      };
      img.onerror = () => {
        setImageLoaded(false);
        setProfilePic(<AccountBoxIcon />);
      };
    } else {
      setImageLoaded(false);
      setProfilePic(<AccountBoxIcon />);
    }
  }, [user]);

  // Fetch user subscription in real-time using onSnapshot
  useEffect(() => {
    if (!user) return;

    const subscriptionQuery = query(
      collection(db, "subscriptions"),
      where("uid", "==", user.uid),
      where("subscriptionStatus", "==", "active")
    );

    const unsubscribeSubscription = onSnapshot(
      subscriptionQuery,
      (snapshot) => {
        console.log("Snapshot size:", snapshot.size); // Check if there are any matching documents
        const subs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (subs.length > 0) {
          setSubscription(subs[0]);
          console.log("Active subscription found:", subs[0]); // Debugging
        } else {
          setSubscription(null);
          console.log("No active subscription found.");
        }
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribeSubscription();
  }, [user]);

  // Fetch billing address in real-time using onSnapshot
  useEffect(() => {
    if (!user) return;

    const billingDocRef = doc(db, "billing", user.uid);

    const unsubscribeBilling = onSnapshot(billingDocRef, (doc) => {
      if (doc.exists()) {
        setBillingAddress(doc.data());
        // Update local state variables
        setPhone(doc.data().phone || "");
        setAlternatePhone(doc.data().alternatePhone || "");
        setbEmail(doc.data().email || "");
        setDistrict(doc.data().district || "");
        setCity(doc.data().city || "");
        setState(doc.data().state || "");
        setPincode(doc.data().pincode || "");
        setFullAddress(doc.data().fullAddress || "");
      } else {
        console.log("No billing address found.");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribeBilling();
  }, [user]);

  // Photo URL
  useEffect(() => {
    if (user?.photoURL) {
      setProfilePic(user.photoURL);
    } else {
      setProfilePic("https://via.placeholder.com/150?text=👤");
    }
  }, [user]);

  // Handle profile updates (username, email, password)
  const handleUpdateProfile = async () => {
    if (!user) return;

    // Simple validation for email and password match
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }
    if (password && password !== reenterPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    setIsUpdating(true);

    try {
      await updateProfile(user, { displayName: username });
      if (email !== user.email) await updateEmail(user, email);
      if (password && password === reenterPassword)
        await updatePassword(user, password);

      // Update Firestore with the new user data
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { displayName: username, email, username });

      alert("Profile updated successfully!");
      setIsEditing(false); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to update billing address in Firestore
  const handleUpdateBilling = async () => {
    if (!user) return;
  
    // Validate phone and pincode
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }
  
    setIsUpdatingBilling(true);
  
    try {
      const billingDocRef = doc(db, "billing", user.uid);
  
      await updateDoc(billingDocRef, {
        firstName,
        lastName,
        phone,
        alternatePhone,
        district,
        city,
        state,
        pincode,
        fullAddress,
        representative,
      });
  
      alert("Billing address updated successfully!");
      setIsEditingBillingInModal(false); // 👈 Exit edit mode
      setIsBillingModalOpen(false); // 👈 Close modal after update
    } catch (error) {
      console.error("Firestore update error:", error);
      alert("Failed to update billing address. Please try again.");
    } finally {
      setIsUpdatingBilling(false);
    }
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.wrapperprofile}>
      <div className={styles.profileContainer}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <div className={styles.detailscard}>
            <div className={styles.wrapper}>
              {!imageLoaded && (
                <AccountBoxIcon
                  sx={{ fontSize: 80 }}
                  className={styles.profilePicture}
                />
              )}
              {imageLoaded && (
                <img
                  src={profilePic}
                  alt="Profile"
                  className={styles.profilePic}
                />
              )}

              <h2 className={styles.username}>{username}</h2>
              <table className={styles.table}>
                <tbody>
                  <p className={styles.role}>{email}</p>
                </tbody>
              </table>

              {/* Subscription Details */}
              {subscription ? (
                <>
                  <h2 className={styles.title}>Your Subscription</h2>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td className={styles.label}>
                          <strong>Plan:</strong>
                        </td>
                        <td className={styles.value}>
                          {subscription.planName}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Start:</strong>
                        </td>
                        <td className={styles.value}>
                          {formatFullDate(subscription.creationDate)}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>End:</strong>
                        </td>
                        <td className={styles.value}>
                          {formatFullDate(subscription.endingDate)}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Status:</strong>
                        </td>
                        <td className={styles.value}>
                          {subscription.subscriptionStatus}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No active subscription found.</p>
              )}

              {/* Edit Profile Button */}
              <button
                className={styles.updateBillingBtn}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
       {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Display Billing Address Data */}
          {billingAddress && (
            <div
              className={`${styles.detailscard} ${styles.billingcard}`}
              onClick={() => setIsBillingModalOpen(true)}
            >
              <h2 className={styles.title}>Billing Address</h2>
              <table className={styles.table}>
                  <tbody>
                    <tr>
                      <td className={styles.label}>
                        <strong>First Name:</strong>
                      </td>
                      <td className={styles.value}>
                        {billingAddress.firstName}
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Last Name:</strong>
                      </td>
                      <td className={styles.value}>
                        {billingAddress.lastName}
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Full Address:</strong>
                      </td>
                      <td className={styles.value}>
                        {billingAddress.fullAddress}
                      </td>
                    </tr>

                    <tr>
                      <td className={styles.label}>
                        <strong>District:</strong>
                      </td>
                      <td className={styles.value}>
                        {billingAddress.district}
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>City:</strong>
                      </td>
                      <td className={styles.value}>{billingAddress.city}</td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>State:</strong>
                      </td>
                      <td className={styles.value}>{billingAddress.state}</td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Pincode:</strong>
                      </td>
                      <td className={styles.value}>{billingAddress.pincode}</td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Phone:</strong>
                      </td>
                      <td className={styles.value}>{billingAddress.phone}</td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Alternate Phone:</strong>
                      </td>
                      <td className={styles.value}>
                        {billingAddress.alternatePhone || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Email:</strong>
                      </td>
                      <td className={styles.value}>{billingAddress.email}</td>
                    </tr>
                    <tr>
                      <td className={styles.label}>
                        <strong>Representative:</strong>
                      </td>
                      <td className={styles.value}>{billingAddress.representative || "N/A"}</td>
                    </tr>
                  </tbody>
              </table>
            </div>
          )}

          {/* Edit Billing Address Button */}
        </div>

        {/* Modal for Editing Profile */}
        {isEditing && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Edit Profile</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateProfile();
                }}
              >
                <div className={styles.formGroup}>
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Re-enter Password:</label>
                  <input
                    type="password"
                    value={reenterPassword}
                    onChange={(e) => setReenterPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={styles.updateButton}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isBillingModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>Billing Address</h2>

              {isEditingBillingInModal ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateBilling();
                    setIsEditingBillingInModal(false);
                    setIsBillingModalOpen(false);
                  }}
                >
                  <div className={styles.formGroup}>
                    <label>First Name:</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Last Name:</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Full Address:</label>
                    <textarea
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Town:</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>District:</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>State:</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pincode:</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Alternate Phone:</label>
                    <input
                      type="text"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Representative:</label>
                    <input
                      type="text"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.modalButtons}>
                    <button
                      type="button"
                      onClick={() => setIsEditingBillingInModal(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingBilling}
                      className={styles.updateButton}
                      onClick={handleUpdateBilling}
                    >
                      {isUpdatingBilling ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <table className={styles.table}>
                    <tbody>
                      <tr>
                        <td className={styles.label}>
                          <strong>First Name:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.firstName}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Last Name:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.lastName}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Full Address:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.fullAddress}
                        </td>
                      </tr>

                      <tr>
                        <td className={styles.label}>
                          <strong>District:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.district}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>City:</strong>
                        </td>
                        <td className={styles.value}>{billingAddress.city}</td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>State:</strong>
                        </td>
                        <td className={styles.value}>{billingAddress.state}</td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Pincode:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.pincode}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Phone:</strong>
                        </td>
                        <td className={styles.value}>{billingAddress.phone}</td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Alternate Phone:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.alternatePhone || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Email:</strong>
                        </td>
                        <td className={styles.value}>{billingAddress.email}</td>
                      </tr>
                      <tr>
                        <td className={styles.label}>
                          <strong>Representative:</strong>
                        </td>
                        <td className={styles.value}>
                          {billingAddress.representative || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className={styles.modalButtons}>
                    <button
                      onClick={() => setIsEditingBillingInModal(true)}
                      className={styles.updateButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setIsBillingModalOpen(false)}
                      className={styles.cancelButton}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
