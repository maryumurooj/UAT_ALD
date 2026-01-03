import React from "react";
import styles from "./StatusContent.module.css";

const StatusContent = ({ judgmentData, searchTerms, setReferredCitation }) => {
  const highlightText = (text) => {
    if (!searchTerms || searchTerms.length === 0) {
      return text;
    }

    const regex = new RegExp(`(${searchTerms.join('|')})`, 'gi');
    return text.replace(regex, (match) => `<span class=${styles.highlight}>${match}</span>`);
  };

  const handleCitationClick = (citation) => {
    console.log("Clicked Citation", citation);
    // Store the citation in localStorage
    localStorage.setItem('referredCitation', citation);
    // Reload the page
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <h3>Cases Overruled/Reversed/etc. in</h3>
        {judgmentData && judgmentData.JudgmentStatuses && judgmentData.JudgmentStatuses.length > 0 ? (
          judgmentData.JudgmentStatuses.map((status) => (
            <div key={status.judgmentStatusId} className={styles.statusItem}>
              <h4>
  {status.judgmentStatusLinkCitation.includes("ALD") ? (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleCitationClick(status.judgmentStatusLinkCitation);
      }}
      dangerouslySetInnerHTML={{ __html: highlightText(status.judgmentStatusLinkCitation) }}
    />
  ) : (
    <span
      dangerouslySetInnerHTML={{ __html: highlightText(status.judgmentStatusLinkCitation) }}
    />
  )}
</h4>    
              <p dangerouslySetInnerHTML={{ __html: status.JudgmentStatusType ? highlightText(status.JudgmentStatusType.judgmentStatusTypeName) : '' }}></p>
            </div>
          ))
        ) : (
          <p>No status information available</p>
        )}
      </div>
      <div className={styles.rightSection}>
  <h3>Status </h3>
{judgmentData && judgmentData.referringCitations && judgmentData.referringCitations.length > 0 ? (
  judgmentData.referringCitations.map((citation, index) => {
      // Extract status type names from JudgmentStatuses array
      const statusTypeNames = citation.JudgmentStatuses?.map(status => status.judgmentStatusTypeName) || [];
      // If there are no statuses, default to "Referred In"
      const displayStatus = statusTypeNames.length > 0 ? statusTypeNames.join(", ") : "Referred";

      return (
        <div key={index} className={styles.referredInItem}>
          {/* Making text clickable with a handleCitationClick function */}
          <h4>{displayStatus} in</h4>
          <h4>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault(); // Prevent the default link action
                handleCitationClick(citation.judgmentCitation); // Call the citation click handler
              }}
              dangerouslySetInnerHTML={{ __html: highlightText(citation.judgmentCitation) }}
            />
          </h4>
        </div>
      );
    })
    ) : (
    <p>No referred statuses available</p>
  )}
</div>
    </div>
  );
};

export default StatusContent;
