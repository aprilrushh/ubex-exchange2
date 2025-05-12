import React from 'react';
import './CoinItem.css';

const CoinItem = ({ coin, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(coin);
    }
  };

  return (
    <tr onClick={handleClick} style={{ cursor: 'pointer' }}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>★</span>
          <div>
            <div>{coin.symbol}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{coin.name}</div>
          </div>
        </div>
      </td>
      <td>{coin.price}</td>
      <td className={coin.change >= 0 ? 'price-up' : 'price-down'}>
        {coin.change >= 0 ? '+' : ''}{coin.change}%
      </td>
      <td>{coin.volume}백만</td>
    </tr>
  );
};

export default CoinItem;
