import React from 'react';
import './CoinListItem.css';

const CoinListItem = ({ coin, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(coin);
    }
  };

  const changeClass = Number(coin.change) >= 0 ? 'positive' : 'negative';

  return (
    <div className="coin-item" onClick={handleClick}>
      <div className="coin-name">
        <span className="coin-symbol">{coin.symbol}</span>
        <span className="coin-market">{coin.name}</span>
      </div>
      <div className="coin-price">{Number(coin.price).toLocaleString()}</div>
      <div className={`coin-change ${changeClass}`}>{Number(coin.change).toFixed(2)}%</div>
    </div>
  );
};

export default CoinListItem;
