import React from 'react';
import CoinList from '../CoinList/CoinList.js';
import TradingChart from '../Chart/TradingChart.jsx';
import OrderBook from '../OrderBook/OrderBook.jsx';
import OrderForm from '../OrderForm/OrderForm.jsx';
import TradeHistory from '../TradeHistory/TradingHistory.js';
import './ExchangePage.css';

const ExchangePage = () => {
  const handleOrderSubmit = (order) => {
    console.log('Order submitted:', order);
  };
  
  return (
    <div className="exchange-page">
      <div className="left-column">
        <CoinList />
      </div>
      <div className="center-column">
        <TradingChart />
      </div>
      <div className="right-column">
        <OrderBook symbol="BTC/USDT" />
        <OrderForm symbol="BTC/USDT" onOrderSubmit={handleOrderSubmit} />
      </div>
      <div className="trade-history-section">
        <TradeHistory symbol="BTC/USDT" />
      </div>
    </div>
  );
};

export default ExchangePage;