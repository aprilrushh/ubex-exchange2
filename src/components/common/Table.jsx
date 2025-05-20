import React from 'react';
import styles from './Table.module.css';

export default function Table({ className = '', children, ...props }) {
  return (
    <table className={`${styles.table} ${className}`} {...props}>
      {children}
    </table>
  );
}
