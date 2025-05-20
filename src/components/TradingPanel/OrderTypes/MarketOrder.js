import React, { useState } from 'react';
import { validateQuantity } from '../../../utils/validation';
import Button from '../../common/Button';
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
          <Button
            type="button"
            variant="buy"
            className={side === 'BUY' ? 'active' : ''}
            onClick={() => setSide('BUY')}
          >
            매수
          </Button>
          <Button
            type="button"
            variant="sell"
            className={side === 'SELL' ? 'active' : ''}
            onClick={() => setSide('SELL')}
          >
            매도
          </Button>
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
        <Button type="submit" variant={side === 'BUY' ? 'buy' : 'sell'} className="submit-button">
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </Button>
      </form>
    </div>
  );
}
