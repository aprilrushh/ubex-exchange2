import React, { useState, useEffect } from 'react';
import './TradeHistory.css';
import websocketService from '../../services/websocketService';
import { getRecentTrades } from '../../services/tradeService';
import { useAuth } from '../../contexts/AuthContext';

const TradeHistory = ({ symbol }) => {
  const [trades, setTrades] = useState([]);
  const [viewOption, setViewOption] = useState('all'); // all, buy, sell
  const [timeOption, setTimeOption] = useState('today'); // today, week, month

  
  // 거래 내역 데이터 가져오기
  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      try {
        const initial = await getRecentTrades(symbol);
        if (Array.isArray(initial)) {
          setTrades(initial);
        }
      } catch (err) {
        console.error('Failed to fetch trades:', err);
      }

      const handleUpdate = (trade) => {
        if (!trade || trade.symbol !== symbol) return;
        setTrades(prev => [trade, ...prev].slice(0, 50));
      };

      websocketService.on('trade-update', handleUpdate);
      websocketService.emit('subscribe', { channel: `trade-${symbol}` });

      unsubscribe = () => {
        websocketService.off('trade-update', handleUpdate);
        websocketService.emit('unsubscribe', { channel: `trade-${symbol}` });
      };
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
            filteredTrades.map((trade) => {
              const isUserTrade =
                authState.user && (trade.buyerId === authState.user.id || trade.sellerId === authState.user.id);
              return (
                <div className={`trade-row ${isUserTrade ? 'user-trade' : ''}`} key={trade.id}>
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
              );
            })
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
