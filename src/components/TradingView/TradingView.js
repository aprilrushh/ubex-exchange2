import React, { useState, useEffect } from 'react';
import SimpleChart from '../Chart/SimpleChart';
import OrderBook from '../OrderBook/OrderBook';
import TradingPanel from '../TradingPanel/TradingPanel';
import TradeHistory from '../TradeHistory/TradeHistory';
import './TradingView.css';

const TradingView = () => {
  const [activeSymbol, setActiveSymbol] = useState('BTC/USDT');
  const [symbols, setSymbols] = useState([
    { symbol: 'BTC/USDT', name: '비트코인', price: 67890.50, change: 2.34 },
    { symbol: 'ETH/USDT', name: '이더리움', price: 3456.78, change: -0.85 },
    { symbol: 'XRP/USDT', name: '리플', price: 0.5432, change: 1.23 },
    { symbol: 'SOL/USDT', name: '솔라나', price: 123.45, change: 5.67 },
    { symbol: 'ADA/USDT', name: '에이다', price: 0.4321, change: -1.45 },
  ]);
  const [marketInfo, setMarketInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [timeframe, setTimeframe] = useState('1d');
  const [indicators, setIndicators] = useState({
    ma5: false,
    ma10: false,
    ma20: false,
    ma60: false,
    ma120: false
  });
  
  // 선택된 심볼에 대한 시장 정보 가져오기
  useEffect(() => {
    const selectedCoin = symbols.find(s => s.symbol === activeSymbol);
    if (selectedCoin) {
      setMarketInfo(selectedCoin);
    }
    
    // 여기서 실제로는 API에서 선택된 심볼의 최신 시장 데이터를 가져와야 함
    // const fetchMarketInfo = async () => {
    //   try {
    //     const response = await fetch(`/api/market/${activeSymbol}`);
    //     const data = await response.json();
    //     setMarketInfo(data);
    //   } catch (error) {
    //     console.error('시장 데이터 가져오기 오류:', error);
    //   }
    // };
    // fetchMarketInfo();
    
    // 주기적으로 데이터 업데이트
    // const interval = setInterval(fetchMarketInfo, 5000);
    // return () => clearInterval(interval);
  }, [activeSymbol, symbols]);
  
  const handleSymbolChange = (symbol) => {
    setActiveSymbol(symbol);
  };
  
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  const handleIndicatorChange = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };
  
  const formatPrice = (price) => {
    if (price >= 1000) {
      return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
      return price.toLocaleString('ko-KR', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
    }
  };
  
  return (
    <div className="trading-view-container">
      <div className="trading-header">
        <div className="market-info">
          {marketInfo && (
            <>
              <div className="coin-name">
                <span className="symbol">{marketInfo.symbol}</span>
                <span className="name">{marketInfo.name}</span>
              </div>
              <div className="price-info">
                <span className="current-price">{formatPrice(marketInfo.price)}</span>
                <span className={`price-change ${marketInfo.change >= 0 ? 'positive' : 'negative'}`}>
                  {marketInfo.change >= 0 ? '+' : ''}{marketInfo.change}%
                </span>
              </div>
            </>
          )}
        </div>
        <div className="symbol-selector">
          <select value={activeSymbol} onChange={(e) => handleSymbolChange(e.target.value)}>
            {symbols.map((coin) => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.symbol} ({coin.name})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="trading-tabs">
        <div 
          className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          차트
        </div>
        <div 
          className={`tab ${activeTab === 'orderbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('orderbook')}
        >
          호가
        </div>
        <div 
          className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('trades')}
        >
          체결
        </div>
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          정보
        </div>
      </div>
      
      <div className="trading-content">
        {activeTab === 'chart' && (
          <div className="chart-panel">
            <div className="timeframe-selector">
              <button 
                className={`timeframe-btn ${timeframe === '1m' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('1m')}
              >
                1m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '5m' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('5m')}
              >
                5m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '15m' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('15m')}
              >
                15m
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1h' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('1h')}
              >
                1h
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '4h' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('4h')}
              >
                4h
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1d' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('1d')}
              >
                1d
              </button>
              <button 
                className={`timeframe-btn ${timeframe === '1w' ? 'active' : ''}`}
                onClick={() => handleTimeframeChange('1w')}
              >
                1w
              </button>
            </div>
            <div className="trading-view-layout">
              <div className="chart-container">
                <SimpleChart 
                  symbol={activeSymbol}
                  indicators={indicators}
                  timeframe={timeframe}
                />
                <div className="indicator-selector">
                  <div className="indicator-group">
                    <input 
                      type="checkbox" 
                      id="ma5" 
                      checked={indicators.ma5}
                      onChange={() => handleIndicatorChange('ma5')}
                    />
                    <label htmlFor="ma5">MA 5</label>
                  </div>
                  <div className="indicator-group">
                    <input 
                      type="checkbox" 
                      id="ma10" 
                      checked={indicators.ma10}
                      onChange={() => handleIndicatorChange('ma10')}
                    />
                    <label htmlFor="ma10">MA 10</label>
                  </div>
                  <div className="indicator-group">
                    <input 
                      type="checkbox" 
                      id="ma20" 
                      checked={indicators.ma20}
                      onChange={() => handleIndicatorChange('ma20')}
                    />
                    <label htmlFor="ma20">MA 20</label>
                  </div>
                  <div className="indicator-group">
                    <input 
                      type="checkbox" 
                      id="ma60" 
                      checked={indicators.ma60}
                      onChange={() => handleIndicatorChange('ma60')}
                    />
                    <label htmlFor="ma60">MA 60</label>
                  </div>
                  <div className="indicator-group">
                    <input 
                      type="checkbox" 
                      id="ma120" 
                      checked={indicators.ma120}
                      onChange={() => handleIndicatorChange('ma120')}
                    />
                    <label htmlFor="ma120">MA 120</label>
                  </div>
                </div>
              </div>
              <div className="sidebar">
                <TradingPanel symbol={activeSymbol} />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'orderbook' && (
          <div className="orderbook-trade-layout">
            <div className="orderbook-container">
              <OrderBook symbol={activeSymbol} />
            </div>
            <div className="tradepanel-container">
              <TradingPanel symbol={activeSymbol} />
            </div>
          </div>
        )}
        
        {activeTab === 'trades' && (
          <div className="trades-panel">
            <TradeHistory symbol={activeSymbol} />
          </div>
        )}
        
        {activeTab === 'info' && (
          <div className="info-panel">
            <div className="info-content">
              <h2>{marketInfo?.name} ({marketInfo?.symbol}) 정보</h2>
              <p>이 섹션에서는 코인에 대한 상세 정보가 표시될 예정입니다.</p>
              <p>다음과 같은 정보가 포함될 예정입니다:</p>
              <ul>
                <li>코인 개요 및 특징</li>
                <li>개발 팀 정보</li>
                <li>로드맵 및 주요 이벤트</li>
                <li>기술적 분석 및 전망</li>
                <li>관련 뉴스 및 업데이트</li>
              </ul>
              <p>추후 업데이트에서 구현될 예정입니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingView;