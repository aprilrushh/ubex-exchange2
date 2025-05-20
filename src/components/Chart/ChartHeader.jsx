import React from 'react';
import TimeframeSelector from './TimeframeSelector';
import IndicatorSelector from './Indicators/IndicatorSelector';
import './ChartHeader.css';

const ChartHeader = ({ onTimeframeChange, onIndicatorChange }) => (
  <div className="chart-header">
    <TimeframeSelector onTimeframeChange={onTimeframeChange} />
    <IndicatorSelector onIndicatorChange={onIndicatorChange} />
  </div>
);

export default ChartHeader;
