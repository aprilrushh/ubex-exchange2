// src/routes.js 수정
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TradingLayout from './components/layout/TradingLayout';
// 기존 임포트 주석 처리
// import CoinListPage from './pages/CoinListPage';
// import TradingPage from './pages/TradingPage';
// import ChartPage from './pages/ChartPage';
// import TradeHistoryPage from './pages/TradeHistoryPage';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TradingLayout />} />
      {/* 기존 라우트들 주석 처리 
      <Route path="/trade/:symbol" element={<TradingPage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/chart/:symbol" element={<ChartPage />} />
      <Route path="/history/:symbol" element={<TradeHistoryPage />} />
      */}
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
