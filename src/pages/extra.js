import React from "react";
import SubHeader from "../components/SubHeader/SubHeader.jsx";
import FrontDashboard from "../components/FrontDashboard/FrontDashboard";
import EditBar from "../components/EditBar/EditBar.jsx";
import RearDashboard from "../components/RearDashboard/RearDashboard";
import styles from "./IndexPage.module.css"; // Ensure correct import path
import SidePanel from "../components/SidePanel/SidePanel";
import { LuWholeWord } from "react-icons/lu";

const IndexPage = () => {
   return (
      <div>
         <SubHeader />
         <FrontDashboard />
         
        <div className={styles.sideNscroll}>
         <SidePanel />

         <div className={styles.scrollableText}>
            <h3 className={styles.centered}>
              //citation<br />
              //courttext
              <br /><br /><br />
              //judgenname
              <br /><br /><br />
              judgementno
              <br /><br /><br />
              //judgmentnotext
              <br /><br />
             //judgmentParties
              <br />
             //shortnote
            </h3>
            <p>
             longnote
            </p>
            <p>
              JudgmentTextPara
            </p>
          </div>
          <EditBar />
          </div>
         <RearDashboard />
      </div>
   );
};

export default IndexPage;
// whole

import React, { useState } from 'react';

import SubHeader from "../components/SubHeader/SubHeader.jsx";
import FrontDashboard from "../components/FrontDashboard/FrontDashboard";
import EditBar from "../components/EditBar/EditBar.jsx";
import RearDashboard from "../components/RearDashboard/RearDashboard";
import styles from "./IndexPage.module.css"; // Ensure correct import path
import SidePanel from "../components/SidePanel/SidePanel";

const IndexPage = () => {
  const [judgmentId, setJudgmentId] = useState('');
  const [judgmentData, setJudgmentData] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:3001/judgments/${judgmentId}`); // Ensure the port is 3001
      const data = await response.json();
      setJudgmentData(data);
    } catch (error) {
      console.error('Error fetching judgment:', error);
    }
  };

  return (
    <div>
      <SubHeader />
      <FrontDashboard />
      <div className={styles.sideNscroll}>
        <SidePanel />
        <div className={styles.scrollableText}>
          <h3 className={styles.centered}>
            {judgmentData ? (
              <>
                {judgmentData.judgmentCitation}<br />
                {judgmentData.judgmentCourtText}
                <br /><br /><br />
                {judgmentData.judgmentJudges}
                <br /><br /><br />
                {judgmentData.judgmentNo}
                <br /><br /><br />
                {judgmentData.judgmentNoText}
                <br /><br />
                {judgmentData.judgmentParties}
                <br />
                
              </>
            ) : (
              'No judgment data available'
            )}
          </h3>
          <h3>
              {judgmentData ? (
                <>
                  {judgmentData.ShortNoteTexts.map((shortNote) => (
                    <div key={shortNote.shortNoteTextId}>
                      <p>{shortNote.shortNoteText}</p>
                      {shortNote.LongNoteTextParas.map((longNote) => (
                        <p key={longNote.longNoteParaId}>{longNote.longNoteParaText}</p>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                'No judgment data available'
              )}
            </h3>


          <p>
            {/* Assuming 'longnote' is part of judgmentData */}
            {judgmentData ? judgmentData.longnote : ''}
          </p>
          <p>
            {judgmentData ? (
              judgmentData.JudgmentTexts.map((text) =>
                text.JudgmentTextParas.map((para) => (
                  <p key={para.judgementTextParaId}>{para.judgementTextParaText}</p>
                ))
              )
            ) : (
              ''
            )}
          </p>
        </div>
        <EditBar />
      </div>
      <RearDashboard />
    </div>
  );
};

export default IndexPage;


<div>
      
      <h1>Judgment Search</h1>
      <input
        type="text"
        value={judgmentId}
        onChange={(e) => setJudgmentId(e.target.value)}
        placeholder="Enter Judgment ID"
      />
      <button onClick={handleSearch}>Search</button>


      //
      </div>


//
app.get('/api/judgments/:judgmentId', async (req, res) => {
    const { judgmentId } = req.params; // Extracting judgmentId from request parameters
    try {
        // Calling the function to fetch judgment data based on judgmentId
        const judgmentData = await fromJudgmentId(judgmentId);
        // Sending the judgmentData as JSON response
        res.json(judgmentData);
    } catch (error) {
        // Handling errors - logging and sending 500 Internal Server Error response
        console.error('Error fetching judgment data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});