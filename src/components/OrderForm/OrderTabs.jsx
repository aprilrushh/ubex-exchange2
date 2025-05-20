import React from 'react';
import './OrderTabs.css';

export default function OrderTabs({ activeSide, onChange }) {
  return (
    <div className="order-tabs">
      <button
        type="button"
        className={`order-tab ${activeSide === 'BUY' ? 'active' : ''}`}
        onClick={() => onChange('BUY')}
      >
        매수
      </button>
      <button
        type="button"
        className={`order-tab ${activeSide === 'SELL' ? 'active' : ''}`}
        onClick={() => onChange('SELL')}
      >
        매도
      </button>
    </div>
  );
}
