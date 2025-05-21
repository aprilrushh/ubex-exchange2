import React, { useState, useEffect } from 'react';
import './OrderBook.css';
import DepthChart from './DepthChart';
import webSocketService from '../../services/websocketService';

const OrderBook = ({ data, symbol, onPriceSelect }) => {
  const [orderBookData, setOrderBookData] = useState({
    asks: [], // 매도 주문
    bids: [], // 매수 주문
  });
  const [depthView, setDepthView] = useState('0.1%'); // 호가 간격
  const [grouping, setGrouping] = useState(true); // 호가 그룹핑 여부
  
  // 방어 코드: 데이터 유효성 검사
  const validateOrderBookData = (book) => {
    if (!book || !book.asks || !book.bids) {
      return { asks: [], bids: [] };
    }
    return {
      asks: book.asks.map(ask => ({
        price: parseFloat(ask.price) || 0,
        amount: parseFloat(ask.quantity) || 0,
        total: (parseFloat(ask.price) * parseFloat(ask.quantity)) || 0,
        sum: 0 // 누적 합계는 나중에 계산
      })),
      bids: book.bids.map(bid => ({
        price: parseFloat(bid.price) || 0,
        amount: parseFloat(bid.quantity) || 0,
        total: (parseFloat(bid.price) * parseFloat(bid.quantity)) || 0,
        sum: 0 // 누적 합계는 나중에 계산
      }))
    };
  };

  // 누적 합계 계산
  const calculateSums = (orders) => {
    let sum = 0;
    return orders.map(order => {
      sum += order.total;
      return { ...order, sum };
    });
  };
  
  // WebSocket을 통해 호가 데이터 구독
  useEffect(() => {
    // 외부에서 데이터가 직접 전달되는 경우 우선 반영
    if (data) {
      const validatedData = validateOrderBookData(data);
      validatedData.asks = calculateSums(validatedData.asks);
      validatedData.bids = calculateSums(validatedData.bids);
      setOrderBookData(validatedData);
    }

    const handleUpdate = (payload) => {
      if (!payload || payload.symbol !== symbol) return;
      const validated = validateOrderBookData(payload);
      validated.asks = calculateSums(validated.asks);
      validated.bids = calculateSums(validated.bids);
      setOrderBookData(validated);
    };

    webSocketService.on('orderbook-update', handleUpdate);
    webSocketService.emit('subscribe', { channel: `market-${symbol}` });

    return () => {
      webSocketService.off('orderbook-update', handleUpdate);
      webSocketService.emit('unsubscribe', { channel: `market-${symbol}` });
    };
  }, [data, symbol]);
  
  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    if (price >= 10000) {
      return parseFloat(price).toLocaleString('ko-KR', { maximumFractionDigits: 1 });
    } else if (price >= 100) {
      return parseFloat(price).toLocaleString('ko-KR', { maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return parseFloat(price).toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    } else {
      return parseFloat(price).toLocaleString('ko-KR', { maximumFractionDigits: 6 });
    }
  };
  
  // 심볼별 가격 색상 설정
  const getPriceColor = (price, index, isAsk) => {
    if (index === 0) {
      return isAsk ? 'price-lowest-ask' : 'price-highest-bid';
    }
    return isAsk ? 'price-ask' : 'price-bid';
  };
  
  // 거래량 시각화 너비 계산 (최대 80%)
  const getVolumeWidth = (sum, isAsk) => {
    const maxSum = isAsk 
      ? parseFloat(orderBookData.asks[orderBookData.asks.length - 1]?.sum || 0)
      : parseFloat(orderBookData.bids[orderBookData.bids.length - 1]?.sum || 0);
    
    const percentage = maxSum > 0 ? (parseFloat(sum) / maxSum) * 80 : 0;
    return `${percentage}%`;
  };
  
  return (
    <div className="orderbook-container">
      <div className="orderbook-header">
        <div className="orderbook-title">호가창</div>
        <div className="orderbook-controls">
          <div className="depth-selector">
            <select 
              value={depthView} 
              onChange={(e) => setDepthView(e.target.value)}
            >
              <option value="0.1%">0.1%</option>
              <option value="0.5%">0.5%</option>
              <option value="1%">1%</option>
              <option value="5%">5%</option>
            </select>
          </div>
          <button 
            className={`grouping-toggle ${grouping ? 'active' : ''}`}
            onClick={() => setGrouping(!grouping)}
          >
            그룹
          </button>
        </div>
      </div>
      
      <div className="orderbook-table-container">
        {/* 매도 주문 테이블 */}
        <div className="orderbook-table asks">
          <div className="orderbook-table-header">
            <div className="col price">가격</div>
            <div className="col amount">수량</div>
            <div className="col total">총액</div>
          </div>
          <div className="orderbook-table-body">
            {orderBookData.asks.map((ask, index) => (
              <div className="orderbook-row" key={`ask-${index}`}>
                <div
                  className={`col price ${getPriceColor(ask.price, index, true)}`}
                  onClick={() => onPriceSelect && onPriceSelect(parseFloat(ask.price))}
                >
                  {formatPrice(ask.price)}
                </div>
                <div className="col amount">{parseFloat(ask.amount).toFixed(6)}</div>
                <div className="col total">{parseFloat(ask.total).toLocaleString()}</div>
                <div 
                  className="volume-indicator ask" 
                  style={{ width: getVolumeWidth(ask.sum, true) }}
                ></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 중간 가격 표시 */}
        <div className="center-price">
          {orderBookData.bids.length > 0 && (
            <>
              <span className="current-price">
                {formatPrice(orderBookData.bids[0].price)}
              </span>
              <span className="price-currency">USDT</span>
            </>
          )}
        </div>
        
        {/* 매수 주문 테이블 */}
        <div className="orderbook-table bids">
          <div className="orderbook-table-header">
            <div className="col price">가격</div>
            <div className="col amount">수량</div>
            <div className="col total">총액</div>
          </div>
          <div className="orderbook-table-body">
            {orderBookData.bids.map((bid, index) => (
              <div className="orderbook-row" key={`bid-${index}`}>
                <div
                  className={`col price ${getPriceColor(bid.price, index, false)}`}
                  onClick={() => onPriceSelect && onPriceSelect(parseFloat(bid.price))}
                >
                  {formatPrice(bid.price)}
                </div>
                <div className="col amount">{parseFloat(bid.amount).toFixed(6)}</div>
                <div className="col total">{parseFloat(bid.total).toLocaleString()}</div>
                <div 
                  className="volume-indicator bid" 
                  style={{ width: getVolumeWidth(bid.sum, false) }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DepthChart symbol={symbol} />
    </div>
  );
};

export default OrderBook;
