// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import webSocketServiceInstance from './services/websocketService'; // WebSocket 서비스
import { AuthProvider } from './context/AuthContext'; // 인증 컨텍스트
import { OrderProvider } from './context/OrderContext'; // 주문 컨텍스트 import 확인!

// 페이지 및 레이아웃 컴포넌트 import
import TradingLayout from './components/layout/TradingLayout';
import PortfolioPage from './pages/PortfolioPage';
import DepositWithdrawPage from './pages/DepositWithdrawPage';
import TradingPage from './pages/TradingPage'; // 주문 관련 컴포넌트가 이 페이지 내에 있음
import LoginPage from './components/Auth/Login';
import RegisterPage from './components/Auth/Register';
import AdminApp from './admin/AdminApp';
import Header from './components/common/Header'; // Header도 Context를 사용할 수 있음
import WalletPage from './pages/WalletPage';

import './App.css';

function App() {
  useEffect(() => {
    // console.log('[App.js] useEffect - WebSocket 연결 시도');
    try {
      if (webSocketServiceInstance && typeof webSocketServiceInstance.connect === 'function') {
        webSocketServiceInstance.connect(null, null);
      } else {
        // console.error('[App.js] webSocketServiceInstance 또는 connect 함수를 찾을 수 없습니다.');
      }
    } catch (error) {
      // console.error("[App.js] WebSocket 연결 중 오류:", error);
    }

    return () => {
      // console.log('[App.js] useEffect - WebSocket 연결 해제 시도');
      try {
        if (webSocketServiceInstance && typeof webSocketServiceInstance.disconnect === 'function') {
          webSocketServiceInstance.disconnect();
        } else {
          // console.error('[App.js] webSocketServiceInstance 또는 disconnect 함수를 찾을 수 없습니다.');
        }
      } catch (error) {
        // console.error("[App.js] WebSocket 연결 해제 중 오류:", error);
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider> {/* 1. AuthProvider가 전체를 감쌈 */}
        <OrderProvider> {/* 2. OrderProvider가 AuthProvider 내부에, 주문 관련 컴포넌트들을 감싸도록 위치 */}
          <Header /> {/* Header는 로그인 상태에 따라 UI가 변경되므로 AuthContext 필요 */}
          <div className="main-content">
            <Routes>
              {/* TradingPage 내부에 TradingPanel과 MyOrderList가 있으므로, 
                  TradingPage가 OrderProvider의 하위에 위치해야 함 */}
              <Route path="/" element={<TradingLayout />} />
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
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
