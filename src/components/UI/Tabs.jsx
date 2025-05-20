import React, { useState } from 'react';
import './Tabs.css';

const Tabs = ({ tabs = [], initialTab = 0, onTabChange }) => {
  const [activeIndex, setActiveIndex] = useState(initialTab);

  const handleClick = (index) => {
    setActiveIndex(index);
    if (onTabChange) onTabChange(index);
  };

  return (
    <div className="tabs">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          className={`tab ${activeIndex === idx ? 'active' : ''}`}
          onClick={() => handleClick(idx)}
        >
          {tab.label || tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
