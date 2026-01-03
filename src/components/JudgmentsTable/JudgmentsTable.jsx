import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './JudgmentsTable.module.css';

const JudgmentsTable = ({ judgmentData, onRowClick, selectedRow }) => {
    const [sortedData, setSortedData] = useState(judgmentData);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    useEffect(() => {
        setSortedData(judgmentData);
    }, [judgmentData]);

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
        
        const sorted = [...sortedData].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

            if (key === 'judgmentDOJ') {
                // Convert date strings to comparable format
                aValue = parseInt(aValue);
                bValue = parseInt(bValue);
            }

            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setSortedData(sorted);
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString.length !== 8) return dateString;
        const day = dateString.slice(0, 2);
        const month = dateString.slice(2, 4);
        const year = dateString.slice(4, 8);
        return `${day}/${month}/${year}`;
    };

    const handleRowClick = (judgment) => {
        onRowClick(judgment);
        window.scrollTo({
            top: 120,
            behavior: 'smooth'
        });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '⇅';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className={styles.pageContainer}>
           

            {/* Table Wrapper */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.headerRow}>
                            <th className={styles.headerCell} style={{ width: '60px', textAlign: 'center' }}>
                                S.No
                            </th>
                            <th 
                                className={`${styles.headerCell} ${styles.sortable}`} 
                                onClick={() => handleSort('judgmentDOJ')}
                                style={{ width: '120px' }}
                            >
                                Date {getSortIndicator('judgmentDOJ')}
                            </th>
                            <th 
                                className={`${styles.headerCell} ${styles.sortable}`}
                                onClick={() => handleSort('judgmentCitation')}
                                style={{ width: '200px' }}
                            >
                                Citation {getSortIndicator('judgmentCitation')}
                            </th>
                            <th className={styles.headerCell} style={{ minWidth: '250px' }}>
                                Parties
                            </th>
                            <th className={styles.headerCell} style={{ width: '180px' }}>
                                Court
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? (
                            sortedData.map((judgment, index) => (
                                <tr
                                    key={index}
                                    className={`${styles.dataRow} ${selectedRow === judgment ? styles.selectedRow : ''}`}
                                    onClick={() => handleRowClick(judgment)}
                                >
                                    <td className={styles.dataCell} style={{ textAlign: 'center' }}>
                                        <span className={styles.serialNumber}>{index + 1}</span>
                                    </td>
                                    <td className={styles.dataCell}>
                                        <span className={styles.dateText}>
                                            {formatDate(judgment.judgmentDOJ)}
                                        </span>
                                    </td>
                                    <td className={styles.dataCell}>
                                        <span className={styles.citationText}>
                                            {judgment.judgmentCitation}
                                        </span>
                                    </td>
                                    <td className={styles.dataCell}>
                                        <span className={styles.partiesText}>
                                            {judgment.judgmentParties}
                                        </span>
                                    </td>
                                    <td className={styles.dataCell}>
                                        <span className={styles.courtText}>
                                            {judgment.courtName}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={styles.noData}>
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

JudgmentsTable.propTypes = {
    judgmentData: PropTypes.array.isRequired,
    onRowClick: PropTypes.func.isRequired,
    selectedRow: PropTypes.object,
};

export default JudgmentsTable;
