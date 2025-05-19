// src/components/CoinList/CoinList.js
import React, { useState, useEffect } from 'react';
import CoinItem from './CoinItem';
import webSocketServiceInstance from '../../services/websocketService'; // WebSocket 서비스 import
// import './CoinList.css'; // 필요시 스타일 파일

const CoinList = () => {
  // 코인 목록 상태: { 'BTC/KRW': { symbol: 'BTC/KRW', lastPrice: ..., ... }, ... } 형태의 객체로 관리
  const [coinTickers, setCoinTickers] = useState({});
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태
  const [error, setError] = useState('');

  useEffect(() => {
    // 초기 데이터 로드를 위한 API 호출 (선택 사항, 현재는 WebSocket에만 의존)
    // 예: fetchInitialCoinListData().then(data => setCoinTickers(data));
    // 여기서는 WebSocket 연결 시 바로 데이터를 받는다고 가정하고, 초기 로딩 상태만 관리합니다.
    // 실제로는 API로 초기 목록을 받고, WebSocket으로 업데이트를 받는 것이 일반적입니다.
    // 지금은 간결함을 위해 초기 로딩 상태만 표시하고 WebSocket 데이터로 채웁니다.
    
    // WebSocket 연결 및 리스너 등록
    webSocketServiceInstance.connect();

    const handleTickerUpdate = (tickersArray) => {
      // console.log('[CoinList] tickerUpdate 수신:', tickersArray);
      if (Array.isArray(tickersArray)) {
        // 배열로 받은 티커 데이터를 symbol을 키로 하는 객체로 변환하여 상태 업데이트
        setCoinTickers(prevTickers => {
          const newTickers = { ...prevTickers };
          tickersArray.forEach(ticker => {
            if (ticker && ticker.symbol) {
              newTickers[ticker.symbol] = {
                ...(prevTickers[ticker.symbol] || {}), // 이전 데이터 유지 (깜빡임 방지)
                ...ticker, // 새 데이터로 덮어쓰기
                // lastPriceChange: // 가격 변동 방향 (up, down, neutral) 계산 (선택 사항)
              };
            }
          });
          return newTickers;
        });
        if (isLoading) setIsLoading(false); // 데이터 수신 시 로딩 완료
        setError(''); // 오류 상태 초기화
      } else {
        console.warn('[CoinList] tickerUpdate: 유효하지 않은 데이터 형식 (배열이 아님)');
      }
    };

    webSocketServiceInstance.on('tickerUpdate', handleTickerUpdate);
    webSocketServiceInstance.subscribe('ticker');

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      webSocketServiceInstance.off('tickerUpdate', handleTickerUpdate);
      webSocketServiceInstance.unsubscribe('ticker');
      console.log('[CoinList] tickerUpdate 리스너 제거됨');
    };
  }, [isLoading]); // isLoading을 의존성 배열에 추가하여 로딩 완료 후 재실행 방지 (또는 빈 배열 사용)

  // 초기 로딩 처리 (실제 API 호출이 있다면 여기서 처리)
  useEffect(() => {
    // 임시로 0.5초 후 로딩 상태 해제 (WebSocket 데이터가 바로 들어오지 않을 경우 대비)
    const timer = setTimeout(() => {
      if (Object.keys(coinTickers).length === 0) { // 아직 데이터가 없다면
         setIsLoading(false);
         // setError('코인 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'); // 선택적 오류 메시지
      }
    }, 500); // 0.5초
    return () => clearTimeout(timer);
  }, []); // 마운트 시 한 번만 실행


  if (isLoading && Object.keys(coinTickers).length === 0) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>코인 목록을 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</p>;
  }
  
  const tickersArray = Object.values(coinTickers);

  if (tickersArray.length === 0 && !isLoading) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>표시할 코인 정보가 없습니다.</p>;
  }

  return (
    <div className="coin-list-container" style={{ margin: '20px 0' }}>
      <h4>주요 코인 시세</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f8f8f8' }}>
            <th style={{ padding: '10px 8px', textAlign: 'left' }}>코인</th>
            <th style={{ padding: '10px 8px', textAlign: 'right' }}>현재가</th>
            <th style={{ padding: '10px 8px', textAlign: 'right' }}>변동률</th>
            <th style={{ padding: '10px 8px', textAlign: 'right' }}>거래량(24H)</th>
          </tr>
        </thead>
        <tbody>
          {tickersArray.map((ticker) => (
            <CoinItem key={ticker.symbol} coin={ticker} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinList;
