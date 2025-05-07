import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketContext } from '../context/MarketContext';
import Header from '../components/common/Header';
import TradingPanel from '../components/TradingView/TradingPanel';
import OrderBook from '../components/TradingView/OrderBook';
import SimpleChart from '../components/Chart/SimpleChart';
import './TradingPage.css';

const TradingPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { coins, setSelectedCoin, priceData } = useContext(MarketContext);
  const [activeTab, setActiveTab] = useState('trade');
  
  // 선택된 코인 찾기
  useEffect(() => {
    const coin = coins.find(c => c.symbol === symbol);
    if (coin) {
      setSelectedCoin(coin);
    } else if (coins.length > 0) {
      // 코인이 없으면 목록으로 리다이렉트
      navigate('/');
    }
  }, [symbol, coins, setSelectedCoin, navigate]);
  
  const coin = coins.find(c => c.symbol === symbol);
  
  if (!coin) {
    return <div className="loading">로딩 중...</div>;
  }
  
  // 가격 데이터를 가져옴 (없으면 코인의 기본 가격 사용)
  const price = priceData[symbol] || {
    current: coin.price,
    change: coin.change,
    high: coin.price * 1.01,
    low: coin.price * 0.99,
    volume: coin.volume
  };
  
  return (
    <div className="trading-page">
      <Header />
      
      <div className="coin-header">
        <div className="coin-info">
          <div className="coin-icon"></div>
          <span className="coin-name">{coin.name}</span>
          <span className="coin-symbol">({coin.symbol}/KRW)</span>
        </div>
        <div className="price-info">
          <span className="current-price">{price.current.toLocaleString()}</span>
          <span className={`price-change ${price.change >= 0 ? 'price-up' : 'price-down'}`}>
            {price.change >= 0 ? '▲' : '▼'} {Math.abs(price.change).toFixed(2)}%
          </span>
          <div className="exchange-info">
            KRAKEN {(price.current * 0.995).toLocaleString()} ($ {(price.current * 0.00072).toFixed(2)})
          </div>
        </div>
      </div>
      
      <div className="tab-menu">
        <div 
          className={`tab-item ${activeTab === 'trade' ? 'active' : ''}`}
          onClick={() => setActiveTab('trade')}
        >
          주문
        </div>
        <div 
          className={`tab-item ${activeTab === 'orderbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('orderbook')}
        >
          호가
        </div>
        <div 
          className={`tab-item ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => navigate(`/chart/${symbol}`)}
        >
          차트
        </div>
        <div 
          className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => navigate(`/history/${symbol}`)}
        >
          시세
        </div>
        <div 
          className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          정보
        </div>
      </div>
      
      <div className="container">
        {activeTab === 'trade' && (
          <div className="content-container">
            <SimpleChart symbol={symbol} />
            <TradingPanel symbol={symbol} coin={coin} price={price} />
          </div>
        )}
        
        {activeTab === 'orderbook' && <OrderBook symbol={symbol} />}
        
        {activeTab === 'info' && (
          <div className="info-panel">
            <h2>코인 정보</h2>
            <p>준비 중입니다...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPage;
