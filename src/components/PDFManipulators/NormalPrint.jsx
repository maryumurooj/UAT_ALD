import React, { useEffect } from 'react';
import jsPDF from 'jspdf';
import { html2pdf } from 'html2pdf.js';

const NormalPrint = ({ contentRef, onSuccess }) => {
  useEffect(() => {
    if (contentRef.current) {
      // Create a new PDF document
      const pdf = new jsPDF();

      // Use html2pdf to handle HTML to PDF conversion
      html2pdf().from(contentRef.current).toPdf().get('pdf').then(pdfDoc => {
        // Open the PDF in a new tab
        window.open(pdfDoc.output('bloburl'));

        // Call the success callback
        if (onSuccess) onSuccess();
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    }
  }, [contentRef, onSuccess]);

  return null; // This component does not render anything
};

export default NormalPrint;
