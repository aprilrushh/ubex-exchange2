import React, { useState, useEffect } from 'react';
import './TradingHistory.css';

const TradeHistory = ({ symbol }) => {
  const [trades, setTrades] = useState([]);
  const [viewOption, setViewOption] = useState('all'); // all, buy, sell
  const [timeOption, setTimeOption] = useState('today'); // today, week, month

  // 거래 내역 샘플 데이터 생성
  const generateTradeHistory = (symbol) => {
    const now = new Date();
    const tradeCount = 30;
    const result = [];
    
    // 중심가격 설정 (BTC/USDT는 약 67000, ETH/USDT는 약 3500 등)
    let centerPrice;
    if (symbol.startsWith('BTC')) {
      centerPrice = 67500;
    } else if (symbol.startsWith('ETH')) {
      centerPrice = 3500;
    } else if (symbol.startsWith('XRP')) {
      centerPrice = 0.55;
    } else if (symbol.startsWith('SOL')) {
      centerPrice = 125;
    } else if (symbol.startsWith('ADA')) {
      centerPrice = 0.43;
    } else {
      centerPrice = 100;
    }
    
    // 소수점 자릿수 설정 (BTC는 1, ETH는 2, 기타 코인은 더 자세히)
    let pricePrecision;
    if (symbol.startsWith('BTC')) {
      pricePrecision = 1;
    } else if (symbol.startsWith('ETH')) {
      pricePrecision = 2;
    } else if (centerPrice < 1) {
      pricePrecision = 6;
    } else if (centerPrice < 10) {
      pricePrecision = 4;
    } else {
      pricePrecision = 2;
    }
    
    const getPriceVariation = () => {
      return (Math.random() * 200 - 100) / Math.pow(10, pricePrecision);
    };
    
    for (let i = 0; i < tradeCount; i++) {
      // 최근 거래일수록 더 최근 시간으로 설정
      const timeDiff = Math.floor(Math.random() * (i + 1) * 5000) + 1000;
      const timestamp = new Date(now.getTime() - timeDiff);
      
      // 매수/매도 랜덤 결정
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      
      // 가격과 수량 설정 (매수/매도에 따라 약간 다르게)
      const price = (centerPrice + getPriceVariation()).toFixed(pricePrecision);
      const amount = (Math.random() * (type === 'buy' ? 0.5 : 0.3) + 0.01).toFixed(6);
      
      result.push({
        id: `trade-${i}-${Date.now()}`,
        timestamp,
        type,
        price,
        amount,
        total: (parseFloat(price) * parseFloat(amount)).toFixed(2),
        symbol
      });
    }
    
    // 시간순 정렬 (최신 거래가 위로)
    return result.sort((a, b) => b.timestamp - a.timestamp);
  };
  
  // 거래 내역 데이터 가져오기
  useEffect(() => {
    // 실제로는 API 호출
    // const fetchTradeHistory = async () => {
    //   try {
    //     const response = await fetch(`/api/trades/${symbol}`);
    //     const data = await response.json();
    //     setTrades(data);
    //   } catch (error) {
    //     console.error('거래 내역 가져오기 오류:', error);
    //   }
    // };
    
    // 테스트 데이터 생성
    const newTrades = generateTradeHistory(symbol);
    setTrades(newTrades);
    
    // 실시간 거래 시뮬레이션 (5초마다 새 거래 추가)
    const interval = setInterval(() => {
      setTrades(prevTrades => {
        // 새 거래 생성
        const now = new Date();
        const [baseCurrency, quoteCurrency] = symbol.split('/');
        
        // 랜덤 가격 생성
        let price;
        if (baseCurrency === 'BTC') {
          price = (67500 + (Math.random() * 100 - 50)).toFixed(1);
        } else if (baseCurrency === 'ETH') {
          price = (3500 + (Math.random() * 10 - 5)).toFixed(2);
        } else if (baseCurrency === 'XRP') {
          price = (0.55 + (Math.random() * 0.02 - 0.01)).toFixed(6);
        } else if (baseCurrency === 'SOL') {
          price = (125 + (Math.random() * 2 - 1)).toFixed(2);
        } else if (baseCurrency === 'ADA') {
          price = (0.43 + (Math.random() * 0.01 - 0.005)).toFixed(6);
        } else {
          price = (100 + (Math.random() * 5 - 2.5)).toFixed(2);
        }
        
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = (Math.random() * 0.5 + 0.01).toFixed(6);
        
        const newTrade = {
          id: `trade-new-${Date.now()}`,
          timestamp: now,
          type,
          price,
          amount,
          total: (parseFloat(price) * parseFloat(amount)).toFixed(2),
          symbol
        };
        
        return [newTrade, ...prevTrades.slice(0, 29)];
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  // 필터링된 거래 내역
  const filteredTrades = trades.filter(trade => {
    // 매수/매도 필터
    if (viewOption === 'buy' && trade.type !== 'buy') return false;
    if (viewOption === 'sell' && trade.type !== 'sell') return false;
    
    // 시간 필터
    const now = new Date();
    const tradeDate = new Date(trade.timestamp);
    
    if (timeOption === 'today') {
      return tradeDate.getDate() === now.getDate() &&
        tradeDate.getMonth() === now.getMonth() &&
        tradeDate.getFullYear() === now.getFullYear();
    }
    
    if (timeOption === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return tradeDate >= oneWeekAgo;
    }
    
    if (timeOption === 'month') {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return tradeDate >= oneMonthAgo;
    }
    
    return true;
  });
  
  // 시간 포맷팅 함수
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // 1분 이내
    if (diffSeconds < 60) {
      return `${diffSeconds}초 전`;
    }
    
    // 1시간 이내
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }
    
    // 오늘 이내
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `${diffHours}시간 전`;
    }
    
    // 일반 날짜 형식
    return date.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="trade-history-container">
      <div className="trade-history-header">
        <div className="trade-history-title">체결 내역</div>
        <div className="trade-history-filters">
          <div className="filter-group">
            <button
              className={`filter-btn ${viewOption === 'all' ? 'active' : ''}`}
              onClick={() => setViewOption('all')}
            >
              전체
            </button>
            <button
              className={`filter-btn ${viewOption === 'buy' ? 'active buy' : ''}`}
              onClick={() => setViewOption('buy')}
            >
              매수
            </button>
            <button
              className={`filter-btn ${viewOption === 'sell' ? 'active sell' : ''}`}
              onClick={() => setViewOption('sell')}
            >
              매도
            </button>
          </div>
          <div className="filter-group">
            <button
              className={`filter-btn ${timeOption === 'today' ? 'active' : ''}`}
              onClick={() => setTimeOption('today')}
            >
              오늘
            </button>
            <button
              className={`filter-btn ${timeOption === 'week' ? 'active' : ''}`}
              onClick={() => setTimeOption('week')}
            >
              1주일
            </button>
            <button
              className={`filter-btn ${timeOption === 'month' ? 'active' : ''}`}
              onClick={() => setTimeOption('month')}
            >
              1개월
            </button>
          </div>
        </div>
      </div>
      
      <div className="trade-history-table">
        <div className="trade-history-table-header">
          <div className="col time">시간</div>
          <div className="col price">가격</div>
          <div className="col amount">수량</div>
          <div className="col total">총액</div>
        </div>
        <div className="trade-history-table-body">
          {filteredTrades.length > 0 ? (
            filteredTrades.map((trade) => (
              <div className="trade-row" key={trade.id}>
                <div className="col time">{formatTime(trade.timestamp)}</div>
                <div className={`col price ${trade.type === 'buy' ? 'buy-text' : 'sell-text'}`}>
                  {parseFloat(trade.price).toLocaleString('ko-KR', { 
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 8
                  })}
                </div>
                <div className="col amount">
                  {parseFloat(trade.amount).toLocaleString('ko-KR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8
                  })}
                </div>
                <div className="col total">
                  {parseFloat(trade.total).toLocaleString('ko-KR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="no-trades">
              <p>거래 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;