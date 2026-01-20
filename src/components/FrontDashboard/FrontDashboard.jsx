import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./FrontDashboard.module.css";
import { useAuth } from '../../services/AuthContext';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { PDFDocument, rgb } from 'pdf-lib';

import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import aldlogo from '../../assets/DASHTitle/ALDONLINELOGOTITLE.png'
import checkSubscriptionStatus from '../../services/subscriptionChecker';
import api from "../../axios"



const FrontDashboard = ({ onItemSelect, onZoom, onPrint, activeContent, judgmentData, onTruePrint, onBack, onForward, currentStep, 
  historyStack   }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("judgment");
  const [isBookmarkModalOpen, setBookmarkModalOpen] = useState(false); // State for modal visibility
  const [folderName, setFolderName] = useState("");
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkNote, setBookmarkNote] = useState("");
  const { user } = useAuth();
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [existingFolders, setExistingFolders] = useState([]);  
  const [folderMode, setFolderMode] = useState('none'); // 'none', 'select', 'create'
  const [showSelectFolder, setShowSelectFolder] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  
  const handleSelectFolderToggle = () => {
    setShowSelectFolder(!showSelectFolder);
    if (!showSelectFolder) {
      setShowCreateFolder(false); // Close create if opening select
      setFolderName('');
    } else {
      setSelectedFolderId(null);
    }
  };
  
  const handleCreateFolderToggle = () => {
    setShowCreateFolder(!showCreateFolder);
    if (!showCreateFolder) {
      setShowSelectFolder(false); // Close select if opening create
      setSelectedFolderId(null);
    } else {
      setFolderName('');
    }
  };
  
  const renderFolderSection = () => {
    return (
      <div>
        <div className={styles.folderButtons}>
          {existingFolders.length > 0 && (
            <button 
              type="button"
              className={showSelectFolder ? styles.activeTab : styles.inactiveTab}
              onClick={handleSelectFolderToggle}
            >
              Select Folder
            </button>
          )}
          <button 
            type="button"
            className={showCreateFolder ? styles.activeTab : styles.inactiveTab}
            onClick={handleCreateFolderToggle}
          >
            Create Folder
          </button>
        </div>
  
        {showSelectFolder && existingFolders.length > 0 && (
          <select
            value={selectedFolderId || ""}
            onChange={(e) => handleParentFolderChange(e.target.value)}
          >
            <option value="">Choose a folder...</option>
            {renderFolderOptions(existingFolders)}
          </select>
        )}
  
        {showCreateFolder && (
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter new folder name"
          />
        )}
      </div>
    );
  };
  
  //login modal
  const [isLoginModalOpen, setLoginModalOpen] = useState(false); // For login modal
// In your FrontDashboard component
const [subscriptionStatus, setSubscriptionStatus] = useState({ 
  isValid: false, 
  message: 'Checking subscription...' 
});

useEffect(() => {
  if (user?.uid) {
    checkSubscriptionStatus(user.uid)
      .then(status => {
        setSubscriptionStatus(status);
        console.log("Subscription status:", status.message);
      })
      .catch(error => {
        console.error("Subscription check failed:", error);
        setSubscriptionStatus({ 
          isValid: false, 
          message: 'Error checking subscription' 
        });
      });
  } else {
    setSubscriptionStatus({ 
      isValid: false, 
      message: 'No user logged in' 
    });
  }
}, [user]);

const [url, setUrl] = useState("");  // For URL
const [show, setShow] = useState(false);

  const handleClose = () => {
    navigate("/auth");
  };
  const handleShow = () => setShow(true);

// Check if Back or Forward should be disabled
const isBackDisabled = currentStep <= 0;
const isForwardDisabled = currentStep >= historyStack.length - 1;

  const items = [
    { name: "Headnotes", key: "headnotes" },
    { name: "Judgements", key: "judgment" },
    { name: "Status", key: "status" },  
    { name: "Equals", key: "equals" },
    { name: "Cited", key: "cited" }, 
    { name: "-", key: "minus" }, 
    { name: "+", key: "plus" }, 
    { name: "Print", key: "print" }, 
    { name: "Content Print", key: "contentPrint" },
    { name: "Download", key: "download" },
    { 
      name: "Back", 
      key: "back", 
      action: onBack, 
      disabled: isBackDisabled 
    },
    { 
      name: "Forward", 
      key: "forward", 
      action: onForward, 
      disabled: isForwardDisabled 
    }
 
  ]; 

  const handleDownloadPdf = async () => {
    if (!judgmentData?.judgmentCitation) {
      alert("No judgment selected to download");
      return;
    }
  
  
    try {
      const fileName = `${judgmentData.judgmentCitation}.pdf`;
      const timestamp = new Date().getTime();
      const url = `http://61.246.67.74:4000/ALDpdfs/${fileName}?t=${timestamp}`;
  
      // Fetch the original PDF
      const pdfResponse = await fetch(url);
      if (!pdfResponse.ok) throw new Error("Failed to fetch PDF");
      const existingPdfBytes = await pdfResponse.arrayBuffer();
  
      // Fetch the logo image
      const imageUrl = "http://61.246.67.74:4000/pdfs/printlogo.jpg";
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) throw new Error("Failed to fetch image");
      const imgBytes = await imgResponse.arrayBuffer();
  
      // Load and manipulate the PDF (same as PDFManipulator)
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const jpgImage = await pdfDoc.embedJpg(imgBytes);
      const firstUser = user?.displayName || "Default User";
  
      // Apply changes to all pages
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        // Same manipulation code as in PDFManipulator
        const { width, height } = jpgImage.scale(0.8);
        const lineYTop = page.getHeight() - height - 52;
        
        page.drawLine({
          start: { x: 110, y: lineYTop },
          end: { x: page.getWidth() - 110, y: lineYTop },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
  
        page.drawImage(jpgImage, {
          x: 110,
          y: lineYTop + 10,
          width,
          height,
        });
  
        // Add date/time
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const formattedTime = currentDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        const fullFormattedDate = `${formattedDate} - ${formattedTime}`;
  
        page.drawText(fullFormattedDate, {
          x: page.getWidth() - 234,
          y: page.getHeight() - 80,
          size: 9,
          color: rgb(0, 0, 0),
        });
  
        // Add footer
        const lineYBottom = 60;
        page.drawLine({
          start: { x: 110, y: lineYBottom },
          end: { x: page.getWidth() - 110, y: lineYBottom },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
  
        page.drawText(`Licensed to ${firstUser}`, {
          x: 110,
          y: lineYBottom + 10,
          size: 9,
          color: rgb(0, 0, 0),
        });
  
        page.drawText("Copyright © Andhra Legal Decisions", {
          x: (page.getWidth() - 150) / 2,
          y: lineYBottom - 10,
          size: 9,
          color: rgb(0, 0, 0),
        });
      });
  
      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
  
      // Trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 100);
  
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      
    }
  };

 
  

  const handleClick = async (key) => {
    // Public actions that don't require login
    const publicActions = ['headnotes', 'back', 'forward'];
    if (!user && !publicActions.includes(key)) {
      setLoginModalOpen(true);
      return;
    }

    // Actions that require subscription
    const subscriptionRequiredActions = [
      'print', 'pad', 'bookmark', 'contentPrint', 'download', 'truePrint'
    ];

    if (subscriptionRequiredActions.includes(key)) {
      if (!subscriptionStatus.isValid) {
        alert(`This feature requires an active subscription. ${subscriptionStatus.message}`);
        return;
      }
    }

    switch (key) {
      case "plus":
      case "minus":
        onZoom(key);
        break;

      case "print":
        handlePrint();
        break;

      case "contentPrint":
        handlecontentPrint();
        break;
      
      case "download":
        handleDownloadPdf();
        break;

      case "back":
        if (currentStep > 0) onBack();
        break;

      case "forward":
        if (currentStep < historyStack.length - 1) onForward();
        break;

      default:
        onItemSelect(key);
        break;
    }

    setActiveItem(key);
  };
  


  

  const handleModalClose = () => {
    setShowSelectFolder(false)
    setShowCreateFolder(false)
    setBookmarkModalOpen(false);
    setFolderName("");
    setBookmarkTitle("");
    setBookmarkNote("");
    setSelectedFolderId(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!judgmentData || !judgmentData.judgmentId) {
      alert("Judgment ID is required!");
      return;
    }

    if (!bookmarkTitle.trim()) {
      alert("Bookmark title is required!");
      return;
    }

    const bookmarkData = {
      title: bookmarkTitle.trim(),
      note: bookmarkNote.trim(),
      url: window.location.href, // Get current URL
      folder_name: folderName.trim() || null,
      folder_id: selectedFolderId || null,
      parent_folder_id: null,
      uid: user.uid,
      judgmentId: judgmentData.judgmentId,
    };

    try {
      const response = await fetch("http://61.246.67.74:4000/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmarkData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Bookmark added successfully!");
        handleModalClose();
      } else {
        alert(`Failed to add bookmark: ${data.message}`);
      }
    } catch (err) {
      console.error("Error creating bookmark:", err);
      alert("Failed to add bookmark. Please try again.");
    }
  };


  useEffect(() => {
    if (isBookmarkModalOpen) {
      fetchFolders(); // Fetch folders when the modal opens
    }
  }, [isBookmarkModalOpen]);

 
  const renderFolderOptions = (folders, level = 0) => {
    return folders.map((folder) => (
      <React.Fragment key={folder.id}>
        <option value={folder.id}>
          {"\u00A0".repeat(level * 2)}
          {folder.folder_name}
        </option>
        {folder.children && renderFolderOptions(folder.children, level + 1)}
      </React.Fragment>
    ));
  };

  const handleParentFolderChange = (folderId) => {
    setSelectedFolderId(folderId);
    // Clear folder name if selecting an existing folder
    if (folderId) {
      setFolderName("");
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch(
        `http://61.246.67.74:4000/api/folders?uid=${user.uid}`
      );
      const data = await response.json();

      if (data.success) {
        // Convert flat array to hierarchical structure
        const folders = data.folders;
        const folderMap = {};
        const rootFolders = [];

        // First pass: create folder objects
        folders.forEach((folder) => {
          folderMap[folder.id] = {
            ...folder,
            children: [],
          };
        });

        // Second pass: establish hierarchy
        folders.forEach((folder) => {
          if (folder.parent_id && folderMap[folder.parent_id]) {
            folderMap[folder.parent_id].children.push(folderMap[folder.id]);
          } else {
            rootFolders.push(folderMap[folder.id]);
          }
        });

        setExistingFolders(rootFolders);
      } else {
        console.error("Failed to fetch folders:", data.message);
        setExistingFolders([]);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setExistingFolders([]);
    }
  };

  const renderFolderSelect = () => {
    if (existingFolders.length === 0) {
      return (
        <select disabled>
          <option>No folders available</option>
        </select>
      );
    }

    return (
      <select
        value={selectedFolderId || ""}
        onChange={(e) => handleParentFolderChange(e.target.value)}
      >
        <option value="">-- None (Top Level) --</option>
        {renderFolderOptions(existingFolders)}
      </select>
    );
  };

  
  //prints

  const generateNewCitation = (originalCitation, judgmentData) => {
    // Ensure judgmentData is defined and has the expected structure
    if (!judgmentData || !judgmentData.judgmentDOJ) {
      console.error("Invalid judgmentData:", judgmentData);
      return null;
    }

    // Extract year from judgmentDOJ (assuming format is ddmmyyyy)
    const year = judgmentData.judgmentDOJ.slice(-4); // Get last 4 characters

    // Create base citation
    let newCitation = `${year} ALD Online`;

    // Add citation serial number if available
    if (judgmentData.citationSerialNo) {
      newCitation += ` ${judgmentData.citationSerialNo}`;
    }

    // Extract court info from original citation
    const courtInfo = originalCitation.match(/\(([^0-9)]+)\)/g);
    if (courtInfo) {
      newCitation += ` ${courtInfo.join(" ")}`;
    }

    return newCitation.trim(); // Remove any leading/trailing whitespace
  };

 
  
  //print
  const handlePrint = () => {
    if (judgmentData) {
      const printWindow = window.open("", "", "height=800,width=800");
      const currentTime = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      printWindow.document.write(`
        <html>
        <head>
          <title>ALD Online</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            thead {
              display: table-header-group;
            }

            tbody {
              display: table-row-group;
            }

            .header-cell {
              padding: 20px 40px;
              background-color: white;
              border-bottom: none;
            }

            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .title-image {
              width: 170px;
              height: auto;
            }

            .timestamp {
              font-size: 10px;
              color: #666;
            }
            .username {
              font-size: 10px;
              color: #666;
            }

            .contentcell {
              padding: 20px;
            }

            .container {
              height: auto;
              font-size: 12px;
              line-height: 1.5;
              text-align: justify;
              width: 90%;
              max-width: 1080px;
              margin: 0 auto;
              border: none;
              padding: 0;
            
            }

            .metadata {
              text-align: center !important;
              margin: 0;
            }

            .metadata h4 {
              text-align: center !important;
              font-weight: bold;
              font-size: 14px;
            }

            .metadata p, 
            .metadata div {
              text-align: center !important;
              margin: 10px 0;
            }

            h2, h3, h4, h5 {
              text-align: center !important;
              font-weight: bold;
            }

            h2 {
              font-size: 16px;
            }

            h3 {
              font-size: 15px;
            }

            h4 {
              font-size: 14px;
            }

            h5 {
              font-size: 13px;
            }

            .container .shortnote {
              width: 100%;
            }

            .container h4 {
              text-align: center !important;
              font-weight: bold;
              font-size: 14px;
            }

            .container .shortnote p {
              text-align: left;
              line-height: 1.5;
            }

            .container .longnote p {
              text-align: left;
              line-height: 1.5;
            }
            .notessection {
              text-align: left;
            }

            @page {
              margin: 10mm;
              @bottom-right {
                content: counter(page);
              }
            }

            .page-number {
              position: running(pageNumber);
              text-align: right;
            }

            .footer {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              color: #666;
              text-align: center;
            }

            @media print {
              thead {
                display: table-header-group;
              }
              tbody {
                display: table-row-group;
              }
              .container {
                box-shadow: none;
                border: none;
                background-color: white;
              }
              .para-wrapper {
                page-break-inside: avoid !important;
               
              }
              h2, h3, h4, h5 {
                 page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-column-break-inside: avoid !important;
              }

              .footer {
                position: fixed;
                bottom: 5px;
                left: 50%;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
              .footer-cell {
                padding: 10px;
                text-align: center;
                font-size: 12px;
                color: #666;
                display: flex;
                justify-content: space-between;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-number"></div>
          
          <table>
            <thead>
              <tr>
                <td class="header-cell">
                  <div class="header-content">
                    <img class="title-image" src=${aldlogo} alt="ALD Online" />
                                          

                    <span class="timestamp">${currentTime}</span>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="contentcell">
                  <div class="container">
                    
                    
                    <!-- Metadata Section -->
                    <div class="metadata">
                      <div style="font-weight: bold;">${
                        generateNewCitation(
                          judgmentData.judgmentCitation,
                          judgmentData
                        ) || ""
                      }</div>
                      <div style="font-weight: bold;">${
                        judgmentData.judgmentCitation || ""
                      }</div>
                      <div style="font-weight: bold;">${
                        judgmentData.judgmentCourtText || ""
                      }</div>
                      <div style="font-weight: bold;">${
                        judgmentData.judgmentJudges || ""
                      }</div>
                      <div style="font-weight: bold;">${
                        judgmentData.judgmentDOJ
                          ? formatDate(judgmentData.judgmentDOJ)
                          : ""
                      }</div>
                      <div style="font-weight: lighter !important;">${
                        judgmentData.judgmentNoText || ""
                      }</div>
                      <div style="font-weight: lighter !important;">${
                        judgmentData.judgmentParties || ""
                      }</div>
                    </div>

                    <!-- Notes Section (Separate from metadata) -->
                    <div class="notessection" style="padding: 0; margin: 0;">
                    ${
                      judgmentData.ShortNotes &&
                      judgmentData.ShortNotes.length > 0
                        ? judgmentData.ShortNotes.map(
                            (shortNote) => `
                          <div class="shortnote">
                            <h4 style="text-align: justify !important;">${
                              shortNote.shortNoteText
                            }</h4>
                            ${
                              shortNote.LongNotes
                                ? shortNote.LongNotes.map(
                                    (longNote) => `
                              <div class="longnote">
                                ${longNote.LongNoteParas.map(
                                  (para) => `
                                  <p style="text-align: justify !important;">${para.longNoteParaText}</p>
                                `
                                ).join("")}
                              </div>
                            `
                                  ).join("")
                                : ""
                            }
                          </div>
                        `
                          ).join("")
                        : ""
                    }

                    <div>
                      ${
                        judgmentData.judgmentPetitionerCouncil
                          ? `<h5 style="text-align: left !important;">Petitioner Counsel: ${judgmentData.judgmentPetitionerCouncil}</h5>`
                          : ""
                      }
                      ${
                        judgmentData.judgmentRespondentCouncil
                          ? `<h5 style="text-align: left !important;">Respondent Counsel: ${judgmentData.judgmentRespondentCouncil}</h5>`
                          : ""
                      }
                      ${
                        judgmentData.judgmentRespondentCouncil
                          ? `<h5 style="text-align: left !important;">Appeared Counsel: ${judgmentData.judgmentRespondentCouncil}</h5>`
                          : ""
                      }
                    </div>
                    </div>

                    <div class="judgment-section">  
                    
                      ${judgmentData.JudgmentTexts.map((text) =>
                        text.judgmentsCiteds && text.judgmentsCiteds.length > 0
                          ? `<div class="cases-cited">
                              <h4>Cases Cited:</h4>
                              <ul>
                                ${text.judgmentsCiteds
                                  .map(
                                    (citation) => `
                                  <li>
                                    ${citation.judgmentsCitedParties} 
                                    ${citation.judgmentsCitedRefferedCitation}
                                    ${
                                      citation.judgmentsCitedEqualCitation
                                        ? `, ${citation.judgmentsCitedEqualCitation}`
                                        : ""
                                    }
                                  </li>
                                `
                                  )
                                  .join("")}
                              </ul>
                            </div>`
                          : ""
                      ).join("")}
                      <h3>JUDGMENT</h3>
                      ${judgmentData.JudgmentTexts.map((text) =>
                        text.JudgmentTextParas.map(
                          (para) => `
                          <div class="para-wrapper">
                            <div class="para-row">
                              
                              <div class="text-col">
                                ${
                                  para.judgementTextParaText.includes("<table")
                                    ? para.judgementTextParaText
                                    : `<p>${para.judgementTextParaText}</p>`
                                }
                              </div>
                            </div>
                          </div>
                        `
                        ).join("")
                      ).join("")}

                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="footer-cell">
                  <div>Licensed to ${user.displayName || "User"}</div>
                  <div>Copyright © Andhra Legal Decisions</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `);

      // Helper function to format date
      function formatDate(dateString) {
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

        function toOrdinal(num) {
          const suffixes = ["th", "st", "nd", "rd"];
          const v = num % 100;
          return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
        }

        return `${toOrdinal(day)} day of ${months[monthIndex]}, ${year}`;
      }

      printWindow.document.close();
      printWindow.focus();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }
  };
  const renderJudgmentContent = (judgmentData) => {
    if (!judgmentData || !judgmentData.JudgmentTexts || judgmentData.JudgmentTexts.length === 0) {
      return `<h3>JUDGMENT</h3><p>No judgment information available for this.</p>`;
    }
  
    const judgmentText = judgmentData.JudgmentTexts.map((text) =>
      text.JudgmentTextParas?.map((para) => `<p>${para.judgementTextParaText}</p>`).join("")
    ).join("");
  
    return `
      <h3>JUDGMENT</h3>
      ${judgmentText}
    `;
  };
  const renderHeadnotesContent = (judgmentData) => {
    return `
      <h3>HEADNOTES</h3>
      ${judgmentData.ShortNotes?.map((shortNote) => `
        <h4>${shortNote.shortNoteText}</h4>
        ${shortNote.LongNotes?.map((longNote) => `
          ${longNote.LongNoteParas?.map((para) => `
            <p>${para.longNoteParaText}</p>
          `).join("")}
        `).join("")}
      `).join("")}
    `;
  };
 
  const renderStatusContent = (judgmentData) => {
    if (!judgmentData || !judgmentData.JudgmentStatuses || !judgmentData.referringCitations) {
      return "<p>No status information available</p>";
    }
  
    // Helper function to highlight text (if needed)
    const highlightText = (text, searchTerms = []) => {
      if (!text || !searchTerms.length) return text;
  
      const regexPattern = searchTerms.map(term => term.replace(/[()]/g, '\\$&')).join('|');
      const regex = new RegExp(`(${regexPattern})`, 'gi');
      return text.replace(regex, (match) => `<mark>${match}</mark>`);
    };
  
    // Left Section: Cases Overruled/Reversed/etc.

    const leftSection = `
      <div>
        <h3>Cases Overruled/Reversed/etc. in</h3>
        ${judgmentData.JudgmentStatuses.map((status) => `
          <div style="display: flex;" key=${status.judgmentStatusId}>
            <h4>${highlightText(status.judgmentStatusLinkCitation)}</h4>
            <p>${status.JudgmentStatusType ? highlightText(status.JudgmentStatusType.judgmentStatusTypeName) : ''}</p>
          </div>
        `).join("")}
      </div>
    `;
  
    // Right Section: Status (Referred In)
    const rightSection = `
      <div>
        <h3>Status</h3>
        ${judgmentData.referringCitations.map((citation, index) => {
          const statusTypeNames = citation.JudgmentStatuses?.map(status => status.judgmentStatusTypeName) || [];
          const displayStatus = statusTypeNames.length > 0 ? statusTypeNames.join(", ") : "Referred";
  
          return `
            <div key=${index}>
              <h4>${displayStatus} in</h4>
              <h4>${highlightText(citation.judgmentCitation)}</h4>
            </div>
          `;
        }).join("")}
      </div>
    `;
  
    // Combine left and right sections
    return `
      <div style="display: flex; justify-content: space-between;">
        <div style="width: 540px;">${leftSection}</div>
        <div style="width: 540px;">${rightSection}</div>
      </div>
    `;
  };

  const renderEqualsContent = (judgmentData) => {
    if (judgmentData.EqualCitations && judgmentData.EqualCitations.length > 0) {
      return `
        <h3>EQUALS</h3>
        ${judgmentData.EqualCitations.map((citation) => `
          <p>${citation.equalCitationText}</p>
        `).join("")}
      `;
    } else {
      return `
        <h3>EQUALS</h3>
        <p>No equals information available.</p>
      `;
    }
  };
  const renderCitedContent = (judgmentData) => {
    return `
      <h3>CASES CITED</h3>
      ${judgmentData.JudgmentTexts?.map((text) => `
        ${text.judgmentsCiteds?.map((citation) => `
          <p>
            ${citation.judgmentsCitedParties} - 
            ${citation.judgmentsCitedRefferedCitation} = 
            ${citation.judgmentsCitedEqualCitation}
          </p>
        `).join("")}
      `).join("")}
    `;
  };

  const handlecontentPrint = () => {
    if (!judgmentData) {
      alert("No judgment data available to print!");
      return;
    }
  
    // Determine the content to print based on the activeContent prop
    let contentToPrint = "";
  
    switch (activeContent) {
      case "judgment":
        contentToPrint = renderJudgmentContent(judgmentData);
        break;
      case "headnotes":
        contentToPrint = renderHeadnotesContent(judgmentData);
        break;
      case "status":
        contentToPrint = renderStatusContent(judgmentData);
        break;
      case "equals":
        contentToPrint = renderEqualsContent(judgmentData);
        break;
      case "cited":
        contentToPrint = renderCitedContent(judgmentData);
        break;
      default:
        alert("No active content to print!");
        return;
    }
  
    // Open a new window for printing
    const printWindow = window.open("", "", "height=800,width=800");
    const currentTime = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  
    printWindow.document.write(`
      <html>
      <head>
        <title>ALD Online - Content Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
          }
  
          .container {
            height: auto;
            font-size: 12px;
            line-height: 1.5;
            text-align: justify;
            width: 90%;
            max-width: 1080px;
            margin: 0 auto;
            border: none;
            padding: 0;
          }
  
          .header-cell {
              padding: 20px 40px;
              background-color: white;
              border-bottom: none;
            }

            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
  
          .title-image {
            width: 170px;
            height: auto;
          }
  
          .timestamp {
            font-size: 10px;
            color: #666;
          }
  
          .username {
            font-size: 10px;
            color: #666;
          }
  
          .contentcell {
            padding: 20px;
            width: 1080px;
          }
  
          .footer {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #666;
            text-align: center;
          }
             .footer-cell {
                padding: 10px;
                text-align: center;
                font-size: 12px;
                color: #666;
                display: flex;
                justify-content: space-between;
              }
  
          @media print {
            .container {
              box-shadow: none;
              border: none;
              background-color: white;
            }
  
            .footer {
              position: fixed;
              bottom: 5px;
              left: 50%;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-number"></div>
        
        <table>
          <thead>
            <tr>
              <td class="header-cell">
                <div class="header-content">
                  <img class="title-image" src=${aldlogo} alt="ALD Online" />
                  <span class="timestamp">${currentTime}</span>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="contentcell">
                <div class="container">
                  ${contentToPrint}
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="footer-cell">
                <div>Licensed to ${user.displayName || "User"}</div>
                <div>Copyright © Andhra Legal Decisions</div>
              </td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
  
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  

  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        {items.map((item, index) => (
          <button
          key={index}
          className={`${styles.textButton} ${activeItem === item.key ? styles.active : ""}`}
          onClick={() => item.action ? item.action() : handleClick(item.key)}
        disabled={
          (item.key === "back" && currentStep <= 0) || 
          (item.key === "forward" && currentStep >= historyStack.length - 1)
        }
        style={{
          opacity: 
            (item.key === "back" && currentStep <= 0) || 
            (item.key === "forward" && currentStep >= historyStack.length - 1)
              ? 0.5
              : 1,
          cursor: 
            (item.key === "back" && currentStep <= 0) || 
            (item.key === "forward" && currentStep >= historyStack.length - 1)
              ? "not-allowed"
              : "pointer",
        }}
        >
          {item.name}
        </button>
        ))}
      </div>

      {/* Modal for Bookmark Form */}
      {isBookmarkModalOpen && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2 className={styles.modaltitle}>Create Bookmark</h2>
      <form onSubmit={handleFormSubmit}>
        {renderFolderSection()}

        <label>
          Bookmark Title:
          <input
            type="text"
            value={bookmarkTitle}
            onChange={(e) => setBookmarkTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Note:
          <textarea
            value={bookmarkNote}
            onChange={(e) => setBookmarkNote(e.target.value)}
            placeholder="Optional notes for your bookmark"
          />
        </label>

        <div className={styles.modalActions}>
          <button type="submit">Save Bookmark</button>
          <button type="button" onClick={handleModalClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Custom Login Modal */}
{isLoginModalOpen && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2>Authentication Required</h2>
      <p>You need to be a registered user to access this feature!</p>
      
      <div className={styles.modalActions}>
        <button 
          className={styles.secondaryButton}
          onClick={() => {
            setLoginModalOpen(false);
            navigate("/auth?mode=signup");
          }}
        >
          Sign Up
        </button>
        <button 
          className={styles.primaryButton}
          onClick={() => {
            setLoginModalOpen(false);
            navigate("/auth?mode=login");
          }}
        >
          Login
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FrontDashboard;
