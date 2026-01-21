import React, { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import { Route, Routes, useLocation } from "react-router-dom";
import SubFooter from "./components/SubFooter/SubFooter";
import Home from "./pages/Home.jsx";
import Aboutus from "./pages/Aboutus.jsx";
import IndexPage from "./pages/IndexPage";
import JudgesProfile from "./pages/JudgesProfile";
import Pad from "./pages/PadPage";
import ArticleResults from "./pages/ArticleResult.jsx";
import Statutes from "./pages/Statutes.jsx";
import Contact from "./pages/Contact.jsx";
import SignUp from "./pages/SignupPage.jsx";
import CaseFinder from "./pages/CaseFinder.jsx";
import FAQ from "./pages/FAQ.jsx";
import JudgeRead from "./pages/JudgeRead.jsx";
import ArticleRead from "./pages/ArticleRead.jsx";
import Auth from "./components/Authentication/Auth.jsx";
import SubscriptionTier from "./components/Authentication/SubscriptionTier";
import Profile from "./components/Authentication/Profile.jsx";
import "./App.css";
import BillingAddress from "./components/Authentication/BillingAddress.jsx";
import ProtectedRoute from "./components/Authentication/ProtectedRoute.jsx";
import Terms from "./pages/Terms&Conditions.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import RefundAndCancellationPolicy from "./pages/RefundAndCancellationPolicy.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";
import { Provider } from "react-redux";
import { store } from "./components/Store/store.js";
import checkSubscriptionStatus from "./services/subscriptionChecker";
import FreeTrialModal from "./components/Modals/FreeTrialModal.jsx";
import FreeModal from "./components/Modals/Free.jsx";
import JudgmentStatusPage from './pages/JudgmentStatusPage';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ThankMessage from "./pages/Thankyou.jsx";
import NotFound from "./pages/NotFound.jsx";
import UpdateUsernameModal from "./components/Modals/UpdateNameModal.jsx";
import { useAuth } from "./services/AuthContext.jsx";
import { db } from "./services/firebaseConfig"; // Import your Firestore config
import { Toaster, toast } from "sonner";


const LoadingPage = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onLoadingComplete();
      }, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete, location.pathname]);

  return (
    <div
      className={`loading-overlay ${isVisible ? "visible" : "hidden"}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        transition: "opacity 0.5s ease-in-out",
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="logo-container">
          <svg
            width="111"
            height="119"
            viewBox="0 0 111 119"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: "fadeInOut 1.5s ease-in-out infinite",
            }}
          >
            <g filter="url(#filter0_d_1323_9365)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 54.5L55.5 2L105 54.5H94V109.5H65C65 109.5 54.8784 99.2492 55.5 92.5C55.6827 90.516 55.9885 88.8125 56.5028 87.25C57.738 83.4972 60.1759 80.5579 65 76.5H79V65.5V54.5H89.5L86 50.5H26L24 54.5H34.5V66V76.5V87.25V98H55.5V109.5H20.5V54.5H6ZM38 38.5L55.5 19.5L74 38.5H38ZM79 98V87.25C79 87.25 73.1951 85.3121 70.5 87.25C68.5828 88.6285 67.5468 90.1391 67.5 92.5C67.4516 94.9461 68.5164 96.5678 70.5 98C73.1913 99.9431 79 98 79 98Z"
                fill="#ff0000"
              />
              <path
                d="M89.5 54.5L86 50.5H26L24 54.5M89.5 54.5H94M89.5 54.5H24M89.5 54.5H79M24 54.5H20.5M24 54.5H34.5M20.5 54.5H6L55.5 2L105 54.5H94M20.5 54.5V109.5H55.5V98H34.5V87.25M34.5 54.5H79M34.5 54.5V66M79 54.5V65.5M79 76.5H65M79 76.5V65.5M79 76.5H34.5M65 76.5C60.1759 80.5579 57.738 83.4972 56.5028 87.25M65 76.5H34.5M94 54.5V109.5H65C65 109.5 54.8784 99.2492 55.5 92.5C55.6827 90.516 55.9885 88.8125 56.5028 87.25M34.5 66L79 65.5M34.5 66V76.5M34.5 76.5V87.25M34.5 87.25H56.5028M38 38.5L55.5 19.5L74 38.5H38ZM79 87.25V98C79 98 73.1913 99.9431 70.5 98C68.5164 96.5678 67.4516 94.9461 67.5 92.5C67.5468 90.1391 68.5828 88.6285 70.5 87.25C73.1951 85.3121 79 87.25 79 87.25Z"
                stroke="#ff0000"
                strokeWidth="1.5"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_1323_9365"
                x="0.262207"
                y="0.906738"
                width="110.476"
                height="117.343"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_1323_9365"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1323_9365"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            marginTop: "16px",
          }}
        >
          <div className="loading-dot"></div>
          <div className="loading-dot" style={{ animationDelay: "0.1s" }}></div>
          <div className="loading-dot" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          background-color: rgb(255, 0, 0);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [modalChecked, setModalChecked] = useState(false);
  const location = useLocation();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchUserData = async () => {
    try {
      console.log("1");
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        
      console.log("2");
        const userData = userDocSnap.data();

        const hasPhoneNumber = userData.phonenumber
        const hasDisplayName = userData.displayName || user.displayName;
        
        if (!hasPhoneNumber || !hasDisplayName) {
          console.log("inside")
          setTimeout(() => {
            setShowUpdateModal(true);
          }, 5000);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("maryum", user);
      fetchUserData();
    }
  }, [user]);

  // Paths where modals should be shown
  const allowedPaths = [
    "/",
    "/home",
    "/about",
    "/contact",
    "/FAQ",
    "/statutes",
    "/index",
    "/casefinder",
    "/articles",
    "/TermsAndConditions",
    "/Refund&CancellationPolicy",
    "/PrivacyPolicy",
  ];

  // Check subscription status and update state
  const updateSubscriptionStatus = async (currentUser) => {
    if (!currentUser) {
      setSubscriptionStatus(null);
      return;
    }

    try {
      const result = await checkSubscriptionStatus(currentUser.uid);
      setSubscriptionStatus(result);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscriptionStatus({
        isValid: false,
        message: "Error checking subscription",
      });
    }
  };

  // Check if user qualifies for free trial modal
  const checkForFreeTrialModal = async (currentUser) => {
    if (!currentUser || !allowedPaths.includes(location.pathname)) return;

    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const creationDate = new Date(userData.creationDate);
        const now = new Date();
        const daysSinceCreation = Math.floor(
          (now - creationDate) / (1000 * 60 * 60 * 24)
        );

        // Show modal only if:
        // 1. User created within 30 days
        // 2. No active subscription
        // 3. Subscription status is inactive
        if (
          daysSinceCreation <= 30 &&
          userData.subscriptionStatus === "inactive" &&
          (!subscriptionStatus || !subscriptionStatus.isValid)
        ) {
          setShowFreeTrialModal(true);
        }
      }
    } catch (error) {
      console.error("Error checking if user is new:", error);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setModalChecked(false); // Reset modal check when user changes

      if (currentUser) {
        await updateSubscriptionStatus(currentUser);
      } else {
        setSubscriptionStatus(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle modal logic when user, subscription status, or route changes
  useEffect(() => {
    if (isLoading || modalChecked) return;

    const handleModalLogic = async () => {
      if (user) {
        // User is logged in - check for free trial modal
        if (
          subscriptionStatus !== null ||
          allowedPaths.includes(location.pathname)
        ) {
          // Wait for subscription status to be loaded
          const timer = setTimeout(() => {
            if (!subscriptionStatus.isValid) {
              checkForFreeTrialModal(user);
            }
            setModalChecked(true);
          }, 10000);
        }
      } else {
        // User not logged in - show free modal after delay
        if (allowedPaths.includes(location.pathname)) {
          const timer = setTimeout(() => {
            setShowFreeModal(true);
            setModalChecked(true);
          }, 10000);

          return () => clearTimeout(timer);
        } else {
          setModalChecked(true);
        }
      }
    };

    handleModalLogic();
  }, [
    user,
    subscriptionStatus,
    location.pathname,
    isLoading,
    modalChecked,
    allowedPaths,
  ]);

  // Periodically check subscription status for logged-in users
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateSubscriptionStatus(user);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Reset modal check when route changes
  useEffect(() => {
    setModalChecked(false);
    setShowFreeModal(false);
    setShowFreeTrialModal(false);
  }, [location.pathname]);

  const handleFreeTrialSubmit = (formData) => {
    setShowFreeTrialModal(false);
    setShowFreeModal(false);
    setModalChecked(true);
  };

  const handleFreeTrialClose = () => {
    setShowFreeTrialModal(false);
    setShowFreeModal(false);
    setModalChecked(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Show loading page first
  if (isLoading) {
    return <LoadingPage onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <Provider store={store}>
      <div className="App">
        <Header />
        <div className="Content">
        <Toaster richColors position="top-right" closeButton/>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Aboutus />} />
            <Route path="/confirmation" element={<ThankMessage />} />
            <Route path="/statutes" element={<Statutes />} />
            <Route path="/FAQ" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/billingAddress" element={<BillingAddress />} />
            
            <Route
              path="/index"
              element={<ProtectedRoute element={<IndexPage />} />}
            />
           <Route
              path="/casefinder"
              element={<ProtectedRoute element={<CaseFinder />} />}
            />
           <Route
              path="/judgment/:judgmentCitation"
              element={<ProtectedRoute element={<IndexPage />} />}
            />
           
            <Route
              path="/judgments"
              element={<ProtectedRoute element={<JudgmentStatusPage />} />}
            />
           
            <Route path="/TermsAndConditions" element={<Terms />} />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
            <Route
              path="/Refund&CancellationPolicy"
              element={<RefundAndCancellationPolicy />}
            />
            <Route path="/ProfileDashboard" element={<ProfileDashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <SubFooter />

        <FreeTrialModal
          isOpen={showFreeTrialModal}
          onClose={handleFreeTrialClose}
          onSubmit={handleFreeTrialSubmit}
        />
        <FreeModal
          isOpen={showFreeModal}
          onClose={handleFreeTrialClose}
          onSubmit={handleFreeTrialSubmit}
        />

        <UpdateUsernameModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        />
      </div>
    </Provider>
  );
};

export default App;
