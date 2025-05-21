import React, { useState, useEffect } from 'react';
import { validateQuantity, validatePrice } from '../../../utils/validation';
import Button from '../../common/Button';
import '../../OrderForm/OrderForm.css';
import { getAssetSummary } from '../../../services/PortfolioService';

export default function LimitOrder({ symbol, onSubmit }) {
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [takeProfit, setTakeProfit] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const summary = await getAssetSummary();
        if (summary && typeof summary.available === 'number') {
          setBalance(summary.available);
        }
      } catch (err) {
        console.error('Failed to fetch balance', err);
      }
    };
    fetchBalance();
  }, []);

  const handleMax = () => {
    const priceNum = parseFloat(price);
    if (!isNaN(priceNum) && priceNum > 0) {
      setQuantity((balance / priceNum).toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      const quantityNum = parseFloat(quantity);
      const priceNum = parseFloat(price);
      validateQuantity(symbol, quantityNum);
      validatePrice(symbol, priceNum);
      if (useStopLoss && stopLoss) {
        validatePrice(symbol, parseFloat(stopLoss));
      }
      if (useTakeProfit && takeProfit) {
        validatePrice(symbol, parseFloat(takeProfit));
      }
      if (onSubmit) {
        onSubmit({
          type: 'LIMIT',
          side,
          symbol,
          quantity: quantityNum,
          price: priceNum,
          stopLoss: useStopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: useTakeProfit ? parseFloat(takeProfit) : undefined,
        });
      }
      setQuantity('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
      setUseStopLoss(false);
      setUseTakeProfit(false);
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
          <div style={{ display: 'flex', gap: '5px' }}>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="주문 수량"
              step="any"
              required
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleMax}>MAX</button>
          </div>
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
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={useStopLoss}
              onChange={() => setUseStopLoss(!useStopLoss)}
            />
            {' '}스탑로스
          </label>
          {useStopLoss && (
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Stop-Loss 가격"
              step="any"
            />
          )}
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={useTakeProfit}
              onChange={() => setUseTakeProfit(!useTakeProfit)}
            />
            {' '}테이크프로핏
          </label>
          {useTakeProfit && (
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Take-Profit 가격"
              step="any"
            />
          )}
        </div>
        <div className="form-group">
          <span>사용 가능 잔고: {balance}</span>
        </div>
        {error && <div className="error-message">{error}</div>}
        <Button type="submit" variant={side === 'BUY' ? 'buy' : 'sell'} className="submit-button">
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </Button>
      </form>
    </div>
  );
}
