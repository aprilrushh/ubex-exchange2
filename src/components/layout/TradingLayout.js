// src/components/layout/TradingLayout.js
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './TradingLayout.css';

// 샘플 코인 데이터
const sampleCoins = [
  { symbol: 'BTC', name: '비트코인', price: 144200000, change: 0.33, volume: 200979 },
  { symbol: 'ETH', name: '이더리움', price: 2577000, change: -0.15, volume: 69997 },
  { symbol: 'XRP', name: '리플', price: 3011, change: -1.5, volume: 20556 },
  { symbol: 'LAYER', name: '슬레이어', price: 2629, change: 5.62, volume: 53213 },
  { symbol: 'KAITO', name: '카이토', price: 1904, change: 38.67, volume: 20497 },
  { symbol: 'STPT', name: '에스티피티', price: 111.6, change: 21.16, volume: 14263 },
  { symbol: 'MOVE', name: '무브먼트', price: 227.3, change: 0.26, volume: 10364 },
  { symbol: 'USDT', name: '테더', price: 1415, change: -0.32, volume: 79739 }
];

// 샘플 호가 데이터
const sampleOrderBook = {
  asks: [
    { price: 144205000, quantity: 0.005 },
    { price: 144210000, quantity: 0.008 },
    { price: 144215000, quantity: 0.012 },
    { price: 144220000, quantity: 0.003 },
    { price: 144225000, quantity: 0.015 }
  ],
  bids: [
    { price: 144200000, quantity: 0.007 },
    { price: 144195000, quantity: 0.010 },
    { price: 144190000, quantity: 0.005 },
    { price: 144185000, quantity: 0.020 },
    { price: 144180000, quantity: 0.008 }
  ]
};

const TradingLayout = () => {
  const chartContainerRef = useRef(null);
  const [selectedCoin, setSelectedCoin] = useState(sampleCoins[0]);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성
    const newChart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#10131a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e42' },
        horzLines: { color: '#2a2e42' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#2a2e42',
      },
      timeScale: {
        borderColor: '#2a2e42',
      },
    });

    // 캔들스틱 시리즈 추가
    const candlestickSeries = newChart.addCandlestickSeries({
      upColor: '#e0004e',
      downColor: '#0067a3',
      borderDownColor: '#0067a3',
      borderUpColor: '#e0004e',
      wickDownColor: '#0067a3',
      wickUpColor: '#e0004e',
    });

    // 샘플 차트 데이터
    const sampleData = generateSampleData();
    candlestickSeries.setData(sampleData);

    setChart(newChart);

    // 리사이즈 이벤트
    const handleResize = () => {
      newChart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      newChart.remove();
    };
  }, []);

  // 샘플 차트 데이터 생성 함수
  const generateSampleData = () => {
    const data = [];
    const baseTime = Date.now() / 1000 - 86400 * 30; // 30일 전
    let lastClose = 141000000;

    for (let i = 0; i < 30; i++) {
      const time = baseTime + i * 86400; // 하루 간격
      const volatility = Math.random() * 0.02 - 0.01; // ±1% 변동
      const open = lastClose;
      const close = open * (1 + volatility);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      
      data.push({
        time: time,
        open: open,
        high: high,
        low: low,
        close: close,
      });
      
      lastClose = close;
    }
    
    return data;
  };

  return (
    <div className="trading-layout">
      {/* 상단 네비게이션 바 */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="logo">
              <span className="logo-text">UPbit</span>
            </div>
            <nav className="nav-menu">
              <a href="#" className="nav-item active">거래소</a>
              <a href="#" className="nav-item">입출금</a>
              <a href="#" className="nav-item">투자내역</a>
              <a href="#" className="nav-item">코인동향</a>
              <a href="#" className="nav-item">서비스+</a>
              <a href="#" className="nav-item">공세센터</a>
              <a href="#" className="nav-item">NFT 거래소</a>
              <a href="#" className="nav-item">데이터랩</a>
            </nav>
          </div>
          <div className="navbar-right">
            <button className="login-btn">로그인</button>
            <button className="register-btn">회원가입</button>
            <button className="notification-btn">📢</button>
            <div className="language-selector">
              <span>KO</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 그리드 */}
      <main className="trading-grid">
        {/* 코인 리스트 (왼쪽) */}
        <section className="coin-list-section">
          <div className="coin-list-header">
            <div className="market-tabs">
              <button className="market-tab active">KRW</button>
              <button className="market-tab">BTC</button>
              <button className="market-tab">USDT</button>
            </div>
            <div className="coin-search">
              <input type="text" placeholder="코인/마켓 검색" />
            </div>
          </div>
          <div className="coin-list">
            <div className="coin-list-labels">
              <span>한글명</span>
              <span>현재가</span>
              <span>전일대비</span>
              <span>거래대금</span>
            </div>
            {sampleCoins.map((coin) => (
              <div 
                key={coin.symbol} 
                className={`coin-item ${selectedCoin.symbol === coin.symbol ? 'selected' : ''}`}
                onClick={() => setSelectedCoin(coin)}
              >
                <div className="coin-info">
                  <span className="star">★</span>
                  <div className="coin-details">
                    <span className="coin-symbol">{coin.symbol}</span>
                    <span className="coin-name">{coin.name}</span>
                  </div>
                </div>
                <div className="coin-price">
                  {coin.price.toLocaleString()}
                </div>
                <div className={`coin-change ${coin.change >= 0 ? 'positive' : 'negative'}`}>
                  {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                </div>
                <div className="coin-volume">
                  {coin.volume}백만
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 차트 영역 (중앙) */}
        <section className="chart-section">
          <div className="chart-header">
            <div className="coin-info">
              <div className="coin-name">
                <span className="coin-symbol">🟡</span>
                <span className="coin-text">{selectedCoin.name} </span>
                <span className="coin-pair">{selectedCoin.symbol}/KRW</span>
              </div>
              <div className="coin-price">
                <span className="current-price">{selectedCoin.price.toLocaleString()}</span>
                <span className="price-unit">KRW</span>
              </div>
              <div className="price-change">
                <span className={`price-change-value ${selectedCoin.change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedCoin.change >= 0 ? '+' : ''}{selectedCoin.change.toFixed(2)}% ▲ {Math.abs(selectedCoin.change * selectedCoin.price / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="chart-controls">
            <div className="chart-buttons">
              <button>📈</button>
              <button>📊</button>
              <button>➕</button>
              <button>30분 ▼</button>
              <button>차트설정 ▼</button>
              <button>지표 ▼</button>
              <button>초기화</button>
            </div>
          </div>
          <div className="chart-container" ref={chartContainerRef}>
            {/* 차트가 여기에 렌더링됩니다 */}
          </div>
        </section>

        {/* 우측 정보 영역 */}
        <section className="info-section">
          {/* 시세 정보 (상단) */}
          <div className="price-info">
            <div className="price-stats">
              <div className="info-tab active">시세</div>
              <div className="info-tab">정보</div>
            </div>
            <div className="price-grid">
              <div className="price-item">
                <span className="label">고가</span>
                <span className="value red">145,315,000</span>
              </div>
              <div className="price-item">
                <span className="label">저가</span>
                <span className="value blue">143,646,000</span>
              </div>
              <div className="price-item">
                <span className="label">거래량(24H)</span>
                <span className="value">915.886 BTC</span>
              </div>
              <div className="price-item">
                <span className="label">거래대금(24H)</span>
                <span className="value">132,247백만</span>
              </div>
            </div>
          </div>

          {/* 대표 거래소 가격 비교 */}
          <div className="exchange-prices">
            <div className="exchange-item">
              <span className="exchange-name">Coinbase</span>
              <span className="exchange-price">144,875,442</span>
              <span className="exchange-diff">($103,519.43)</span>
            </div>
            <div className="exchange-item">
              <span className="exchange-name">Bithumb</span>
              <span className="exchange-price">144,680,310</span>
              <span className="exchange-diff">($103,380.00)</span>
            </div>
            <div className="exchange-item">
              <span className="exchange-name">Kraken</span>
              <span className="exchange-price">144,820,260</span>
              <span className="exchange-diff">($103,480.00)</span>
            </div>
          </div>

          {/* 호가창 */}
          <div className="orderbook">
            <div className="orderbook-controls">
              <div className="view-toggle">
                <button className="orderbook-view active">호가와 차트</button>
                <button className="orderbook-view">호가만 보여주기</button>
              </div>
            </div>
            <div className="orderbook-content">
              <div className="orderbook-header">
                <span>수량</span>
                <span>호가</span>
                <span>누적</span>
              </div>
              
              {/* 매도 호가 */}
              <div className="asks">
                {sampleOrderBook.asks.map((ask, index) => (
                  <div key={`ask-${index}`} className="order-row ask">
                    <span className="quantity">{ask.quantity}</span>
                    <span className="price">{ask.price.toLocaleString()}</span>
                    <span className="total">{(ask.quantity * ask.price / 100000000).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* 현재가 */}
              <div className="current-price-row">
                <span className="current-price">{selectedCoin.price.toLocaleString()}</span>
              </div>
              
              {/* 매수 호가 */}
              <div className="bids">
                {sampleOrderBook.bids.map((bid, index) => (
                  <div key={`bid-${index}`} className="order-row bid">
                    <span className="quantity">{bid.quantity}</span>
                    <span className="price">{bid.price.toLocaleString()}</span>
                    <span className="total">{(bid.quantity * bid.price / 100000000).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 하단 거래 패널 */}
      <footer className="trading-panel">
        <div className="trading-tabs">
          <button className="trading-tab active">매수</button>
          <button className="trading-tab">매도</button>
          <button className="trading-tab">거래내역</button>
          <button className="trading-tab">간편주문</button>
          <button className="trading-tab">주문취소</button>
          <div className="account-balance">
            주문가능: 0 KRW
          </div>
        </div>
        <div className="trading-form">
          <div className="order-type">
            <button className="order-btn active">매수</button>
            <button className="order-btn">매도</button>
          </div>
          <div className="order-input">
            <div className="input-group">
              <label>주문가격</label>
              <input type="number" placeholder="0" />
              <span className="currency">KRW</span>
            </div>
            <div className="input-group">
              <label>주문수량</label>
              <input type="number" placeholder="0" />
              <span className="currency">BTC</span>
            </div>
            <div className="input-group">
              <label>총 주문금액</label>
              <input type="number" placeholder="0" />
              <span className="currency">KRW</span>
            </div>
          </div>
          <div className="order-buttons">
            <button className="quick-order">10%</button>
            <button className="quick-order">25%</button>
            <button className="quick-order">50%</button>
            <button className="quick-order">100%</button>
            <button className="cancel-orders">주문 전체취소</button>
            <button className="submit-order buy">매수</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TradingLayout;