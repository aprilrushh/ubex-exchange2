import React, { useState } from 'react';

const OrderForm = ({ onSubmit }) => {
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type: orderType,
      side,
      price: parseFloat(price),
      amount: parseFloat(amount)
    });
  };

  return (
    <div className="order-form">
      <h3>Place Order</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Order Type:</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
            <option value="limit">Limit</option>
            <option value="market">Market</option>
          </select>
        </div>

        <div className="form-group">
          <label>Side:</label>
          <select value={side} onChange={(e) => setSide(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        {orderType === 'limit' && (
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.00000001"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.00000001"
            required
          />
        </div>

        <button type="submit" className={`submit-button ${side}`}>
          {side === 'buy' ? 'Buy' : 'Sell'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm; 