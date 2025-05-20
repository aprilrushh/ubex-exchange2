import React from 'react';
import TimeframeSelector from './TimeframeSelector';
import IndicatorSelector from './Indicators/IndicatorSelector';
import './ChartHeader.css';

const ChartHeader = ({ timeframe, onTimeframeChange, indicators, onIndicatorChange }) => {
  return (
    <div className="chart-header">
      <TimeframeSelector
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
      />
      <IndicatorSelector
        indicators={indicators}
        onIndicatorChange={onIndicatorChange}
      />
    </div>
  );
};

export default ChartHeader;
