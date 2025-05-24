import React, { useState, useEffect } from 'react';
import { getRecentTrades } from '../../services/tradeService';
import './TradingHistory.css';

const TradingHistory = ({ symbol = 'BTC/USDT' }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecentTrades(symbol);
        setTrades(data);
      } catch (error) {
        console.error('Failed to fetch trades:', error);
        setError('Failed to load trading history');
        // 더미 데이터 모드에서는 에러를 표시하지 않음
        if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [symbol]);

  if (loading) {
    return <div className="trading-history-loading">Loading...</div>;
  }

  if (error) {
    return <div className="trading-history-error">{error}</div>;
  }

  return (
    <div className="trading-history">
      <h3>Trading History</h3>
      <div className="trading-history-table">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className={trade.type === 'BUY' ? 'buy' : 'sell'}>
                <td>{new Date(trade.timestamp).toLocaleTimeString()}</td>
                <td>{trade.price.toFixed(2)}</td>
                <td>{trade.amount.toFixed(4)}</td>
                <td>{(trade.price * trade.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradingHistory; 