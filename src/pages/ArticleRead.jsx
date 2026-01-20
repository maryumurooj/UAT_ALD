//update article read

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Styles from "./ArticleView/ArticleViewNoList.module.css";
import api from "../axios"

const ArticleRead = () => {
    const { fileName } = useParams();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/articles");
    };
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

export default ArticleRead;
