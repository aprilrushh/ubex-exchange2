// src/components/TradingView/TradingPanel.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createOrder } from '../../services/tradeService'; // 주문 생성 서비스
import { useAuth } from '../../context/AuthContext'; // 인증 Context
import { useOrders } from '../../context/OrderContext'; // 주문 Context

// import './TradingPanel.css'; // 필요시 스타일 파일

const TradingPanel = () => {
  const { symbol: urlSymbol } = useParams(); // URL에서 거래 쌍 심볼 가져오기 (예: BTC_KRW)
  const { authState } = useAuth(); // 현재 로그인 상태 및 사용자 정보
  const { addOrderToLocalList, refreshOrders } = useOrders(); // 주문 Context에서 함수 가져오기

  // 컴포넌트 내부 상태
  const [orderType, setOrderType] = useState('limit'); // 주문 유형: 'limit' (지정가), 'market' (시장가)
  const [side, setSide] = useState('buy'); // 주문 구분: 'buy' (매수), 'sell' (매도)
  const [price, setPrice] = useState(''); // 지정가 주문 시 가격
  const [quantity, setQuantity] = useState(''); // 주문 수량
  const [message, setMessage] = useState(''); // 사용자에게 보여줄 성공/오류 메시지
  const [isSubmitting, setIsSubmitting] = useState(false); // 주문 처리 중인지 여부

  // URL 파라미터 (예: BTC_KRW)를 API에서 사용할 형식 (예: BTC/KRW)으로 변환
  const selectedSymbol = urlSymbol ? urlSymbol.replace('_', '/') : 'BTC/KRW'; // 기본값 설정

  // 주문 제출 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    setMessage(''); // 이전 메시지 초기화
    setIsSubmitting(true); // 주문 처리 시작 상태

    // 로그인 상태 확인
    if (!authState.isAuthenticated) {
      setMessage('주문을 하시려면 로그인이 필요합니다.');
      setIsSubmitting(false);
      return;
    }

    // 주문 데이터 구성
    const orderData = {
      symbol: selectedSymbol,
      type: orderType,
      side: side,
      quantity: parseFloat(quantity), // 문자열을 숫자로 변환
    };

    // 지정가 주문일 경우 가격 유효성 검사 및 데이터 추가
    if (orderType === 'limit') {
      if (!price || parseFloat(price) <= 0) {
        setMessage('지정가 주문 시 유효한 가격을 입력해주세요.');
        setIsSubmitting(false);
        return;
      }
      orderData.price = parseFloat(price); // 문자열을 숫자로 변환
    }

    // 수량 유효성 검사
    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setMessage('유효한 수량을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('[TradingPanel] 주문 데이터 전송 시도:', orderData);
      const result = await createOrder(orderData); // 백엔드에 주문 생성 요청
      setMessage(result.message || '주문이 성공적으로 접수되었습니다.');
      console.log('[TradingPanel] 주문 결과:', result.order);

      if (result.order) {
        // 낙관적 업데이트: 성공 시 반환된 주문 객체로 로컬 주문 목록 즉시 업데이트
        addOrderToLocalList(result.order);
        setPrice('');
        setQuantity('');
        // 약간의 딜레이 후 서버와 최종 동기화
        setTimeout(() => {
          refreshOrders();
        }, 800); // 0.8초 후 동기화
      }

    } catch (error) {
      console.error('[TradingPanel] 주문 제출 오류:', error);
      setMessage(error.message || '주문 처리 중 오류가 발생했습니다.');
    }
    setIsSubmitting(false); // 주문 처리 완료 상태
  };

  return (
    <div className="trading-panel" style={{ border: '1px solid #ccc', padding: '20px', margin: '10px 0', maxWidth: '400px' }}>
      <h4>주문 ({selectedSymbol})</h4>
      {/* 사용자 피드백 메시지 */}
      {message && <p style={{ color: message.includes('성공') ? 'green' : 'red', wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '0.9em', marginTop: '10px' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
        {/* 주문 유형 선택 (라디오 버튼) */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px', cursor: 'pointer' }}>
            <input type="radio" name="orderType" value="limit" checked={orderType === 'limit'} onChange={() => setOrderType('limit')} />
            지정가
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" name="orderType" value="market" checked={orderType === 'market'} onChange={() => setOrderType('market')} />
            시장가
          </label>
        </div>

        {/* 매수/매도 선택 (버튼) */}
        <div style={{ marginBottom: '15px' }}>
          <button type="button" onClick={() => setSide('buy')} style={{ backgroundColor: side === 'buy' ? '#28a745' : '#f0f0f0', color: side === 'buy' ? 'white' : 'black', padding: '8px 12px', border: 'none', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>매수</button>
          <button type="button" onClick={() => setSide('sell')} style={{ backgroundColor: side === 'sell' ? '#dc3545' : '#f0f0f0', color: side === 'sell' ? 'white' : 'black', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>매도</button>
        </div>

        {/* 가격 입력 필드 (지정가 주문 시에만 표시) */}
        {orderType === 'limit' && (
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="price" style={{ display: 'block', marginBottom: '5px' }}>가격 ({selectedSymbol.split('/')[1]}): </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="주문 가격"
              step="any" // 소수점 입력 허용
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        {/* 수량 입력 필드 */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="quantity" style={{ display: 'block', marginBottom: '5px' }}>수량 ({selectedSymbol.split('/')[0]}): </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="주문 수량"
            step="any" // 소수점 입력 허용
            required // 필수 입력
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        {/* 예상 주문 총액 표시 (지정가 주문 시) */}
        {orderType === 'limit' && price && quantity && !isNaN(parseFloat(price)) && !isNaN(parseFloat(quantity)) && (
            <p style={{ fontSize: '0.9em', color: '#555', marginBottom: '15px' }}>
              주문 총액 (예상): {(parseFloat(price) * parseFloat(quantity)).toFixed(selectedSymbol.split('/')[1] === 'KRW' ? 0 : 8)} {selectedSymbol.split('/')[1]}
            </p>
        )}

        {/* 주문 제출 버튼 */}
        <button 
          type="submit" 
          disabled={isSubmitting} // 주문 처리 중 비활성화
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: side === 'buy' ? '#28a745' : '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '16px', 
            cursor: 'pointer', 
            opacity: isSubmitting ? 0.7 : 1 
          }}
        >
          {isSubmitting ? '주문 처리 중...' : (side === 'buy' ? '매수 요청' : '매도 요청')}
        </button>
      </form>
    </div>
  );
};

export default TradingPanel;
