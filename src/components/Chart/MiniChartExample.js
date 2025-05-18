import React from 'react';
import MiniChart from './MiniChart';

/**
 * 미니 차트 사용 예시 컴포넌트
 * 
 * 업비트 스타일의 상단 헤더에 사용됩니다.
 */
const CoinHeader = () => {
  // 실제 사용 시에는 context에서 데이터를 가져오거나 props로 전달받습니다
  const symbolData = {
    symbol: 'BTC/KRW',
    currentPrice: 144082000,
    priceChangePercent: 0.25,
    priceChange: 362000,
  };

  return (
    <div className="coin-header">
      <div className="coin-info">
        <div className="coin-symbol">
          {symbolData.symbol} ▼ {/* 드롭다운 표시 */}
        </div>
      </div>
      
      <div className="coin-price">
        <span className="current-price">
          {new Intl.NumberFormat('ko-KR').format(symbolData.currentPrice)}
        </span>
        
        {/* 가격 변동 */}
        <div className={`price-change ${symbolData.priceChangePercent >= 0 ? 'up' : 'down'}`}>
          <span className="percent">
            {symbolData.priceChangePercent >= 0 ? '+' : ''}
            {symbolData.priceChangePercent}%
          </span>
          <span className="change">
            {symbolData.priceChangePercent >= 0 ? '▲' : '▼'}
            {new Intl.NumberFormat('ko-KR').format(Math.abs(symbolData.priceChange))}
          </span>
        </div>
      </div>
      
      {/* 미니 차트 */}
      <div className="chart-preview">
        <MiniChart 
          symbol={symbolData.symbol}
          priceChangePercent={symbolData.priceChangePercent}
          width={100} 
          height={40} 
        />
      </div>
    </div>
  );
};

export default CoinHeader;