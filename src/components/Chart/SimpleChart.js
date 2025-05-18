// src/components/Chart/SimpleChart.js
import React, { useEffect, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import './SimpleChart.css';

// 지금은 차트 초기화만 해두고, data나 loading은 처리하지 않습니다.
const SimpleChart = ({ symbol = 'BTC/USDT' }) => {
  // ① 차트 세팅
  const initChart = useCallback(() => {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) return;

    const chart = createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    });

    chart.timeScale().fitContent();
  }, []);

  // ② 마운트 시 한 번만 그리기
  useEffect(() => {
    initChart();
  }, [initChart]);

  return (
    <div className="simple-chart-container">
      <div id="chart-container" style={{ width: '100%', height: 400 }} />
    </div>
  );
};

export default SimpleChart;