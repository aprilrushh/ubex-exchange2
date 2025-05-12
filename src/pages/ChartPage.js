// src/pages/ChartPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import SimpleChart from '../components/Chart/SimpleChart';
import './ChartPage.css';

const ChartPage = () => {
  const { symbol } = useParams();
  
  console.log('ChartPage 렌더링:', { symbol });
  
  return (
    <div className="chart-page">
      <Header />
      <div className="chart-content">
        <SimpleChart symbol={symbol || 'BTC/USDT'} />
      </div>
    </div>
  );
};

export default ChartPage;
