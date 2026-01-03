import React from "react";

import Styles from "./ArticleReadwithoutList.module.css"; 

import FDB from "./FrontDBArticle";

import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
import PDFFile from "./Pdfviewer.jsx";
function ArticleRead() {
  return (
<div className={Styles.AVNLcontainer}>


      <div className={Styles.AVNLcol}>
          <FDB/>
          <div className={Styles.AVNLbox}>
             <PDFFile/>
          </div>
      </div>
    </div>

  );
}

export default ArticleRead;