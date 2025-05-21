import React, { useState } from 'react';
import LimitOrder from './OrderTypes/LimitOrder';
import MarketOrder from './OrderTypes/MarketOrder';
import './TradingPanel.css';

export default function TradingPanel({ symbol, selectedPrice }) {
  const [orderType, setOrderType] = useState('LIMIT');

  const handleOrderSubmit = (order) => {
    console.log('Submit Order:', order);
  };

  return (
    <div className="trading-panel">
      <div className="order-type-selector" style={{ marginBottom: '15px' }}>
        <button
          type="button"
          className={orderType === 'LIMIT' ? 'active' : ''}
          onClick={() => setOrderType('LIMIT')}
        >
          지정가
        </button>
        <button
          type="button"
          className={orderType === 'MARKET' ? 'active' : ''}
          onClick={() => setOrderType('MARKET')}
        >
          시장가
        </button>
      </div>
      {orderType === 'LIMIT' ? (
        <LimitOrder symbol={symbol} selectedPrice={selectedPrice} onSubmit={handleOrderSubmit} />
      ) : (
        <MarketOrder symbol={symbol} onSubmit={handleOrderSubmit} />
      )}
    </div>
  );
}
