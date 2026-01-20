import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JudgmentStatusPage.module.css';
import api from "../../axios"


const JudgmentStatusPage = () => {
    const navigate = useNavigate();
    
    const [allJudgments, setAllJudgments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    
    // Selection
    const [selectedIds, setSelectedIds] = useState(new Set());
    
    // Bulk action
    const [bulkUpdating, setBulkUpdating] = useState(false);

    const API_BASE = 'http://61.246.67.74:4001/api/uat';

    useEffect(() => {
        fetchAllJudgments();
    }, []);

    const handleCitationClick = (citation) => {
        if (citation) {
          localStorage.setItem("referredCitation", citation);
        }
        navigate("/index");
      };

    const fetchAllJudgments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/judgmentstat/list`);
            const result = await response.json();

            if (result.success && result.data) {
                setAllJudgments(result.data);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load judgments');
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering
    const filteredJudgments = useMemo(() => {
        let filtered = [...allJudgments];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(j => j.status === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(j =>
                j.judgmentCitation?.toLowerCase().includes(term) ||
                j.judgmentParties?.toLowerCase().includes(term) ||
                j.courtName?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [allJudgments, statusFilter, searchTerm]);

    // Paginate
    const paginatedJudgments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredJudgments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredJudgments, currentPage]);

    const totalPages = Math.ceil(filteredJudgments.length / itemsPerPage);

    // Toggle row selection (click anywhere on row)
    const handleRowClick = (judgmentId, e) => {
        // Don't toggle if clicking on a button/link
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }

        const newSelected = new Set(selectedIds);
        if (newSelected.has(judgmentId)) {
            newSelected.delete(judgmentId);
        } else {
            newSelected.add(judgmentId);
        }
        setSelectedIds(newSelected);
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    // Bulk status update
    const handleBulkStatusUpdate = async (newStatus) => {
        if (selectedIds.size === 0) {
            alert('No judgments selected');
            return;
        }

        if (!confirm(`Mark ${selectedIds.size} judgments as ${newStatus.replace('_', ' ')}?`)) {
            return;
        }

        setBulkUpdating(true);
        try {
            const idsArray = Array.from(selectedIds);
            
            // Update in parallel (batches of 10)
            const batchSize = 10;
            for (let i = 0; i < idsArray.length; i += batchSize) {
                const batch = idsArray.slice(i, i + batchSize);
                await Promise.all(
                    batch.map(id =>
                        fetch(`${API_BASE}/judgment-status/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus })
                        })
                    )
                );
            }

            // Update local state
            setAllJudgments(prev =>
                prev.map(j =>
                    selectedIds.has(j.judgmentId)
                        ? { ...j, status: newStatus, lastEditedAt: new Date().toISOString() }
                        : j
                )
            );

            alert(`✓ Updated ${selectedIds.size} judgments`);
            clearSelection();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update some judgments');
        } finally {
            setBulkUpdating(false);
        }
    };

    const getFilterCounts = () => ({
        all: allJudgments.length,
        untouched: allJudgments.filter(j => j.status === 'untouched').length,
        in_progress: allJudgments.filter(j => j.status === 'in_progress').length,
        completed: allJudgments.filter(j => j.status === 'completed').length
    });

    const filterCounts = getFilterCounts();

    const formatDate = (dateString) => {
        if (!dateString || dateString.length !== 8) return dateString;
        return `${dateString.slice(0, 2)}/${dateString.slice(2, 4)}/${dateString.slice(4, 8)}`;
    };

    const formatEditDate = (timestamp) => {
        if (!timestamp) return 'Never';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const getStatusBadge = (status) => {
        const label = status.replace('_', ' ');
        return <span className={`${styles.statusBadge} ${styles[status]}`}>{label}</span>;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading judgments...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Compact Header */}
            <div className={styles.compactHeader}>
                <div className={styles.titleSection}>
                    <h1 className={styles.pageTitle}>Judgment Management</h1>
                    <span className={styles.resultBadge}>{filteredJudgments.length}</span>
                </div>
                <div className={styles.headerActions}>
                <button 
            className={`${styles.compactButton} ${styles.pushButton}`}
            disabled
        >
            Push
        </button>
                    <button 
                        className={styles.compactButton}
                        onClick={fetchAllJudgments}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <input
                    type="text"
                    className={styles.quickFilter}
                    placeholder="Search citation, parties, or court..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <select
                    className={styles.quickFilter}
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                    <option value="all">All Status ({filterCounts.all})</option>
                    <option value="untouched">Untouched ({filterCounts.untouched})</option>
                    <option value="in_progress">In Progress ({filterCounts.in_progress})</option>
                    <option value="completed">Completed ({filterCounts.completed})</option>
                </select>
                {(searchTerm || statusFilter !== 'all') && (
                    <button 
                        className={styles.clearButton}
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setCurrentPage(1);
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className={styles.bulkBar}>
                    <span className={styles.bulkText}>{selectedIds.size} selected</span>
                    <button
                        className={styles.bulkBtn}
                        onClick={() => handleBulkStatusUpdate('in_progress')}
                        disabled={bulkUpdating}
                    >
                        Mark In Progress
                    </button>
                    <button
                        className={`${styles.bulkBtn} ${styles.completed}`}
                        onClick={() => handleBulkStatusUpdate('completed')}
                        disabled={bulkUpdating}
                    >
                        Mark Completed
                    </button>
                    <button
                        className={`${styles.bulkBtn} ${styles.reset}`}
                        onClick={() => handleBulkStatusUpdate('untouched')}
                        disabled={bulkUpdating}
                    >
                        Reset
                    </button>
                    <button 
                        className={styles.clearButton}
                        onClick={clearSelection}
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.headerRow}>
                            <th className={styles.headerCell}>No.</th>
                            <th className={styles.headerCell}>Date</th>
                            <th className={styles.headerCell}>Citation</th>
                            <th className={styles.headerCell}>Parties</th>
                            <th className={styles.headerCell}>Court</th>
                            <th className={styles.headerCell}>Status</th>
                            <th className={styles.headerCell}>Last Edited</th>
                            <th className={styles.headerCell}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedJudgments.length > 0 ? (
                            paginatedJudgments.map((judgment, index) => {
                                const isSelected = selectedIds.has(judgment.judgmentId);
                                return (
                                    <tr
                                        key={judgment.judgmentId}
                                        className={`${styles.dataRow} ${isSelected ? styles.selected : ''}`}
                                        onClick={(e) => handleRowClick(judgment.judgmentId, e)}
                                    >
                                        <td className={styles.dataCell}>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className={styles.dataCell}>
                                            <span className={styles.dateText}>{formatDate(judgment.judgmentDOJ)}</span>
                                        </td>
                                        <td className={styles.dataCell}>
                                            <span className={styles.nameText}>{judgment.judgmentCitation}</span>
                                        </td>
                                        <td className={styles.dataCell}>
                                            <span className={styles.phoneText}>{judgment.judgmentParties}</span>
                                        </td>
                                        <td className={styles.dataCell}>
                                            <span className={styles.emailText}>{judgment.courtName}</span>
                                        </td>
                                        <td className={styles.dataCell}>
                                            {getStatusBadge(judgment.status)}
                                        </td>
                                        <td className={styles.dataCell}>
                                            <span className={styles.dateText}>{formatEditDate(judgment.lastEditedAt)}</span>
                                        </td>
                                        <td className={styles.dataCell}>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() =>
                                                    handleCitationClick(
                                                      judgment.newCitation || judgment.judgmentCitation
                                                    )
                                                  }>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className={styles.noData}>
                                    No judgments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.paginationBar}>
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={styles.pageBtn}
                    >
                        First
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={styles.pageBtn}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={styles.pageBtn}
                    >
                        Next
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.pageBtn}
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
};

export default JudgmentStatusPage;
