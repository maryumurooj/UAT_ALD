import React, { useEffect, useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { db, auth } from "./../services/firebaseConfig"; // Firestore & Auth config
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth methods
import api from "../axios"

const PDFManipulator = ({ pdfUrl, onSuccess }) => {
  const [currentUser, setCurrentUser] = useState(null); // State to store current user's data
  const imageUrl = "http://61.246.67.74:4000/pdfs/printlogo.jpg"; // JPG Image URL

  // Get the currently logged-in user's information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set current user info
      } else {
        setCurrentUser(null); // No user is logged in
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const manipulatePDF = async () => {
      try {
        console.log("Fetching PDF from:", pdfUrl); // Debug log for PDF URL

        // Fetch the existing PDF and the JPG image concurrently
        const [pdfResponse, imgResponse] = await Promise.all([
          fetch(pdfUrl),
          fetch(imageUrl),
        ]);

        if (!pdfResponse.ok) {
          throw new Error("Failed to fetch PDF");
        }
        if (!imgResponse.ok) {
          throw new Error("Failed to fetch image");
        }

        const existingPdfBytes = await pdfResponse.arrayBuffer();
        const imgBytes = await imgResponse.arrayBuffer();

        console.log("PDF and JPG image successfully fetched"); // Debug log for successful fetch

        // Load the PDF
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const jpgImage = await pdfDoc.embedJpg(imgBytes);

        // Use the current user's display name
        const firstUser = currentUser?.displayName || "Default User";

        console.log("JPG image embedded in PDF"); // Debug log for image embedding

        // Function to apply changes to a page
        const applyChangesToPage = (page) => {
          // Get image dimensions
          const { width, height } = jpgImage.scale(0.8); // Scale down to 80% of the original size

          // Draw a horizontal line below the image and text
          const lineYTop = page.getHeight() - height - 52;
          page.drawLine({
            start: { x: 110, y: lineYTop }, // Start at the left
            end: { x: page.getWidth() - 110, y: lineYTop }, // End at the right with 10 units padding
            thickness: 1, // Line thickness
            color: rgb(0, 0, 0), // Black color for the line
          });

          // Place the image at the start of the top line
          page.drawImage(jpgImage, {
            x: 110, // Start at the left, aligned with the line
            y: lineYTop + 10, // Slightly above the line (10 units)
            width,
            height,
          });

          // Format the current date and time
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString("en-US", {
            weekday: "short", // Day in short form (e.g., "Mon")
            day: "2-digit", // Day as 2-digit number (e.g., "04")
            month: "short", // Month in short form (e.g., "Sep")
            year: "numeric", // Full year (e.g., "2023")
          });
          const formattedTime = currentDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // 12-hour format with AM/PM
          });
          const fullFormattedDate = `${formattedDate} - ${formattedTime}`;

          // Draw the formatted date and time on the right
          page.drawText(fullFormattedDate, {
            x: page.getWidth() - 234, // Align text on the right
            y: page.getHeight() - 80, // Same height as the image but to the right
            size: 9,
            color: rgb(0, 0, 0), // Black color for date and time
          });

          // Draw a second horizontal line just above the copyright text
          const lineYBottom = 60; // Distance from the bottom of the page
          page.drawLine({
            start: { x: 110, y: lineYBottom }, // Start at the left with 10 units padding
            end: { x: page.getWidth() - 110, y: lineYBottom }, // End at the right with 10 units padding
            thickness: 1, // Line thickness
            color: rgb(0, 0, 0), // Black color for the line
          });

          // Draw the username
          page.drawText(`Licensed to ${firstUser}`, {
            x: 110,
            y: lineYBottom + 10,
            size: 9,
            color: rgb(0, 0, 0),
          });

          // Draw the copyright text centered below the line
          const copyrightText = "Copyright © Andhra Legal Decisions";
          page.drawText(copyrightText, {
            x: (page.getWidth() - 150) / 2, // Center the text horizontally
            y: lineYBottom - 10, // Place text 10 units below the line
            size: 9,
            color: rgb(0, 0, 0), // Black color for the text
          });
        };

        // Apply changes to all pages
        const pages = pdfDoc.getPages();
        pages.forEach((page) => applyChangesToPage(page));

        // Serialize the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();

        console.log("PDF manipulated and saved"); // Debug log for PDF manipulation

        // Create a Blob from the PDF bytes
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        // Create a Blob URL
        const url = URL.createObjectURL(blob);

        // Open the manipulated PDF in a new tab
        window.open(url);

        console.log("PDF opened in a new tab"); // Debug log for opening the PDF

        // Revoke the object URL to free memory when no longer needed
        URL.revokeObjectURL(url);

        // Call the success callback
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Error manipulating PDF:", error); // Improved error logging
      }
    };

    if (pdfUrl && currentUser) {
      // Ensure currentUser is available
      manipulatePDF();
    } else {
      alert("Please set Profile UserName to print the PDF");
    }
  }, [pdfUrl, onSuccess, currentUser]);

  return null; // This component does not render anything
};

export default PDFManipulator;
