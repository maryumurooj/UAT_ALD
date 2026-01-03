import React from "react";
import { useParams } from "react-router-dom";
import Styles from "./ArticleView/ArticleViewNoList.module.css"; 
import FDB from "../components/ArticleViewTools/FDBArticle.jsx";
import { pdfjs } from 'react-pdf';
import PDFFile from "./ArticleView/Pdfviewer.jsx";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const JudgeRead = () => {
    const { fileName } = useParams();
    const zoomLevel = 150;
    return (
        <div className={Styles.AVNLcontainer}>


                <div className={Styles.AVNLbox}>
                <iframe
                    src={`http://61.246.67.74:4000/pdfs/${decodeURIComponent(fileName)}.pdf#zoom=${zoomLevel}`}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
                </div>
            </div>

    );
};

export default JudgeRead;
