import React from "react";
import Styles from "./ArticleViewList.module.css"; 
import FDB from "src/components/ArticleViewTools/FDBArticle.jsx";
import List from "src/components/ArticleViewTools/List.jsx";
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
import PDFFile from "./Pdfviewer.jsx";
function ArticleRead() {
  return (
<div className={Styles.AVLcontainer}>
    <div className={Styles.AVLrow}>  
      <div className={Styles.AVLlistbox}>
      <List/>
      </div>
      <div className={Styles.AVLcol}>
      <FDB/>
        <div className={Styles.AVlbox}>
      <PDFFile/>
          </div>
      </div>
    </div>
  </div>
  );
}

export default ArticleRead;