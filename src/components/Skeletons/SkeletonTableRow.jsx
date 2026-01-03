import React from 'react';
import styles from './SkeletonTableRow.module.css';

const SkeletonTableRow = ({ columns }) => {
  return (
    <tr className={styles.skeletonRow}>
      {Array(columns).fill(0).map((_, index) => (
        <td key={index} className={styles.skeletonCell}>
          <div className={styles.skeleton}></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonTableRow;
