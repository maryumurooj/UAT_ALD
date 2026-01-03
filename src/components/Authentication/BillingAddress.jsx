import React, { useState, useEffect } from "react";
import styles from "./Billing.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../services/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { useAuth } from "../../services/AuthContext";
import LoginPageImage from "../../assets/bookcase.jpg";
import { getFirestore } from "firebase/firestore"; // Import Firebase Firestore
import CustomPopup from "./PaymentPopup";

const BillingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const subscriptionId = location.state?.subscriptionId || "";
  const [price, setPrice] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [subscription, setSubscription] = useState({
    planName: "",
    duration: "",
    price: 0,
  });
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    alternatePhone: "",
    email: "",
    fullAddress: "",
    state: "",
    city: "",
    district: "",
    pincode: "",
    paymentMethod: "",
    representative: "",
    payment: "pending",
    subscriptionId: subscriptionId,
  });
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    setBillingData((prevData) => ({ ...prevData, subscriptionId }));
  }, [subscriptionId]);

  useEffect(() => {
    const fetchBillingAddress = async () => {
      if (user) {
        const billingRef = doc(db, "billing", user.uid);
        const billingSnap = await getDoc(billingRef);

        if (billingSnap.exists()) {
          const savedBillingData = billingSnap.data();
          setBillingData((prevData) => ({
            ...prevData,
            ...savedBillingData, // Merge saved data into the existing state
          }));
        }
      }
    };

    fetchBillingAddress();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingData({ ...billingData, [name]: value });

    // If state is changed, reset city and district
    if (name === "state") {
      setBillingData({ ...billingData, city: "", district: "" }); // Reset city and district
    }

    if (name === "representative") {
      setBillingData((prev) => ({
        ...prev,
        representative: value === " " ? null : value,
      }));
    } else {
      setBillingData({ ...billingData, [name]: value });
    }
  };

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [showCustomTownInput, setShowCustomTownInput] = useState(false);
  const [customTown, setCustomTown] = useState("");

  const [showCustomDistrictInput, setShowCustomDistrictInput] = useState(false);
  const [customDistrict, setCustomDistrict] = useState("");

  const [stateloading, setstateLoading] = useState({
    states: false,
    districts: false,
    towns: false,
  });

  // Fetch all states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true); // Start loading
      try {
        const response = await fetch(
          "https://testing-api-jxpl.onrender.com/states"
        );
        const data = await response.json();
        // Handle both array of strings and array of objects
        const statesData = Array.isArray(data)
          ? data.map((item) => (typeof item === "string" ? item : item.name))
          : [];
        setStates(statesData);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoadingStates(false); // Stop loading (whether success or error)
      }
    };

    fetchStates();
  }, []);

  // Fetch districts when a state is selected
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!billingData.state) {
        setDistricts([]);
        return;
      }

      setstateLoading((prev) => ({ ...prev, districts: true }));
      try {
        const response = await fetch(
          `https://testing-api-jxpl.onrender.com/states/${billingData.state}/districts`
        );
        const data = await response.json();
        // Handle both array of strings and array of objects
        const districtsData = Array.isArray(data)
          ? data.map((item) => (typeof item === "string" ? item : item.name))
          : [];
        setDistricts(districtsData);
        setTowns([]); // Reset towns when state changes
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setstateLoading((prev) => ({ ...prev, districts: false }));
      }
    };

    fetchDistricts();
  }, [billingData.state]);

  // Fetch towns when a district is selected
  useEffect(() => {
    const fetchTowns = async () => {
      if (!billingData.state || !billingData.district) {
        setTowns([]);
        return;
      }

      setstateLoading((prev) => ({ ...prev, towns: true }));
      try {
        const response = await fetch(
          `https://testing-api-jxpl.onrender.com/states/${billingData.state}/districts/${billingData.district}/towns`
        );
        const data = await response.json();
        // Handle both array of strings and array of objects
        const townsData = Array.isArray(data)
          ? data.map((item) => (typeof item === "string" ? item : item.name))
          : [];
        setTowns(townsData);
      } catch (error) {
        console.error("Error fetching towns:", error);
      } finally {
        setstateLoading((prev) => ({ ...prev, towns: false }));
      }
    };

    fetchTowns();
  }, [billingData.state, billingData.district]);

  const handleStateChange = (e) => {
    const value = e.target.value;
    setShowCustomTownInput(false);
    setShowCustomDistrictInput(false);
    setBillingData((prev) => ({
      ...prev,
      state: value,
      district: "", // Reset dependent fields
      city: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setShowCustomTownInput(false);
    setShowCustomDistrictInput(false);
    setBillingData((prev) => ({
      ...prev,
      district: value,
      city: "", // Reset dependent field
    }));
  };

  const handleTownChange = (e) => {
    const value = e.target.value;
    setBillingData((prev) => ({
      ...prev,
      city: value === "Other" ? customTown : value,
    }));
  };

  // Add this function to handle custom district submission
  const handleCustomDistrictSubmit = async () => {
    if (!customDistrict) {
      alert("Please enter a district name");
      return;
    }

    // Format district name (capitalize first letter of each word)
    const formattedDistrict = customDistrict
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    try {
      // Submit to API
      await fetch(
        `https://testing-api-jxpl.onrender.com/states/${encodeURIComponent(
          billingData.state
        )}/districts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: formattedDistrict }),
        }
      );

      // Update the districts list and select the new district
      setDistricts([...districts, formattedDistrict]);
      setBillingData((prev) => ({
        ...prev,
        district: formattedDistrict,
        city: "", // Reset city when district changes
      }));
      setShowCustomDistrictInput(false);
      setCustomDistrict("");
    } catch (error) {
      console.error("Error adding district:", error);
      alert("Failed to add new district. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));
  };

  //RazorPay

  // Fetch subscription price from Firestore
  useEffect(() => {
    const fetchPrice = async () => {
      if (!subscriptionId) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const subscriptionRef = doc(db, "subscriptions", subscriptionId);
        const subscriptionSnap = await getDoc(subscriptionRef);

        if (subscriptionSnap.exists()) {
          const data = subscriptionSnap.data();
          setSubscription({
            planName: data.planName,
            duration: data.duration,
            price: data.price,
          });
          setPrice(data.price);

          // Update billingData with subscriptionId
          setBillingData((prev) => ({
            ...prev,
            subscriptionId: subscriptionId,
          }));
        } else {
          console.error("No such subscription!");
          setSubscription({
            planName: "",
            duration: "",
            price: 0,
          });
          setPrice(0);
        }
      } catch (error) {
        console.error("Error fetching subscription details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice(); // Corrected function call
  }, [subscriptionId]);

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Check if subscription is valid
    if (!billingData.subscriptionId || price === undefined || price === null) {
      alert(
        "Invalid subscription selected. Please go back and choose a valid subscription."
      );
      return;
    }

    // Handle custom district if "Other" was selected
    if (billingData.district === "Other") {
      if (!customDistrict) {
        alert("Please enter your district name.");
        return;
      }

      // Format district name (capitalize first letter of each word)
      const formattedDistrict = customDistrict
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      // Submit to API
      try {
        await fetch(
          `https://testing-api-jxpl.onrender.com/states/${encodeURIComponent(
            billingData.state
          )}/districts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: formattedDistrict }),
          }
        );

        // Update billingData with formatted district name
        billingData.district = formattedDistrict;
      } catch (error) {
        console.error("Error adding district:", error);
        alert("Failed to add new district. Please try again.");
        return;
      }
    }

    // Handle custom town if "Other" was selected
    if (billingData.city === "Other") {
      if (!customTown) {
        alert("Please enter your town name.");
        return;
      }

      // Format town name (capitalize first letter of each word)
      const formattedTown = customTown
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      // Submit to API
      try {
        await fetch(
          `https://testing-api-jxpl.onrender.com/states/${encodeURIComponent(
            billingData.state
          )}/districts/${encodeURIComponent(billingData.district)}/towns`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: formattedTown }),
          }
        );

        // Update billingData with formatted town name
        billingData.city = formattedTown;
      } catch (error) {
        console.error("Error adding town:", error);
        alert("Failed to add new town. Please try again.");
        return;
      }
    }

    // Validate required fields in billingData
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "fullAddress",
      "state",
      "city",
      "district",
      "pincode",
    ];

    if (price > 0) {
      requiredFields.push("paymentMethod"); // Only required if not free
    }

    for (let field of requiredFields) {
      if (!billingData[field]) {
        alert(`Please fill in the ${field}.`);
        return;
      }
    }

    const { paymentMethod } = billingData;

    // Prepare final billing data
    const finalBillingData = {
      ...billingData,
      uid: user.uid,
      creationDate: new Date().toISOString(),
    };

    try {
      // Save billing information to Firestore only if all fields are filled
      await setDoc(doc(db, "billing", user.uid), finalBillingData);
      console.log("Billing information saved successfully.");

      if (price <= 0) {
        // Handle free trial logic
        const subscriptionDocRef = doc(
          db,
          "subscriptions",
          billingData.subscriptionId
        );
        await updateDoc(subscriptionDocRef, {
          subscriptionStatus: "active",
        });

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          subscriptionStatus: "active",
          freeTrialStatus: "inuse", // Mark trial as in use
        });

        alert("Free trial activated successfully.");

        // Send subscription confirmation email
        try {
          await fetch("http://61.246.67.74:4000/sendEmail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: `${billingData.firstName} ${billingData.lastName}`,
              email: billingData.email,
            }),
          });

          console.log("Email sent successfully");
        } catch (error) {
          console.error("Failed to send email:", error);
        }

        navigate("/");
        return;
      }

      if (paymentMethod === "cash") {
        // Show popup for cash payment
        setIsPopupOpen(true);
        return;
      } else if (paymentMethod === "online") {
        // Trigger Razorpay checkout
        proceedToRazorpayCheckout();
      } else {
        alert("Invalid payment method selected.");
      }
    } catch (error) {
      console.error("Error during checkout process:", error);
      alert(
        "An error occurred while processing your checkout. Please try again."
      );
    }
  };

  // Function to proceed with Razorpay

  // Function to proceed with Razorpay
  const proceedToRazorpayCheckout = async () => {
    try {
      // Update the paymentMethod to 'online' in Firestore
      const billingDocRef = doc(db, "billing", user.uid);
      await updateDoc(billingDocRef, {
        paymentMethod: "online", // Set payment method to online
      });

      // Proceed to Razorpay checkout
      const response = await fetch(
        "http://61.246.67.74:4000/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: price,
            currency: "INR",
            receipt: `receipt_${billingData.subscriptionId}`,
          }),
        }
      );

      const data = await response.json();

      const options = {
        key: "rzp_live_qMTTMOsAEnmxqj", // Your Razorpay API key
        amount: price * 100, // Amount in paise (multiply by 100 to convert to INR)
        currency: "INR",
        name: `${billingData.firstName} ${billingData.lastName}`,
        description: `Billing for: ${billingData.fullAddress}`,
        order_id: billingData.orderId, // Optional order ID
        handler: async (response) => {
          try {
            console.log("Payment response:", response);

            const paymentStatus = "Successful"; // Mark payment as received

            // Update payment status in 'billing' collection
            await updateDoc(billingDocRef, {
              payment: paymentStatus,
            });

            // Update subscription status in the 'subscriptions' collection
            const subscriptionDocRef = doc(
              db,
              "subscriptions",
              billingData.subscriptionId
            );
            await updateDoc(subscriptionDocRef, {
              subscriptionStatus: "active", // Set subscriptionStatus to active
            });

            // Optionally, update the subscriptionStatus in the 'users' collection
            const subscriptionDocSnap = await getDoc(subscriptionDocRef);
            if (subscriptionDocSnap.exists()) {
              const subscriptionData = subscriptionDocSnap.data();

              // Get the user UID from the subscription data
              const userUid = subscriptionData.uid;

              const userDocRef = doc(db, "users", userUid);
              await updateDoc(userDocRef, {
                subscriptionStatus: "active", // Set subscriptionStatus in the user's document
              });
            } else {
              console.error(
                "No subscription document found for ID:",
                billingData.subscriptionId
              );
            }
            navigate("/");
          } catch (error) {
            console.error("Error updating Firestore:", error);
            alert("An error occurred while updating Firestore.");
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment process was cancelled by the user");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const [representatives, setRepresentatives] = useState([]);
  const [reploading, setRepLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState("");

  // Function to fetch representatives
  const fetchRepresentatives = async () => {
    try {
      // Create a query that filters users by role 'representative'
      const q = query(
        collection(db, "users"),
        where("role", "==", "representative")
      );
      const querySnapshot = await getDocs(q);

      const repData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRepresentatives(repData);
      setRepLoading(false);
    } catch (error) {
      console.error("Error fetching representatives:", error);
      setRepLoading(false);
    }
  };

  useEffect(() => {
    fetchRepresentatives();
  }, []);

  const handleRepChange = (e) => {
    const selectedUsername = e.target.value;
    setSelectedRep(selectedUsername);

    // Update billingData with the selected representative ID
    setBillingData((prev) => ({
      ...prev,
      representative: selectedUsername === " " ? null : selectedUsername, // Store null if "None" is selected
    }));
  };

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  return (
    <div
      className={styles.billingContainer}
      style={{
        backgroundImage: `url(${LoginPageImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center 80%",
        justifyContent: "center",
      }}
    >
      <CustomPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onContinue={proceedToRazorpayCheckout}
      />
      <div className={styles.billingForm}>
        <h2 className={styles.title}>Billing Address/Registration Form</h2>
        <form>
          <div className={styles.inputContainer}>
            <input
              type="text"
              name="firstName"
              className={styles.BillingInputField}
              placeholder="First Name"
              value={billingData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              className={styles.BillingInputField}
              placeholder="Last Name"
              value={billingData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <input
              type="text"
              name="phone"
              className={styles.BillingInputField}
              placeholder="Phone"
              value={billingData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="alternatePhone"
              className={styles.BillingInputField}
              placeholder="Alternate Phone"
              value={billingData.alternatePhone}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.inputContainer}>
            <input
              type="email"
              name="email"
              className={styles.BillingInputField}
              placeholder="Email"
              value={billingData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <input
              type="text"
              name="fullAddress"
              className={styles.BillingInputField}
              placeholder="Full Address"
              value={billingData.fullAddress}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <select
              id="state"
              name="state"
              value={billingData.state}
              disabled={loadingStates}
              onChange={handleStateChange}
              required
              className={styles.BillingInputField}
            >
              <option value="">Select State</option>
              {loadingStates ? (
                <option disabled>Loading states...</option>
              ) : (
                states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))
              )}
            </select>{" "}
            {loading.states && <small>Loading states...</small>}
            <select
              id="district"
              name="district"
              value={billingData.district}
              disabled={!billingData.state || loading.districts}
              onChange={(e) => {
                const value = e.target.value;
                setShowCustomDistrictInput(value === "Other");
                setBillingData((prev) => ({
                  ...prev,
                  district: value === "Other" ? customDistrict : value,
                  city: "", // Reset city when district changes
                }));
              }}
              required
              className={styles.BillingInputField}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
              <option value="Other">Other (please specify)</option>
            </select>
            {showCustomDistrictInput && (
              <input
                type="text"
                name="customDistrict"
                value={customDistrict}
                onChange={(e) => {
                  setCustomDistrict(e.target.value);
                  // Update billingData immediately as user types
                  setBillingData((prev) => ({
                    ...prev,
                    district: e.target.value,
                  }));
                }}
                placeholder="Please enter your District"
                required
                className={styles.BillingInputField}
              />
            )}
            <select
              id="town"
              name="town"
              value={billingData.city}
              onChange={(e) => {
                const value = e.target.value;
                setShowCustomTownInput(value === "Other");
                handleTownChange(e);
              }}
              disabled={!billingData.district || loading.towns}
              required
              className={styles.BillingInputField}
            >
              <option value="">Select Town</option>
              {towns.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
              <option value="Other">Other (please specify)</option>
            </select>
            {showCustomTownInput && (
              <input
                type="text"
                name="customTown"
                value={customTown}
                onChange={(e) => {
                  setCustomTown(e.target.value);
                  // Update billingData immediately as user types
                  setBillingData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }));
                }}
                placeholder="Please enter your town"
                required
                className={styles.BillingInputField}
              />
            )}
          </div>
          <div className={styles.inputContainer}>
            <input
              type="text"
              name="pincode"
              className={styles.BillingInputField}
              placeholder="Pincode"
              value={billingData.pincode}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <select
              name="representative" // Add name attribute to match billingData
              value={billingData.representative || ""}
              onChange={handleRepChange}
              className="representative-dropdown" // Add your CSS class here
            >
              <option value="">Select a representative</option>
              <option value=" ">None</option>
              {representatives.map((rep) => (
                <option key={rep.id} value={rep.username}>
  {rep.displayName || rep.username || "Unnamed Representative"}
</option>

              ))}
            </select>
          </div>
          {/* Plan Details Box */}
          <div className={styles.subscriptionContainer}>
            <div className={styles.subscriptionTile}>
              <h3>Selected Plan Details</h3>
              <p>
                <strong>Plan:</strong>{" "}
                <span className={styles.highlight}>
                  {subscription.planName || "Not Selected"}
                </span>
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                <span className={styles.highlight}>
                  {subscription.duration || "Not Selected"} Days
                </span>
              </p>
              <p>
                <strong>Price:</strong>{" "}
                <span className={styles.highlight}>
                  ₹{subscription.price || "0"}
                </span>
              </p>
            </div>
          </div>
          <h3>Select Payment Method</h3>
          <div className={styles.paymentOptions}>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={billingData.paymentMethod === "cash"}
                onChange={handleInputChange}
              />
              Cash
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={billingData.paymentMethod === "online"}
                onChange={handleInputChange}
              />
              Online
            </label>
          </div>
          <button onClick={handleCheckout} className={styles.submitButton}>
            Proceed to Checkout
          </button>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;
