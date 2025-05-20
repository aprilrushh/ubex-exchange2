import React from 'react';
import Tabs from '../common/Tabs';
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
    <Tabs
      tabs={TABS}
      activeTab={activeTab}
      onChange={onTabChange}
      className="portfolio-tabs"
    />
  );
};

export default PortfolioTabs; 