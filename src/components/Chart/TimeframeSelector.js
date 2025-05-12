// src/components/Chart/TimeframeSelector.js
import React, { useState } from 'react';
import './TimeframeSelector.css';

const TimeframeSelector = ({ onTimeframeChange, defaultTimeframe = '1h' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(defaultTimeframe);
  
  const timeframes = [
    { id: '1m', label: '1분', interval: 1, unit: 'minute' },
    { id: '5m', label: '5분', interval: 5, unit: 'minute' },
    { id: '15m', label: '15분', interval: 15, unit: 'minute' },
    { id: '30m', label: '30분', interval: 30, unit: 'minute' },
    { id: '1h', label: '1시간', interval: 1, unit: 'hour' },
    { id: '4h', label: '4시간', interval: 4, unit: 'hour' },
    { id: '1d', label: '1일', interval: 1, unit: 'day' },
    { id: '1w', label: '1주', interval: 1, unit: 'week' },
    { id: '1M', label: '1월', interval: 1, unit: 'month' }
  ];
  
  const handleTimeframeChange = (timeframeId) => {
    const selectedTf = timeframes.find(tf => tf.id === timeframeId);
    setSelectedTimeframe(timeframeId);
    
    if (onTimeframeChange && selectedTf) {
      onTimeframeChange({
        id: timeframeId,
        label: selectedTf.label,
        interval: selectedTf.interval,
        unit: selectedTf.unit
      });
    }
  };
  
  return (
    <div className="timeframe-selector">
      <div className="timeframe-label">차트 간격</div>
      <div className="timeframe-buttons">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            className={`timeframe-button ${selectedTimeframe === timeframe.id ? 'active' : ''}`}
            onClick={() => handleTimeframeChange(timeframe.id)}
          >
            {timeframe.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeframeSelector;