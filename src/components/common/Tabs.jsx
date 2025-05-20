import React from 'react';
import styles from './Tabs.module.css';

export default function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={`${styles.tabs} ${className || ''}`}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
