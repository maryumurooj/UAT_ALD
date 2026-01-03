import React, { useState, useEffect, useRef } from "react";
import SubHeader from "../components/SubHeader/SubHeader.jsx";
import FrontDashboard from "../components/FrontDashboard/FrontDashboard";
import EditBar from "../components/EditBar/EditBar.jsx";
import RearDashboard from "../components/RearDashboard/RearDashboard";
import SidePanel from "../components/SidePanel/SidePanel";
import JudgmentContent from "../components/JudgmentContent/JudgmentContent";
import JudgmentContentNoUser from "../components/JudgmentContentnouser/JudgmentContent.jsx";
import HeadnotesContent from "../components/HeadnotesContent/HeadnotesContent";
import StatusContent from "../components/StatusContent/StatusContent";
import EqualsContent from "../components/EqualsContent/EqualsContent";
import CitedContent from "../components/CitedContent/CitedContent";
import NotesContent from "../components/NotesContent/NotesContent";
import PDFManipulator from "../components/PDFManipulator";
import styles from "./IndexPage.module.css";
import { useAuth } from "./../services/AuthContext";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig.js";

//url navigation
import { useNavigate } from "react-router-dom"; // Import useNavigatez
import { useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import BarLoader from "react-spinners/BarLoader.js";
import LZString from "lz-string"; // Compression library

const IndexPage = () => {
  const { user, subscriptionStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false); // Spinner state
  const rearDashboardRef = useRef();
  const [judgmentId, setJudgmentId] = useState("");
  const [judgmentData, setJudgmentData] = useState(null);
  const [activeContent, setActiveContent] = useState("judgment"); // Default to "headnotes"
  const [fontSize, setFontSize] = useState(16); // Default font size in px
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); // State to track the selected row
  const [showPageUpButton, setShowPageUpButton] = useState(false); // State to show page up button
  const [searchTerms, setSearchTerms] = useState([]); // Add this line
  const [citation, setCitation] = useState(null);
  const [referredCitation, setReferredCitation] = useState(null);
  const [fullCitation, setFullCitation] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const contentRef = useRef();
  const [pdfUrl, setPdfUrl] = useState("");
  const [isManipulating, setIsManipulating] = useState(false);
  const [printRequested, setPrintRequested] = useState(false);
  const [currentJudgmentCitation, setCurrentJudgmentCitation] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Access the current location for URL parameters
  const [judgmentCitation, setJudgmentCitation] = useState(""); // Use judgmentCitation state
  //Url declarations
  const queryParams = new URLSearchParams(location.search);
  const contentFromUrl = queryParams.get("content");
  const judgmentCitationFromUrl = queryParams.get("judgmentCitation");

  // Adding state for results, error, and judgment count
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [judgmentCount, setJudgmentCount] = useState(0);

  //adding state for history
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [historyStack, setHistoryStack] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1); // Tracks the current position in the history stack
  const [isHistoryRestored, setIsHistoryRestored] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [historyResults, setHistoryResults] = useState({}); // Stores results per searchTerms
  const [storedIndex, setStoredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  //pad search context
  const [searchContext, setSearchContext] = useState({});
  // ADD THIS NEW FUNCTION TO HANDLE SEARCH CONTEXT FROM SIDEPANEL
  const handleSearchContextChange = (context) => {
    console.log("Search context received in parent:", context);
    setSearchContext(context);
  };

  const formatDate = (dateString) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = parseInt(dateString.substring(0, 2), 10);
    const monthIndex = parseInt(dateString.substring(2, 4), 10) - 1;
    const year = parseInt(dateString.substring(4), 10);

    const formattedDate = `${toOrdinal(day)} day of ${
      months[monthIndex]
    }, ${year}`;
    return formattedDate;
  };

  const prevJudgmentCitationRef = useRef();
  const prevJudgmentDataRef = useRef();

  {
    /*Below code is URL formation and session handling*/
  }
  /*
  useEffect(() => {
    // Sync judgment data based on citation from URL
    if (judgmentCitationFromUrl && judgmentCitationFromUrl !== judgmentCitation) {
      // Check if the citation contains "&"
      const shouldEncodeDecode = judgmentCitationFromUrl.includes('&');
  
      // Use encoded/decoded citation only if it contains "&"
      const citationKey = shouldEncodeDecode 
        ? decodeURIComponent(judgmentCitationFromUrl) // Decode for sessionStorage lookup
        : judgmentCitationFromUrl;
        console.log("Citation Key:", citationKey);
        console.log("Current Judgment Citation:", judgmentCitation);
  
        if (prevJudgmentCitationRef.current !== citationKey) {
          const storedJudgmentData = sessionStorage.getItem(citationKey);
    
          if (storedJudgmentData) {
            const parsedData = JSON.parse(storedJudgmentData);
    
            // Avoid unnecessary state updates
            if (parsedData.judgmentCitation !== judgmentCitation) {
              setJudgmentCitation(parsedData.judgmentCitation);
            }
            if (JSON.stringify(parsedData) !== JSON.stringify(judgmentData)) {
              setJudgmentData(parsedData);
            }
    
            // Update contentData if the activeContent matches
            if (contentFromUrl === activeContent && parsedData[activeContent]) {
              setContentData(parsedData[activeContent]);
            }
          } else {
        // If no judgment data found in sessionStorage, fetch it from referredCitation
        setReferredCitation(judgmentCitationFromUrl);
  
        // Only when fetching from the referred citation, set activeContent to 'headnotes'
        setActiveContent('judgment');
          }
          prevJudgmentCitationRef.current = citationKey;
      }
    }
  }, [location, contentFromUrl, judgmentCitationFromUrl]); // Dependencies include location and URL parameter changes
  
  // Store judgmentData in sessionStorage and update URL
  useEffect(() => {
    if (judgmentData && judgmentData.judgmentCitation) {
      const { judgmentCitation } = judgmentData;
  
      // Check if the citation contains "&"
      const shouldEncodeDecode = judgmentCitation.includes('&');
  
      // Use encoded citation only if it contains "&"
      const citationKey = shouldEncodeDecode 
        ? encodeURIComponent(judgmentCitation) // Encode for sessionStorage and URL
        : judgmentCitation;
  
      // Check if the judgmentData has changed
    if (prevJudgmentDataRef.current !== JSON.stringify(judgmentData)) {
      // Store the entire judgmentData object in sessionStorage using the citation key
      sessionStorage.setItem(citationKey, JSON.stringify(judgmentData));

      // Update the URL with the latest judgmentCitation and activeContent
      navigate(`?content=${activeContent}&judgmentCitation=${citationKey}`, { replace: true });

      // Update the ref with the current judgmentData
      prevJudgmentDataRef.current = JSON.stringify(judgmentData);
    }
  }
}, [judgmentData, activeContent, navigate]);*/

  const handleContentChange = (content) => {
    console.log("handleContentChange called with content:", content);
    console.log("Current user:", user);
    console.log("Current activeContent:", activeContent);

    // Check if the user is not logged in and content is not 'headnotes'
    if (!user && content !== "headnotes") {
      alert("You must be Logged In to access these features.");
      console.log("User not logged in. Redirecting to /auth.");
      navigate("/auth");
      return;
    }

    if (!user) {
      // User is not logged in
      console.log("User not found. Redirecting to /auth.");
      alert("You must log in to access this content.");
      navigate("/auth");
      return; // Exit function here to prevent further execution
    } else {
      // User is logged in, check subscription status
      if (!subscription) {
        console.log(
          "User subscription is inactive. Redirecting to /subscription-tier."
        );
        alert(
          "Your subscription is inactive or expired. Please renew your subscription to access this content."
        );
        navigate("/subscription-tier");
        return; // Exit function here to prevent further execution
      }
    }

    // Allow viewing content for logged-in users with active subscription or headnotes
    if (content !== activeContent) {
      console.log("Changing activeContent to:", content);
      setActiveContent(content);
      navigate(`?content=${content}&judgmentCitation=${judgmentCitation}`, {
        replace: true,
      });
    } else {
      console.log("Content is already active, no change.");
    }
  };

  // Fetch user subscription in real-time using onSnapshot

  const [subscription, setSubscription] = useState(null);

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

  const toOrdinal = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const handleSearchById = async (judgmentId) => {
    try {
      const response = await fetch(
        `http://61.246.67.74:4001/api/uat/judgments/${judgmentId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null); // Prevent setting bad data
        return;
      }

      console.log("Received data:", data);
      setJudgmentData(data);
    } catch (error) {
      console.error("Error fetching judgment:", error);
      setJudgmentData(null); // Ensure UI doesn't crash
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleRowClick = (data) => {
    setSelectedRow(data); // Update selected row
    handleSearchById(data.judgmentId);
  };

  //The below code is to select firstrow by default, redundant actually!
  /*
  useEffect(() => {
    // Set selected row to the first row when results are loaded
    if (results.length > 0) {
      setSelectedRow(results[0]);
      handleRowClick(results[0]); // Simulate click on the first row to load its content
    }
  }, [results]);
  */

  useEffect(() => {
    // Scroll to top whenever judgmentData changes
    if (judgmentData) {
      scrollToTop();
    }
  }, [judgmentData]);

  const handleZoom = (type) => {
    setFontSize((prev) => (type === "plus" ? prev + 2 : prev - 2));
  };

  const handlePrint = () => {
    if (contentRef.current) {
      const printContents = contentRef.current.innerHTML;
      const printWindow = window.open("", "", "height=500,width=800");

      printWindow.document.write("<html><head><title>ALD Online</title>");
      printWindow.document.write(`
        <head>
  <style>
    /* Include your styles here or link to your stylesheet */
    body {
      font-family: Palatino;
      padding: 20px;
    }
    
    /* Include the same print media query styles */
    @media print {
      body {
        padding: 50px 0; /* Add top and bottom padding for each printed page */
        margin: 0; /* Reset margin for print */
      }

      .container {
        height: auto;
        width: 100%;
        overflow: visible;
        background-color: transparent;
        border: none;
        padding: 0; /* No padding for the container */
        margin: 0; /* No margin for the container */
        display: block;
      }
      
      h2, h3 {
        text-align: center;
      }

      p, .justify-text {
        text-align: justify;
      }

      .svg-icon {
        display: block;
        margin: 0 auto 20px auto;
        text-align: center;
      }
    }
  </style>
</head>

      `);

      printWindow.document.write("</head><body>");

      // Add SVG icon at the top of the printed page
      printWindow.document.write(`

      `);

      printWindow.document.write(printContents);
      printWindow.document.write("</body></html>");

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }
  };

  const handleTruePrint = () => {
    console.log("True Print clicked");

    const fileName = `${judgmentData.judgmentCitation}.pdf`;
    console.log("Clicked file name:", fileName);

    // Add a timestamp to force reload
    const timestamp = new Date().getTime();
    const url = `http://61.246.67.74:4000/ALDpdfs/${fileName}?t=${timestamp}`;

    setPdfUrl(url);
    setIsManipulating(true);
  };

  const handleResultClick = (id) => {
    setJudgmentId(id);
    handleSearchById(id); // Pass the id parameter here
  };

  const handleSaveToPad = () => {
    const dataToSave = { results, selectedRow }; // Customize this according to the data you want to save
    localStorage.setItem("padData", JSON.stringify(dataToSave));
  };

  const handlePageUp = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Function to update showPageUpButton state based on scroll position
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollTop = contentRef.current.scrollTop;
        setShowPageUpButton(scrollTop > 100); // Adjust this value as needed
      }
    };

    // Attach scroll event listener to contentRef
    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", handleScroll);
    }

    // Clean up function to remove event listener
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  //judgmentreferredcitation click
  const handleSetCitation = (newCitation) => {
    setCitation(newCitation);
  };

  //fullscreen function
  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const storedCitation = localStorage.getItem("referredCitation");
    if (storedCitation) {
      setReferredCitation(storedCitation);
      localStorage.removeItem("referredCitation"); // Delete the citation after usage
    }
  }, []);

  // Empty dependency array means this effect runs only once, after the initial render

  const handleClear = () => {
    console.log("Clearing data...");
    setJudgmentData(null);
    setCurrentJudgmentCitation("");
    setResults([]);
    setJudgmentCount(0);
    setError(null);
    setSearchTerms([]);
    setError(null);
    rearDashboardRef.current?.handleClear();
  };

  useEffect(() => {
    const storedCitation = localStorage.getItem("referredCitation");
    if (storedCitation) {
      setReferredCitation(storedCitation);
      localStorage.removeItem("referredCitation"); // Delete the citation after usage
    }
  }, []);

  const MAX_HISTORY_ENTRIES = 7; // Store only the last 7 results

  useEffect(() => {
    if (judgmentData && judgmentData.judgmentCitation && selectedRow) {
      const { judgmentCitation } = judgmentData;

      setHistoryStack((prevStack) => {
        const citationExists = prevStack.some(
          (entry) => entry.judgmentCitation === judgmentCitation
        );

        if (citationExists) return prevStack;

        const selectedIndex = results.findIndex(
          (row) => row.judgmentId === selectedRow.judgmentId
        );

        const newEntry = {
          judgmentCitation,
          selectedIndex,
          searchTerms,
          results: historyResults[JSON.stringify(searchTerms)] ? null : results,
        };

        let updatedStack = [...prevStack.slice(0, currentStep + 1), newEntry];

        // ✅ Ensure only the last 7 entries are stored (LIFO)
        if (updatedStack.length > MAX_HISTORY_ENTRIES) {
          updatedStack.shift(); // Remove the oldest entry
        }

        setCurrentStep(updatedStack.length - 1);

        // ✅ Compress & Store in LocalStorage
        localStorage.setItem(
          "historyStack",
          LZString.compress(JSON.stringify(updatedStack))
        );
        localStorage.setItem(
          "currentStep",
          JSON.stringify(updatedStack.length - 1)
        );

        return updatedStack;
      });

      setHistoryResults((prevResults) => {
        const searchKey = JSON.stringify(searchTerms);
        if (!prevResults[searchKey]) {
          const updatedResults = { ...prevResults, [searchKey]: results };

          // ✅ Compress & Store results
          localStorage.setItem(
            "historyResults",
            LZString.compress(JSON.stringify(updatedResults))
          );
          return updatedResults;
        }
        return prevResults;
      });
    }
  }, [judgmentData, selectedRow, searchTerms, results]);

  useEffect(() => {
    // ✅ Retrieve & Decompress Data
    const storedHistoryStack = JSON.parse(
      LZString.decompress(localStorage.getItem("historyStack")) || "[]"
    );
    const storedHistoryResults = JSON.parse(
      LZString.decompress(localStorage.getItem("historyResults")) || "{}"
    );
    const storedStep = JSON.parse(localStorage.getItem("currentStep")) || 0;

    setHistoryStack(storedHistoryStack);
    setHistoryResults(storedHistoryResults);
    setCurrentStep(storedStep);
  }, []);

  const loadHistory = (step) => {
    const storedStack = JSON.parse(
      LZString.decompress(localStorage.getItem("historyStack")) || "[]"
    );
    const storedResults = JSON.parse(
      LZString.decompress(localStorage.getItem("historyResults")) || "{}"
    );

    if (storedStack.length > 0 && step >= 0) {
      const currentEntry = storedStack[step];

      if (currentEntry) {
        const searchKey = JSON.stringify(currentEntry.searchTerms);
        const resultsToUse =
          currentEntry.results || storedResults[searchKey] || [];
        const retrievedIndex = currentEntry.selectedIndex || 0;

        console.log("🔄 Loading history for step:", step);
        console.log("📌 Retrieved selectedIndex:", retrievedIndex);
        console.log("📜 Retrieved results length:", resultsToUse.length);

        setResults(resultsToUse);
        setSelectedIndex(retrievedIndex);
        setSelectedRow(resultsToUse[retrievedIndex] || null);
        setCurrentStep(step);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const previousStep = currentStep - 1;
      console.log("⬅️ Going Back to Step:", previousStep);
      loadHistory(previousStep);
    } else {
      console.log("⚠️ Already at the first step, can't go back.");
    }
  };

  const handleForward = () => {
    if (currentStep < historyStack.length - 1) {
      const nextStep = currentStep + 1;
      console.log("➡️ Going Forward to Step:", nextStep);
      loadHistory(nextStep);
    } else {
      console.log("⚠️ Already at the last step, can't go forward.");
    }
  };

  return (
    <div className={styles.indexcont}>
      <SubHeader
        judgmentData={judgmentData}
        onToggleFullScreen={handleToggleFullScreen}
        isFullScreen={isFullScreen}
      />{" "}
      {/* Pass the toggle function */}
      <FrontDashboard
        activeContent={activeContent}
        onItemSelect={handleContentChange}
        onZoom={handleZoom}
        onPrint={handlePrint}
        onTruePrint={handleTruePrint}
        judgmentCount={judgmentCount}
        judgmentData={results.length > 0 ? judgmentData : null}
        onBack={handleBack}
        onForward={handleForward}
        currentStep={currentStep} // ✅ Pass current step
        historyStack={historyStack} // ✅ Pass history stack
      />
      {isManipulating && <PDFManipulator pdfUrl={pdfUrl} />}
      {/* Search Results */}
      {searchResults.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Judgment ID</th>
              <th>Short Notes</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((result) => (
              <tr key={result.id} onClick={() => handleResultClick(result.id)}>
                <td>{result.id}</td>
                <td>{result.shortNoteText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div
        className={`${styles.sideNscroll} ${
          isFullScreen ? styles.fullScreen : ""
        }`}
      >
        {" "}
        {/* Apply full-screen class */}
        {!isFullScreen && (
          <SidePanel
            setResults={setResults}
            setJudgmentCount={setJudgmentCount}
            setError={setError}
            setSearchTerms={setSearchTerms}
            fullCitation={referredCitation}
            setFullCitation={setReferredCitation}
            onClear={handleClear}
            setIsLoading={setIsLoading}
            onSearchContextChange={handleSearchContextChange}
          />
        )}
        <div
          className={`${styles.scrollableText} ${
            isFullScreen ? styles.fullScreenText : ""
          }`}
          ref={contentRef}
          style={{ fontSize: `${fontSize}px` }}
        >
          {isLoading ? (
            <div className={styles.spinnercontainer}>
              <BarLoader />
            </div>
          ) : (
            <>
              {!user || !subscription ? (
                <JudgmentContentNoUser />
              ) : (
                <>
                  {activeContent === "judgment" && (
                    <JudgmentContent
                    key={judgmentData?.judgmentId}
                      judgmentData={results.length > 0 ? judgmentData : null}
                      searchTerms={searchTerms}
                      setReferredCitation={setReferredCitation}
                    />
                  )}
                  {activeContent === "headnotes" && (
                    <HeadnotesContent
                      judgmentData={results.length > 0 ? judgmentData : null}
                      searchTerms={searchTerms}
                    />
                  )}
                  {activeContent === "status" && (
                    <StatusContent
                      judgmentData={results.length > 0 ? judgmentData : null}
                      setReferredCitation={setReferredCitation}
                    />
                  )}
                  {activeContent === "equals" && (
                    <EqualsContent
                      judgmentData={results.length > 0 ? judgmentData : null}
                      searchTerms={searchTerms}
                    />
                  )}
                  {activeContent === "cited" && (
                    <CitedContent
                      judgmentData={results.length > 0 ? judgmentData : null}
                      searchTerms={searchTerms}
                    />
                  )}
                  {activeContent === "notes" && (
                    <NotesContent
                      uid={user?.uid}
                      judgmentId={selectedRow?.judgmentId}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
        {showPageUpButton && (
          <button className={styles.pageUpButton} onClick={handlePageUp}>
            ↑
          </button>
        )}
      </div>
      <RearDashboard
        ref={rearDashboardRef}
        results={results} // Ensure at least one result is displayed
        onRowClick={handleRowClick}
        onSaveToPad={handleSaveToPad}
        judgmentCount={judgmentCount}
        currentJudgmentCitation={currentJudgmentCitation}
        setCurrentJudgmentCitation={setCurrentJudgmentCitation}
        onClear={() => console.log("Parent onClear triggered")}
        setIsLoading={setIsLoading}
        isHistoryRestored={isHistoryRestored}
        selectedIndex={selectedIndex} // ✅ Pass selectedIndex here
        searchContext={searchContext}
      />
    </div>
  );
};

export default IndexPage;
