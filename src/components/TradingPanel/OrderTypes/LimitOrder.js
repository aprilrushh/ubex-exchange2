import React, { useState } from 'react';
import { validateQuantity, validatePrice } from '../../../utils/validation';
import '../../OrderForm/OrderForm.css';

export default function LimitOrder({ symbol, onSubmit }) {
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      const quantityNum = parseFloat(quantity);
      const priceNum = parseFloat(price);
      validateQuantity(symbol, quantityNum);
      validatePrice(symbol, priceNum);
      if (onSubmit) {
        onSubmit({ type: 'LIMIT', side, symbol, quantity: quantityNum, price: priceNum });
      }
      setQuantity('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="order-form">
      <form onSubmit={handleSubmit}>
        <div className="order-side-selector">
          <button
            type="button"
            className={`buy ${side === 'BUY' ? 'active' : ''}`}
            onClick={() => setSide('BUY')}
          >
            매수
          </button>
          <button
            type="button"
            className={`sell ${side === 'SELL' ? 'active' : ''}`}
            onClick={() => setSide('SELL')}
          >
            매도
          </button>
        </div>
        <div className="form-group">
          <label>수량</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="주문 수량"
            step="any"
            required
          />
        </div>
        <div className="form-group">
          <label>가격</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="주문 가격"
            step="any"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="submit-button">
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </button>
      </form>
    </div>
  );
}
