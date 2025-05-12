import React from 'react';
import TradingHistory from '../components/TradeHistory/TradingHistory';

const TradeHistoryPage = () => {
  return (
    <div className="trade-history-page">
      <h1>체결 내역</h1>
      <TradingHistory />
    </div>
  );
};

export default TradeHistoryPage;
