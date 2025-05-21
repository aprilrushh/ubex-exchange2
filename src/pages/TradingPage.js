// src/pages/TradingPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import TradingPanel from '../components/TradingView/TradingPanel';
import MyOrderList from '../components/OrderHistory/MyOrderList';
import SimpleChart from '../components/Chart/SimpleChart'; // SimpleChart import
import MarketSidebar from '../components/MarketSidebar';
// import OrderBook from '../components/OrderBook/OrderBook';
// import RecentTrades from '../components/TradeHistory/TradingHistory';

const TradingPage = () => {
  const { symbol: urlSymbol } = useParams(); // 예: BTC_KRW
  
  // URL 파라미터 (예: BTC_KRW)를 SimpleChart가 사용할 수 있는 형식 (예: BTC/KRW)으로 변환
  // SimpleChart의 기본 symbol prop이 'BTC/USDT'이므로, 유사한 형식을 사용합니다.
  // MarketContext의 코인 심볼 형식과도 일치시키는 것이 좋습니다.
  const chartSymbol = urlSymbol ? urlSymbol.replace('_', '/') : 'BTC/KRW'; // 기본값 또는 변환된 심볼
  const displaySymbol = chartSymbol || '코인 선택 안됨';

  return (
    <div className="trading-page-container">
      <div style={{ padding: '0 20px', marginRight: '260px' }}>
        <h2>거래 :: {displaySymbol}</h2>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
          {/* 왼쪽 영역: 차트, 호가창 등 */}
          <div style={{ flex: 2, minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* SimpleChart 컴포넌트 추가 및 symbol prop 전달 */}
            {/* SimpleChart는 현재 자체 샘플 데이터를 사용합니다. */}
            <SimpleChart symbol={chartSymbol} timeframe="1d" /> {/* timeframe 기본값 예시 */}
            
            {/* <OrderBook symbol={chartSymbol} /> */}
            <p style={{padding: '20px', border: '1px dashed #ccc', textAlign:'center'}}> (호가창 영역) </p>
          </div>

          {/* 오른쪽 영역: 주문 패널, 최근 체결 등 */}
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <TradingPanel /> {/* TradingPanel은 useParams를 통해 symbol을 내부적으로 가져옴 */}
            
            {/* <RecentTrades symbol={chartSymbol} /> */}
            <p style={{padding: '10px', border: '1px dashed #ccc', textAlign:'center'}}> (최근 체결 내역 영역) </p>
          </div>
        </div>

        {/* 하단 영역: 나의 주문 내역 */}
        <div style={{ marginTop: '30px' }}>
          <MyOrderList />
        </div>
      </div>
      <MarketSidebar />
    </div>
  );
};

export default TradingPage;


