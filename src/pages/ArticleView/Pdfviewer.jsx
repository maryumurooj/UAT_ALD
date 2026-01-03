import React, { useState, useEffect } from "react";
import { Document, Page } from 'react-pdf';
import Styles from './Pdfviewer.module.css';

const PDFFile = ({ fileUrl }) => {
 const [numPages, setNumPages] = useState(0);
const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    
}
  
    return (
        <div className={Styles.pdfContainer}>
            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} pageWrapStyles={{ marginBottom: "10px" }}>
                {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1}   
          scale={1.5}               
          renderAnnotationLayer={false} 
          renderTextLayer={false} />
        ))}
            </Document>
            
        </div>
    );
};

export default PDFFile;


  