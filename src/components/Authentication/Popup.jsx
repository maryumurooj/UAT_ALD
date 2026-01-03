import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig.js';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import styles from './Auth.module.css';
import googleicon from '../../assets/google.png'; // Ensure this path is correct
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const saveUserInfo = async (user) => {
    const deviceId = uuidv4();
    const role = 'user';

    try {
      await setDoc(doc(db, 'users', user.uid), {
        username: username || user.displayName,
        email: user.email,
        role: role,
        deviceId: deviceId,
        creationDate: new Date().toISOString(),
        subscriptionStatus: 'inactive',
      });
    } catch (error) {
      console.error('Error saving user info:', error.message);
    }
  };

  const handleEmailAuth = async () => {
    if (isSignUp && password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserInfo(userCredential.user);
        alert('User signed up successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('User signed in successfully');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const enteredUsername = prompt('Enter your username:');
      setUsername(enteredUsername);
      await saveUserInfo(result.user);
      alert('User signed in with Google');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      alert('User logged out successfully');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={styles.popupContainer}>
      {user ? (
        <div className={styles.authContent}>
          <h1>Welcome, {user.displayName || 'User'}!</h1>
          <button className={styles.button} onClick={handleLogOut}>
            Log Out
          </button>
        </div>
      ) : (
        <div className={styles.authPopup}>
          <h1>{isSignUp ? 'Sign Up' : 'Log In'}</h1>

          {isSignUp && (
            <div className={styles.inputContainer}>
              <FaUser className={styles.LOGicon} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}

          <div className={styles.inputContainer}>
            <FaUser className={styles.LOGicon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputContainer}>
            <RiLockPasswordFill className={styles.LOGicon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
            />
          </div>
          {isSignUp && (
            <div className={styles.inputContainer}>
              <RiLockPasswordFill className={styles.LOGicon} />
              <input
                type="password"
                placeholder="Re-type Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}

          <button className={styles.button} onClick={handleEmailAuth}>
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>

          <button className={styles.googleBtn} onClick={handleGoogleAuth}>
            <img className={styles.icon} src={googleicon} alt="Google Icon" />
            Sign In with Google
          </button>

          <p className={styles.switchAuth} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Auth;
