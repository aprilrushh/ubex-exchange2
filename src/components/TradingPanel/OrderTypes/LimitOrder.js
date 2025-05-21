import React, { useState, useEffect } from 'react';
import { validateQuantity, validatePrice } from '../../../utils/validation';
import Button from '../../common/Button';
import '../../OrderForm/OrderForm.css';

export default function LimitOrder({ symbol, selectedPrice, onSubmit }) {
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPrice !== null && selectedPrice !== undefined) {
      setPrice(selectedPrice);
    }
  }, [selectedPrice]);

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
        <Button type="submit" variant={side === 'BUY' ? 'buy' : 'sell'} className="submit-button">
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </Button>
      </form>
    </div>
  );
}
