import React, { useState, useEffect } from 'react';
import './TradingPanel.css';

const TradingPanel = ({ symbol, coin, price }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [orderType, setOrderType] = useState('limit');
  const [buyPrice, setBuyPrice] = useState(price.current.toString());
  const [buyAmount, setBuyAmount] = useState('');
  const [buyTotal, setBuyTotal] = useState('0');
  const [sellPrice, setSellPrice] = useState(price.current.toString());
  const [sellAmount, setSellAmount] = useState('');
  const [sellTotal, setSellTotal] = useState('0');
  const [userBalance, setUserBalance] = useState({
    KRW: 1000000, // 예시 잔고
    [symbol]: 0.5  // 예시 잔고
  });
  
  // 가격 변경 시 주문 가격 업데이트
  useEffect(() => {
    setBuyPrice(price.current.toString());
    setSellPrice(price.current.toString());
  }, [price]);
  
  // 구매 총액 계산
  useEffect(() => {
    if (buyPrice && buyAmount) {
      const total = parseFloat(buyPrice) * parseFloat(buyAmount);
      setBuyTotal(isNaN(total) ? '0' : total.toString());
    } else {
      setBuyTotal('0');
    }
  }, [buyPrice, buyAmount]);
  
  // 판매 총액 계산
  useEffect(() => {
    if (sellPrice && sellAmount) {
      const total = parseFloat(sellPrice) * parseFloat(sellAmount);
      setSellTotal(isNaN(total) ? '0' : total.toString());
    } else {
      setSellTotal('0');
    }
  }, [sellPrice, sellAmount]);
  
  // 가격 조정 함수
  const adjustPrice = (type, adjustment) => {
    if (type === 'buy') {
      const currentPrice = parseFloat(buyPrice) || price.current;
      setBuyPrice(Math.max(0, currentPrice + adjustment).toString());
    } else {
      const currentPrice = parseFloat(sellPrice) || price.current;
      setSellPrice(Math.max(0, currentPrice + adjustment).toString());
    }
  };
  
  // 주문 제출 함수
  const handleSubmitOrder = (type) => {
    // 실제로는 API 호출이 필요합니다
    if (type === 'buy') {
      if (!buyPrice || !buyAmount) {
        alert('가격과 수량을 입력해주세요.');
        return;
      }
      
      const total = parseFloat(buyTotal);
      if (total > userBalance.KRW) {
        alert('잔고가 부족합니다.');
        return;
      }
      
      alert(`매수 주문이 제출되었습니다. (${buyAmount} ${symbol} @ ${buyPrice} KRW)`);
      setBuyAmount('');
    } else {
      if (!sellPrice || !sellAmount) {
        alert('가격과 수량을 입력해주세요.');
        return;
      }
      
      const amount = parseFloat(sellAmount);
      if (amount > userBalance[symbol]) {
        alert('잔고가 부족합니다.');
        return;
      }
      
      alert(`매도 주문이 제출되었습니다. (${sellAmount} ${symbol} @ ${sellPrice} KRW)`);
      setSellAmount('');
    }
  };
  
  // 최대 수량 설정
  const setMaxAmount = (type) => {
    if (type === 'buy') {
      const price = parseFloat(buyPrice) || 0;
      if (price > 0) {
        const maxAmount = userBalance.KRW / price;
        setBuyAmount(maxAmount.toFixed(8));
      }
    } else {
      setSellAmount(userBalance[symbol].toString());
    }
  };
  
  return (
    <div className="trading-panel">
      <div className="trading-tabs">
        <div 
          className={`trading-tab ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          매수
        </div>
        <div 
          className={`trading-tab ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          매도
        </div>
      </div>
      
      {activeTab === 'buy' && (
        <div className="order-form">
          <div className="order-types">
            <div 
              className={`order-type ${orderType === 'limit' ? 'active' : ''}`}
              onClick={() => setOrderType('limit')}
            >
              지정가
            </div>
            <div 
              className={`order-type ${orderType === 'market' ? 'active' : ''}`}
              onClick={() => setOrderType('market')}
            >
              시장가
            </div>
            <div 
              className={`order-type ${orderType === 'reserve' ? 'active' : ''}`}
              onClick={() => setOrderType('reserve')}
            >
              예약
            </div>
          </div>
          
          <div className="form-group">
            <label>주문 가능</label>
            <div className="balance-info">
              <span>{userBalance.KRW.toLocaleString()} KRW</span>
              <span className="max-btn" onClick={() => setMaxAmount('buy')}>최대</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>가격 (KRW)</label>
            <input 
              type="text" 
              value={buyPrice} 
              onChange={(e) => setBuyPrice(e.target.value)}
              disabled={orderType === 'market'}
            />
            <div className="price-controls">
              <button className="price-control-btn" onClick={() => adjustPrice('buy', -1)}>-1</button>
              <button className="price-control-btn" onClick={() => adjustPrice('buy', -10)}>-10</button>
              <button className="price-control-btn" onClick={() => adjustPrice('buy', -100)}>-100</button>
              <button className="price-control-btn" onClick={() => adjustPrice('buy', 100)}>+100</button>
              <button className="price-control-btn" onClick={() => adjustPrice('buy', 10)}>+10</button>
              <button className="price-control-btn" onClick={() => adjustPrice('buy', 1)}>+1</button>
            </div>
          </div>
          
          <div className="form-group">
            <label>수량 ({symbol})</label>
            <input 
              type="text" 
              value={buyAmount} 
              onChange={(e) => setBuyAmount(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>총액 (KRW)</label>
            <input 
              type="text" 
              value={parseFloat(buyTotal).toLocaleString()} 
              readOnly 
              className="readonly-input"
            />
          </div>
          
          <button 
            className="submit-buy" 
            onClick={() => handleSubmitOrder('buy')}
          >
            매수
          </button>
        </div>
      )}
      
      {activeTab === 'sell' && (
        <div className="order-form">
          <div className="order-types">
            <div 
              className={`order-type ${orderType === 'limit' ? 'active' : ''}`}
              onClick={() => setOrderType('limit')}
            >
              지정가
            </div>
            <div 
              className={`order-type ${orderType === 'market' ? 'active' : ''}`}
              onClick={() => setOrderType('market')}
            >
              시장가
            </div>
            <div 
              className={`order-type ${orderType === 'reserve' ? 'active' : ''}`}
              onClick={() => setOrderType('reserve')}
            >
              예약
            </div>
          </div>
          
          <div className="form-group">
            <label>주문 가능</label>
            <div className="balance-info">
              <span>{userBalance[symbol]} {symbol}</span>
              <span className="max-btn" onClick={() => setMaxAmount('sell')}>최대</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>가격 (KRW)</label>
            <input 
              type="text" 
              value={sellPrice} 
              onChange={(e) => setSellPrice(e.target.value)}
              disabled={orderType === 'market'}
            />
            <div className="price-controls">
              <button className="price-control-btn" onClick={() => adjustPrice('sell', -1)}>-1</button>
              <button className="price-control-btn" onClick={() => adjustPrice('sell', -10)}>-10</button>
              <button className="price-control-btn" onClick={() => adjustPrice('sell', -100)}>-100</button>
              <button className="price-control-btn" onClick={() => adjustPrice('sell', 100)}>+100</button>
              <button className="price-control-btn" onClick={() => adjustPrice('sell', 10)}>+10</button>
              <button className="price-control-btn" onClick={() => adjustPrice('sell', 1)}>+1</button>
            </div>
          </div>
          
          <div className="form-group">
            <label>수량 ({symbol})</label>
            <input 
              type="text" 
              value={sellAmount} 
              onChange={(e) => setSellAmount(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>총액 (KRW)</label>
            <input 
              type="text" 
              value={parseFloat(sellTotal).toLocaleString()} 
              readOnly 
              className="readonly-input"
            />
          </div>
          
          <button 
            className="submit-sell" 
            onClick={() => handleSubmitOrder('sell')}
          >
            매도
          </button>
        </div>
      )}
    </div>
  );
};

export default TradingPanel;
