import React from 'react';
import SimpleChart from './SimpleChart';
import ChartHeader from './ChartHeader';
import './TradingChart.css';

const TradingChart = ({ symbol = 'BTC/USDT', onTimeframeChange }) => {
  return (
    <div className="trading-chart">
      <ChartHeader onTimeframeChange={onTimeframeChange} />
      <SimpleChart symbol={symbol} onTimeframeChange={onTimeframeChange} />
    </div>
  );
};

export default TradingChart;
