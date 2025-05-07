import React, { useState, useEffect } from 'react';
import './OrderBook.css';

const OrderBook = ({ symbol }) => {
  const [orderBookData, setOrderBookData] = useState({
    asks: [], // 매도 주문
    bids: [], // 매수 주문
  });
  const [depthView, setDepthView] = useState('0.1%'); // 호가 간격
  const [grouping, setGrouping] = useState(true); // 호가 그룹핑 여부
  
  // 샘플 호가 데이터 생성 함수
  const generateOrderBookData = (symbol) => {
    // 중심가격 설정 (BTC/USDT는 약 67000, ETH/USDT는 약 3500 등)
    let centerPrice;
    if (symbol.startsWith('BTC')) {
      centerPrice = 67500 + (Math.random() * 200 - 100);
    } else if (symbol.startsWith('ETH')) {
      centerPrice = 3500 + (Math.random() * 20 - 10);
    } else if (symbol.startsWith('XRP')) {
      centerPrice = 0.55 + (Math.random() * 0.02 - 0.01);
    } else if (symbol.startsWith('SOL')) {
      centerPrice = 125 + (Math.random() * 5 - 2.5);
    } else if (symbol.startsWith('ADA')) {
      centerPrice = 0.43 + (Math.random() * 0.01 - 0.005);
    } else {
      centerPrice = 100 + (Math.random() * 10 - 5);
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
    
    // 호가 간격 설정
    const priceStep = Math.pow(10, -pricePrecision) * Math.max(1, Math.floor(centerPrice / 10000));
    
    // 매도 주문(asks) 생성 (높은 가격 -> 낮은 가격 순)
    const asks = [];
    for (let i = 0; i < 15; i++) {
      const price = (centerPrice + priceStep * (i + 1)).toFixed(pricePrecision);
      const amount = (Math.random() * 2 + 0.1).toFixed(6);
      const total = (parseFloat(price) * parseFloat(amount)).toFixed(2);
      const sum = i === 0 ? total : (parseFloat(total) + parseFloat(asks[i-1].sum)).toFixed(2);
      
      asks.push({
        price,
        amount,
        total,
        sum
      });
    }
    
    // 매수 주문(bids) 생성 (높은 가격 -> 낮은 가격 순)
    const bids = [];
    for (let i = 0; i < 15; i++) {
      const price = (centerPrice - priceStep * i).toFixed(pricePrecision);
      const amount = (Math.random() * 2 + 0.1).toFixed(6);
      const total = (parseFloat(price) * parseFloat(amount)).toFixed(2);
      const sum = i === 0 ? total : (parseFloat(total) + parseFloat(bids[i-1].sum)).toFixed(2);
      
      bids.push({
        price,
        amount,
        total,
        sum
      });
    }
    
    return { asks, bids };
  };
  
  // API에서 호가 데이터 가져오기
  useEffect(() => {
    // 실제 앱에서는 API를 통해 호가 데이터를 가져옵니다
    // const fetchOrderBook = async () => {
    //   try {
    //     const response = await fetch(`/api/orderbook/${symbol}`);
    //     const data = await response.json();
    //     setOrderBookData(data);
    //   } catch (error) {
    //     console.error('호가 데이터 가져오기 오류:', error);
    //   }
    // };
    
    // 샘플 데이터 생성
    const data = generateOrderBookData(symbol);
    setOrderBookData(data);
    
    // 실시간 데이터 업데이트 (2초마다 갱신)
    const interval = setInterval(() => {
      const newData = generateOrderBookData(symbol);
      setOrderBookData(newData);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
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
                <div className={`col price ${getPriceColor(ask.price, index, true)}`}>
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
                <div className={`col price ${getPriceColor(bid.price, index, false)}`}>
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
    </div>
  );
};

export default OrderBook;