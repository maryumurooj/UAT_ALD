import React from 'react';
import styles from './AmendmentInfo.module.css';

const AmendmentInfo = ({ sectionData }) => {
    return (
        <div className={styles.amendmentInfo}>
            {sectionData ? (
                <div>
                    <h3>Amendment Information</h3>
                    <div className={styles.sectionContent}>
                        {sectionData}
                    </div>
                </div>
            ) : (
                <p>No Amendment Data Available</p>
            )}
        </div>
    );
};

export default AmendmentInfo;
