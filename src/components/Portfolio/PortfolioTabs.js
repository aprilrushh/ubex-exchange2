import React from 'react';
import './PortfolioTabs.css';

const TABS = [
  { key: 'portfolio', label: '보유자산' },
  { key: 'profit', label: '투자수익' },
  { key: 'history', label: '거래내역' },
  { key: 'pending', label: '미체결' },
  { key: 'deposit', label: '입출금대기' },
];

const PortfolioTabs = ({ activeTab, onTabChange }) => {
  return (
    <nav className="portfolio-tabs">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default PortfolioTabs; 