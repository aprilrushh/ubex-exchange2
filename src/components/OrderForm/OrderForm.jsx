import React, { useState } from 'react';
import { validateQuantity, validatePrice } from '../../utils/validation';
import OrderTabs from './OrderTabs';
import Button from '../common/Button';
import './OrderForm.css';

export default function OrderForm({ symbol = 'BTC/USDT', onSubmit }) {
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('LIMIT');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handlePercent = (pct) => {
    // Placeholder percent handler. In real app, use available balance.
    if (price) {
      const amount = ((pct / 100) * 1).toFixed(4); // dummy calculation
      setQuantity(amount);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      const quantityNum = parseFloat(quantity);
      validateQuantity(symbol, quantityNum);
      let priceNum;
      if (orderType === 'LIMIT') {
        priceNum = parseFloat(price);
        validatePrice(symbol, priceNum);
      }
      if (onSubmit) {
        onSubmit({
          symbol,
          type: orderType,
          side,
          quantity: quantityNum,
          price: orderType === 'LIMIT' ? priceNum : undefined,
        });
      }
      setQuantity('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  const total = orderType === 'LIMIT' && quantity && price
    ? (parseFloat(quantity) * parseFloat(price)).toFixed(8)
    : '-';

  return (
    <div className="order-form-container">
      <OrderTabs activeSide={side} onChange={setSide} />
      <div className="order-type-selector">
        <button
          type="button"
          className={`order-type-button ${orderType === 'LIMIT' ? 'active' : ''}`}
          onClick={() => setOrderType('LIMIT')}
        >
          지정가
        </button>
        <button
          type="button"
          className={`order-type-button ${orderType === 'MARKET' ? 'active' : ''}`}
          onClick={() => setOrderType('MARKET')}
        >
          시장가
        </button>
      </div>
      <form className="order-form-body" onSubmit={handleSubmit}>
        {orderType === 'LIMIT' && (
          <div className="form-group price-input-group">
            <label>가격</label>
            <input
              type="number"
              className="price-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="any"
              placeholder="주문 가격"
              required
            />
            <span className="input-suffix">USDT</span>
          </div>
        )}
        <div className="form-group amount-input-group">
          <label>수량</label>
          <input
            type="number"
            className="amount-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            step="any"
            placeholder="주문 수량"
            required
          />
          <span className="input-suffix">BTC</span>
        </div>
        <div className="percent-selector">
          {[25, 50, 75, 100].map((pct) => (
            <button
              type="button"
              key={pct}
              className="percent-button"
              onClick={() => handlePercent(pct)}
            >
              {pct}%
            </button>
          ))}
        </div>
        <div className="total-info">
          <span className="total-label">총액</span>
          <span className="total-value">{total}</span>
        </div>
        {error && <div className="error-message">{error}</div>}
        <Button
          type="submit"
          variant={side === 'BUY' ? 'buy' : 'sell'}
          className="order-button"
        >
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </Button>
        <div className="balance-info">
          <div className="balance-row">
            <span className="balance-label">사용 가능</span>
            <span className="balance-value">0.00</span>
          </div>
        </div>
      </form>
    </div>
  );
}
