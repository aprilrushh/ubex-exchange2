import React, { useState } from 'react';
import './CoinItem.css';

const CoinItem = ({ coin, onClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleStarClick = (e) => {
    e.stopPropagation(); // 클릭 이벤트가 상위 요소로 전파되지 않도록 함
    setIsFavorite(!isFavorite);
    
    // 로컬 스토리지에 즐겨찾기 상태 저장
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    if (!isFavorite) {
      favorites[coin.symbol] = true;
    } else {
      delete favorites[coin.symbol];
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };
  
  // 천 단위 구분 기호로 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString();
  };
  
  // 퍼센트 변화율 포맷팅
  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };
  
  return (
    <tr onClick={onClick}>
      <td>
        <div className="coin-name">
          <span 
            className={`star-icon ${isFavorite ? 'favorite' : ''}`}
            onClick={handleStarClick}
          >
            ★
          </span>
          <div className="coin-icon"></div>
          <div>
            <span className="coin-symbol">{coin.symbol}</span>
            <span className="coin-fullname">{coin.name}</span>
          </div>
        </div>
      </td>
      <td>{formatPrice(coin.price)}</td>
      <td className={coin.change >= 0 ? "price-up" : "price-down"}>
        {formatChange(coin.change)}
      </td>
      <td>{coin.volume}백만</td>
    </tr>
  );
};

export default CoinItem;
