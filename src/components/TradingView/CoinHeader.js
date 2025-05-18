import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import MiniChart from '../Chart/MiniChart';
import { MarketContext } from '../../context/MarketContext';
import './CoinHeader.css';

/**
 * 업비트 스타일의 코인 헤더 컴포넌트
 * 
 * 현재 선택된 코인 정보, 가격, 변동률, 미니 차트 표시
 * 해외 거래소 가격 비교 기능 포함
 */
const CoinHeader = () => {
  // MarketContext에서 데이터 가져오기
  const { selectedCoin, marketData, exchangeInfo } = useContext(MarketContext);
  
  if (!selectedCoin || !marketData) {
    return <div className="coin-header-loading">로딩 중...</div>;
  }
  
  const {
    symbol,
    name,
    currentPrice,
    priceChangePercent,
    priceChange,
    volume24h,
  } = marketData;
  
  // 가격 포맷 함수
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };
  
  // 변동률 클래스 (상승/하락)
  const priceChangeClass = priceChangePercent >= 0 ? 'up' : 'down';
  
  return (
    <div className="coin-header">
      {/* 왼쪽: 뒤로가기 버튼 */}
      <Link to="/" className="back-button">
        <span className="arrow-left">&#10094;</span>
      </Link>
      
      {/* 중앙: 코인 정보 */}
      <div className="coin-info">
        <div className="coin-symbol-container">
          <span className="coin-symbol">{symbol} ▼</span>
        </div>
        
        {/* 가격 정보 */}
        <div className="coin-price-container">
          <div className="current-price">
            {formatPrice(currentPrice)}
          </div>
          
          <div className={`price-change ${priceChangeClass}`}>
            <span className="percent">
              {priceChangePercent >= 0 ? '+' : ''}
              {priceChangePercent.toFixed(2)}%
            </span>
            <span className="price-change-absolute">
              {priceChangePercent >= 0 ? '▲' : '▼'}
              {formatPrice(Math.abs(priceChange))}
            </span>
          </div>
        </div>
        
        {/* 미니 차트 */}
        <div className="mini-chart-wrapper">
          <MiniChart 
            symbol={symbol}
            priceChangePercent={priceChangePercent}
            width={120}
            height={46}
          />
        </div>
      </div>
      
      {/* 오른쪽: 공유 버튼 */}
      <div className="share-button">
        <span className="share-icon">&#8599;</span>
      </div>
      
      {/* 해외 거래소 가격 비교 */}
      <div className="exchange-comparison">
        {exchangeInfo && exchangeInfo.map((exchange, index) => (
          <div key={index} className="exchange-item">
            <span className="exchange-name">{exchange.name}</span>
            <span className="exchange-price">
              {exchange.price} ({exchange.currency})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinHeader;