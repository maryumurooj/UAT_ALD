import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../services/firebaseConfig.js";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import styles from "./Auth.module.css";
import LoginPageImage from "../../assets/bookcase.jpg";
import googleicon from "../../assets/google.png";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
import UpdateUsernameModal from "../Modals/UpdateNameModal.jsx";


const Auth = () => {
  const [email, setEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setdisplayName] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [googleName, setgoogleName] = useState("");

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "#e0e0e0"
  });
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, feedback: "", color: "#e0e0e0" };
    }

    let score = 0;
    let feedback = "";
    let color = "";

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // special characters

    // Common patterns (reduce score)
    if (/(.)\1{2,}/.test(password)) score -= 1; // repeated characters
    if (/123|abc|qwe|password/i.test(password)) score -= 1; // common patterns

    // Determine feedback and color based on score
    if (score <= 1) {
      feedback = "Very Weak";
      color = "#ff4444";
    } else if (score <= 2) {
      feedback = "Weak";
      color = "#ff8800";
    } else if (score <= 3) {
      feedback = "Fair";
      color = "#ffaa00";
    } else if (score <= 4) {
      feedback = "Good";
      color = "#88cc00";
    } else {
      feedback = "Strong";
      color = "#00cc44";
    }

    return { score: Math.max(0, Math.min(5, score)), feedback, color };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (isSignUp) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    }
  }, [password, isSignUp]);


  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password, isSignUp = false) => {
    if (!password) return "Password is required";
    
    // Only apply complex validation for signup, not signin
    if (isSignUp) {
      if (password.length < 8) return "Password must be at least 8 characters long";
      }
    
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validatedisplayName = (displayName) => {
    if (!displayName) return "Name is required";
    if (displayName.length < 3) return "Name must be at least 3 characters long";
    if (displayName.length > 50) return "Name must be less than 50 characters";
    if (!/^[a-zA-Z0-9_\s]+$/.test(displayName)) return "Name can only contain letters, numbers, underscores, and spaces";
    if (/^\d/.test(displayName)) return "Name cannot start with a number";
    return "";
  };

  const validatePhoneNumber = (phonenumber) => {
    if (!phonenumber) return "Phone number is required";
    const phoneRegex = /^[+]?[\d\s-()]{10}$/;
    if (!phoneRegex.test(phonenumber)) return "Please enter a valid phone number (10 digits)";
    return "";
  };

  // Real-time validation
  const validateField = (fieldName, value) => {
    let error = "";
    
    switch (fieldName) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value, isSignUp);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, password);
        break;
      case "displayName":
        error = validatedisplayName(value);
        break;
      case "phonenumber":
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error === "";
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password, isSignUp);
    
    if (isSignUp) {
      newErrors.displayName = validatedisplayName(displayName);
      newErrors.phonenumber = validatePhoneNumber(phonenumber);
      newErrors.confirmPassword = validateConfirmPassword(confirmPassword, password);
    }

    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    setIsFormValid(!hasErrors);
    
    return !hasErrors;
  };

  // Update form validation when fields change
  useEffect(() => {
    if (isSignUp || email || password) {
      validateForm();
    }
  }, [email, password, confirmPassword, displayName, phonenumber, isSignUp]);

  const getFriendlyErrorMessage = (errorCode) => {
    const errors = {
      "auth/user-not-found": "No user found with this email.",
      "auth/invalid-credential": "Invalid credentials provided. Please try again.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled": "This user account has been disabled.",
      "auth/email-already-in-use": "This email is already registered.",
      "auth/weak-password": "Password is too weak. Please choose a stronger password.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/missing-email": "Please provide an email address.",
      "auth/popup-closed-by-user": "Sign-in popup closed before completion.",
      "auth/cancelled-popup-request": "Sign-in cancelled. Please try again.",
      "auth/network-request-failed": "Network error. Please check your connection and try again.",
    };

    if (!errorCode) {
      return "An unknown error occurred. Please try again.";
    }

    return errors[errorCode] || "Something went wrong. Please try again.";
  };

  // Generate or retrieve device ID from localStorage
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };
  const currentDeviceId = getDeviceId();

  const saveUserInfo = async (user, deviceId, override = false) => {

    
    
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    const currentTime = new Date().toISOString();
    let finaldisplayName = displayName || "User";

    if (userSnap.exists()) {
      const { activeDeviceId } = userSnap.data();

      if (activeDeviceId && activeDeviceId !== deviceId && !override) {
        await setDoc(
          userDocRef,
          { previousDeviceId: activeDeviceId },
          { merge: true }
        );
        const confirmOverride = window.confirm(
          "Account is active on another device. Log out previous device and continue here?"
        );
        if (!confirmOverride) {
          throw new Error("Login cancelled by user.");
        }
      }

      await setDoc(
        userDocRef,
        {
          activeDeviceId: deviceId,
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    } else {
      await setDoc(userDocRef, {
        displayName: displayName,
        phonenumber: phonenumber,
        email: user.email,
        role: "user",
        activeDeviceId: deviceId,
        previousDeviceId: null,
        creationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscriptionStatus: "inactive",
        freeTrialStatus: "available",
      });
    }

    try {
      const response = await fetch("http://61.246.67.74:4000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          username: user.displayName || googlename,
        }),
      });
    
      const data = await response.json();
      console.log("MySQL API response:", data);
    
      if (!response.ok) {
        console.error("MySQL insert failed:", data);
      }
    } catch (err) {
      console.error("Failed to save user to MySQL:", err);
    }
  };

 const handleEmailAuth = async () => {
  // Validate form before submission
  if (!validateForm()) {
    alert("Please fix the errors in the form before submitting.");
    return;
  }

  try {
    // Attempt to sign up
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    if (isSignUp && displayName) {
      await updateProfile(user, { displayName });
    }

    // Send verification email and sign out
    await sendEmailVerification(user);
    alert("Verification email sent. Please check your inbox. (Check your spam folder)");
    await signOut(auth);
    return;

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      // Try to log in to check if it's a verified user or not
      try {
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        const existingUser = loginCredential.user;

        if (!existingUser.emailVerified) {
          // Resend verification email and sign out
          await sendEmailVerification(existingUser);
          alert("Your email is already registered but not verified. We've sent a new verification email.");
          await signOut(auth);
          return;
        }

        // Email is verified, proceed with login
        await saveUserInfo(existingUser, currentDeviceId);
        alert("Welcome To ALD!");
        navigate("/");
        return;

      } catch (loginError) {
        if (loginError.code === "auth/wrong-password") {
          alert("Account already exists but the password is incorrect.");
        } else {
          alert("Something went wrong, please try again later.");
        }
        return;
      }
    }

    // Other errors
    console.error("Auth Error:", error);
    alert(getFriendlyErrorMessage(error.code || "unknown"));
    await signOut(auth);
  }
};


  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setgoogleName(result.user.displayName);
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      

      if (!userDocSnapshot.exists()) {
        await saveUserInfo(result.user, currentDeviceId);
      } 

      alert("User signed in with Google");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      navigate("/");
    } catch (error) {
      alert(getFriendlyErrorMessage(error.code));
      await signOut(auth);
    }
  };

  const handleLogOut = async () => {
    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          { activeDeviceId: null, previousDeviceId: null },
          { merge: true }
        );
      }
      await signOut(auth);
      alert("User logged out successfully");
      navigate("/auth");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (fieldName, value) => {
    switch (fieldName) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      case "displayName":
        setdisplayName(value);
        break;
      case "phonenumber":
        setPhonenumber(value);
        break;
    }
    
    // Validate field after a short delay to avoid excessive validation
    setTimeout(() => validateField(fieldName, value), 300);
  };

   // Password Strength Indicator Component
   const PasswordStrengthIndicator = ({ strength, password }) => {
    if (!password || !isSignUp) return null;

    const strengthBars = Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        style={{
          flex: "1",
          minWidth: "0",
          height: "4px",
          backgroundColor: index < strength.score ? strength.color : "#e0e0e0",
          borderRadius: "2px",
          transition: "background-color 0.3s ease",
        }}
      />
    ));

    return (
      <div style={{ marginTop: "8px", marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            gap: "2px",
            marginBottom: "4px",
            width: "100%",
            minWidth: "300px",
          }}
        >
          {strengthBars}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: strength.color,
            fontWeight: "500",
          }}
        >
          {strength.feedback}
        </div>
        {strength.score < 3 && (
          <div
            style={{
              fontSize: "9px",
              color: "#fff",
              marginTop: "2px",
            }}
          >
            Use uppercase, lowercase, numbers & symbols for stronger password
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={styles.authContainer}
      style={{
        backgroundImage: `url(${LoginPageImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {user ? (
        <div className={styles.authContent}>
          <h1>Welcome, {displayName || "User"}!</h1>
          <button className={styles.button} onClick={handleLogOut}>
            Log Out
          </button>
        </div>
      ) : (
        <div className={styles.authContent}>
          <h1 className={styles.title}>{isSignUp ? "Sign Up" : "Log In"}</h1>

          {isSignUp && (
            <>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  className={`${styles.inputField} ${errors.displayName ? styles.inputError : ""}`}
                />
               
              </div>
              {errors.displayName && (
                  <span className={styles.errorMessage}>{errors.displayName}</span>
                )}
              <div className={styles.inputContainer}>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phonenumber}
                  onChange={(e) => handleInputChange("phonenumber", e.target.value)}
                  className={`${styles.inputField} ${errors.phonenumber ? styles.inputError : ""}`}
                />
                
              </div>
              {errors.phonenumber && (
                  <span className={styles.errorMessage}>{errors.phonenumber}</span>
                )}
            </>
          )}

          <div className={styles.inputContainer}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`${styles.inputField} ${errors.email ? styles.inputError : ""}`}
            />
            
          </div>
          {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}

          <div className={styles.inputContainer}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`${styles.inputField} ${errors.password ? styles.inputError : ""}`}
            />
            
          </div>
          <PasswordStrengthIndicator strength={passwordStrength} password={password} />
          {errors.password && (
              <span className={styles.errorMessage}>{errors.password}</span>
            )}

          {isSignUp && (
            <>
            <div className={styles.inputContainer}>
              <input
                type="password"
                placeholder="Re-type Password"
                value={confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`${styles.inputField} ${errors.confirmPassword ? styles.inputError : ""}`}
              />
              
            </div>
            {errors.confirmPassword && (
                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
              )}
            </>
          )}

          <button 
            className={`${styles.button} ${!isFormValid && isSignUp ? styles.buttonDisabled : ""}`} 
            onClick={handleEmailAuth}
            disabled={isSignUp && !isFormValid}
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>

          <button className={styles.googleBtn} onClick={handleGoogleAuth}>
            <img className={styles.icon} src={googleicon} alt="Google Icon" />
            Sign In with Google
          </button>

          <p className={styles.switchAuth}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setIsFormValid(false);
              }}
              style={{ cursor: "pointer", color: "blue" }}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </span>
            {" | "}
            <span
              onClick={handleForgotPassword}
              style={{ cursor: "pointer", color: "red" }}
            >
              Forgot Password?
            </span>
          </p>

          <p className={styles.policyText}>
            By signing in, you agree to our{" "}
            <a href="/TermsAndConditions" rel="noopener noreferrer">
              Terms and Conditions
            </a>
            ,{" "}
            <a href="/privacypolicy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            , and{" "}
            <a
              href="/refund&cancellationpolicy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Refund and Cancellation Policy
            </a>
            .
          </p>
        </div>
      )}
      <UpdateUsernameModal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} />
    </div>
  );
};

export default Auth;