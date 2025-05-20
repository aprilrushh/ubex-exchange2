import React, { useState } from 'react';
import { validateQuantity } from '../../../utils/validation';
import '../../OrderForm/OrderForm.css';

export default function MarketOrder({ symbol, onSubmit }) {
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      const quantityNum = parseFloat(quantity);
      validateQuantity(symbol, quantityNum);
      if (onSubmit) {
        onSubmit({ type: 'MARKET', side, symbol, quantity: quantityNum });
      }
      setQuantity('');
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
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="submit-button">
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </button>
      </form>
    </div>
  );
}
