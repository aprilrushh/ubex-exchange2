import React, { useState, useEffect } from 'react';
import './TradingPanel.css';

const TradingPanel = ({ symbol }) => {
  // 거래 유형 (매수/매도)
  const [tradeType, setTradeType] = useState('buy');
  
  // 주문 유형 (지정가/시장가/예약)
  const [orderType, setOrderType] = useState('limit');
  
  // 매수/매도 입력값
  const [buyPrice, setBuyPrice] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [buyTotal, setBuyTotal] = useState(0);
  
  const [sellPrice, setSellPrice] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellTotal, setSellTotal] = useState(0);
  
  // 잔고 정보
  const [balance, setBalance] = useState({
    base: 0,    // 기준 화폐 (예: BTC, ETH 등)
    quote: 0    // 견적 화폐 (예: USDT)
  });
  
  // 심볼에서 기준 화폐와 견적 화폐 추출
  const [baseCurrency, quoteCurrency] = symbol.split('/');
  
  // 주문 비율 버튼 (잔고의 25%, 50%, 75%, 100%)
  const percentageButtons = [25, 50, 75, 100];
  
  // 샘플 잔고 데이터 설정
  useEffect(() => {
    // 실제로는 API에서 가져와야 함
    // baseCurrency에 따라 적절한 샘플 데이터 설정
    let baseAmount = 0;
    if (baseCurrency === 'BTC') {
      baseAmount = 0.12345;
    } else if (baseCurrency === 'ETH') {
      baseAmount = 5.4321;
    } else if (baseCurrency === 'XRP') {
      baseAmount = 10000;
    } else if (baseCurrency === 'SOL') {
      baseAmount = 125;
    } else if (baseCurrency === 'ADA') {
      baseAmount = 5000;
    } else {
      baseAmount = 1;
    }
    
    setBalance({
      base: baseAmount,
      quote: 50000, // USDT 잔고
    });
    
    // 심볼에 따른 기본 가격 설정
    if (baseCurrency === 'BTC') {
      setBuyPrice('67500');
      setSellPrice('67500');
    } else if (baseCurrency === 'ETH') {
      setBuyPrice('3450');
      setSellPrice('3450');
    } else if (baseCurrency === 'XRP') {
      setBuyPrice('0.55');
      setSellPrice('0.55');
    } else if (baseCurrency === 'SOL') {
      setBuyPrice('125');
      setSellPrice('125');
    } else if (baseCurrency === 'ADA') {
      setBuyPrice('0.43');
      setSellPrice('0.43');
    }
  }, [symbol, baseCurrency]);
  
  // 총액 계산
  useEffect(() => {
    const calcBuyTotal = parseFloat(buyPrice || 0) * parseFloat(buyAmount || 0);
    setBuyTotal(isNaN(calcBuyTotal) ? 0 : calcBuyTotal);
    
    const calcSellTotal = parseFloat(sellPrice || 0) * parseFloat(sellAmount || 0);
    setSellTotal(isNaN(calcSellTotal) ? 0 : calcSellTotal);
  }, [buyPrice, buyAmount, sellPrice, sellAmount]);
  
  // 가격 스텝 계산 (소수점 자릿수에 따라)
  const getPriceStep = () => {
    const price = parseFloat(tradeType === 'buy' ? buyPrice : sellPrice) || 0;
    if (price >= 10000) return 0.1;
    if (price >= 1000) return 0.01;
    if (price >= 100) return 0.001;
    if (price >= 10) return 0.0001;
    if (price >= 1) return 0.00001;
    return 0.000001;
  };
  
  // 수량 증감 처리
  const handlePriceChange = (step) => {
    const priceStep = step;
    
    if (tradeType === 'buy') {
      const currentPrice = parseFloat(buyPrice) || 0;
      setBuyPrice((currentPrice + priceStep).toFixed(getPriceDecimals()));
    } else {
      const currentPrice = parseFloat(sellPrice) || 0;
      setSellPrice((currentPrice + priceStep).toFixed(getPriceDecimals()));
    }
  };
  
  // 가격 소수점 자릿수 계산
  const getPriceDecimals = () => {
    const price = parseFloat(tradeType === 'buy' ? buyPrice : sellPrice) || 0;
    if (price >= 10000) return 1;
    if (price >= 1000) return 2;
    if (price >= 100) return 3;
    if (price >= 10) return 4;
    if (price >= 1) return 5;
    return 6;
  };
  
  // 수량 소수점 자릿수 계산
  const getAmountDecimals = () => {
    if (baseCurrency === 'BTC') return 8;
    if (baseCurrency === 'ETH') return 6;
    if (['XRP', 'ADA', 'SOL'].includes(baseCurrency)) return 2;
    return 8;
  };
  
  // 잔고 백분율 설정
  const handlePercentage = (percentage) => {
    if (tradeType === 'buy') {
      // 매수 시 견적 화폐(USDT) 기준
      const maxAmount = balance.quote / parseFloat(buyPrice || 1);
      const amount = (maxAmount * percentage / 100).toFixed(getAmountDecimals());
      setBuyAmount(amount);
    } else {
      // 매도 시 기준 화폐(BTC 등) 기준
      const amount = (balance.base * percentage / 100).toFixed(getAmountDecimals());
      setSellAmount(amount);
    }
  };
  
  // 주문 제출 처리
  const handleSubmitOrder = () => {
    if (tradeType === 'buy') {
      if (!buyPrice || !buyAmount) {
        alert('가격과 수량을 입력해주세요.');
        return;
      }
      
      // 실제로는 API 호출
      console.log('매수 주문:', {
        symbol,
        type: orderType,
        price: buyPrice,
        amount: buyAmount,
        total: buyTotal
      });
      
      alert(`${baseCurrency} ${buyAmount}개 매수 주문이 접수되었습니다.`);
      setBuyAmount('');
    } else {
      if (!sellPrice || !sellAmount) {
        alert('가격과 수량을 입력해주세요.');
        return;
      }
      
      // 실제로는 API 호출
      console.log('매도 주문:', {
        symbol,
        type: orderType,
        price: sellPrice,
        amount: sellAmount,
        total: sellTotal
      });
      
      alert(`${baseCurrency} ${sellAmount}개 매도 주문이 접수되었습니다.`);
      setSellAmount('');
    }
  };
  
  // 포맷팅 함수
  const formatBalance = (value, isCrypto = false) => {
    if (isCrypto) {
      // 암호화폐는 소수점 자릿수가 다양함
      if (baseCurrency === 'BTC') {
        return value.toFixed(8);
      } else if (baseCurrency === 'ETH') {
        return value.toFixed(6);
      } else if (baseCurrency === 'XRP' || baseCurrency === 'ADA' || baseCurrency === 'SOL') {
        return value.toFixed(2);
      }
      return value.toFixed(8);
    } else {
      // USDT 등 견적 화폐는 보통 2자리
      return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
    }
  };
  
  return (
    <div className="trading-panel">
      <div className="trading-panel-header">
        <div className="trading-tabs">
          <div
            className={`tab ${tradeType === 'buy' ? 'active buy' : ''}`}
            onClick={() => setTradeType('buy')}
          >
            매수
          </div>
          <div
            className={`tab ${tradeType === 'sell' ? 'active sell' : ''}`}
            onClick={() => setTradeType('sell')}
          >
            매도
          </div>
        </div>
        
        <div className="order-type-selector">
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
            className={`order-type ${orderType === 'stop' ? 'active' : ''}`}
            onClick={() => setOrderType('stop')}
          >
            예약
          </div>
        </div>
      </div>
      
      <div className="trading-panel-balance">
        <div className="balance-row">
          <div className="balance-label">보유 {baseCurrency}</div>
          <div className="balance-value">{formatBalance(balance.base, true)} {baseCurrency}</div>
        </div>
        <div className="balance-row">
          <div className="balance-label">보유 {quoteCurrency}</div>
          <div className="balance-value">{formatBalance(balance.quote)} {quoteCurrency}</div>
        </div>
      </div>
      
      <div className="trading-panel-content">
        {tradeType === 'buy' ? (
          <div className="buy-form">
            <div className="form-group">
              <label>가격 ({quoteCurrency})</label>
              <div className="price-input-container">
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder={`${quoteCurrency} 가격 입력`}
                  step={getPriceStep()}
                />
                <div className="price-controls">
                  <div className="price-control-row">
                    <button onClick={() => handlePriceChange(-1)}>-1</button>
                    <button onClick={() => handlePriceChange(-0.1)}>-0.1</button>
                    <button onClick={() => handlePriceChange(-0.01)}>-0.01</button>
                  </div>
                  <div className="price-control-row">
                    <button onClick={() => handlePriceChange(0.01)}>+0.01</button>
                    <button onClick={() => handlePriceChange(0.1)}>+0.1</button>
                    <button onClick={() => handlePriceChange(1)}>+1</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>수량 ({baseCurrency})</label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder={`${baseCurrency} 수량 입력`}
                step={Math.pow(10, -getAmountDecimals())}
              />
            </div>
            
            <div className="percentage-buttons">
              {percentageButtons.map((percent) => (
                <button 
                  key={percent} 
                  onClick={() => handlePercentage(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
            
            <div className="form-group">
              <label>총액 ({quoteCurrency})</label>
              <div className="total-amount">
                {buyTotal.toLocaleString('ko-KR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} {quoteCurrency}
              </div>
            </div>
            
            <button 
              className="submit-button buy" 
              onClick={handleSubmitOrder}
              disabled={!buyPrice || !buyAmount || parseFloat(buyAmount) <= 0}
            >
              {baseCurrency} 매수
            </button>
          </div>
        ) : (
          <div className="sell-form">
            <div className="form-group">
              <label>가격 ({quoteCurrency})</label>
              <div className="price-input-container">
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder={`${quoteCurrency} 가격 입력`}
                  step={getPriceStep()}
                />
                <div className="price-controls">
                  <div className="price-control-row">
                    <button onClick={() => handlePriceChange(-1)}>-1</button>
                    <button onClick={() => handlePriceChange(-0.1)}>-0.1</button>
                    <button onClick={() => handlePriceChange(-0.01)}>-0.01</button>
                  </div>
                  <div className="price-control-row">
                    <button onClick={() => handlePriceChange(0.01)}>+0.01</button>
                    <button onClick={() => handlePriceChange(0.1)}>+0.1</button>
                    <button onClick={() => handlePriceChange(1)}>+1</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>수량 ({baseCurrency})</label>
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder={`${baseCurrency} 수량 입력`}
                step={Math.pow(10, -getAmountDecimals())}
              />
            </div>
            
            <div className="percentage-buttons">
              {percentageButtons.map((percent) => (
                <button 
                  key={percent} 
                  onClick={() => handlePercentage(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
            
            <div className="form-group">
              <label>총액 ({quoteCurrency})</label>
              <div className="total-amount">
                {sellTotal.toLocaleString('ko-KR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} {quoteCurrency}
              </div>
            </div>
            
            <button 
              className="submit-button sell"
              onClick={handleSubmitOrder}
              disabled={!sellPrice || !sellAmount || parseFloat(sellAmount) <= 0}
            >
              {baseCurrency} 매도
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPanel;