// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import webSocketServiceInstance from './services/websocketService'; // WebSocket 서비스
import { AuthProvider } from './contexts/AuthContext'; // 인증 컨텍스트
import { OrderProvider } from './contexts/OrderContext'; // 주문 컨텍스트 import 확인!
import { ThemeProvider } from './contexts/ThemeContext';
import { MarketProvider } from './contexts/MarketContext';

// 페이지 및 레이아웃 컴포넌트 import
import TradingLayout from './components/layout/TradingLayout';
import ExchangePage from './components/Exchange/ExchangePage';
import PortfolioPage from './pages/PortfolioPage';
import DepositWithdrawPage from './components/DepositWithdraw/DepositWithdrawPage';
import TradingPage from './pages/TradingPage'; // 주문 관련 컴포넌트가 이 페이지 내에 있음
import LoginPage from './components/auth/Login';
import RegisterPage from './components/auth/Register';
import AdminApp from './admin/AdminApp';
import Header from './components/layout/Header'; // Header도 Context를 사용할 수 있음
import WalletPage from './pages/WalletPage';

import './App.css';

function App() {
  useEffect(() => {
    // console.log('[App.js] useEffect - WebSocket 연결 시도');
    try {
      webSocketServiceInstance.connect();
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }

    return () => {
      // console.log('[App.js] useEffect - WebSocket 연결 해제 시도');
      try {
        webSocketServiceInstance.disconnect();
      } catch (error) {
        console.error('WebSocket disconnection error:', error);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MarketProvider>
          <OrderProvider>
            <BrowserRouter>
              <div className="app">
                <Header /> {/* Header는 로그인 상태에 따라 UI가 변경되므로 AuthContext 필요 */}
                <div className="main-content">
                  <Routes>
                    {/* TradingPage 내부에 TradingPanel과 MyOrderList가 있으므로, 
                        TradingPage가 OrderProvider의 하위에 위치해야 함 */}
                    <Route path="/" element={<ExchangePage />} />
                    <Route path="/exchange" element={<ExchangePage />} />
                    <Route path="/trade/:symbol" element={<TradingPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/wallet" element={<DepositWithdrawPage />} />
                    <Route path="/wallet/:coin" element={<WalletPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin/*" element={<AdminApp />} />
                    {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </OrderProvider>
        </MarketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
