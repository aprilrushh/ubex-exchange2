import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { connectWebSocket, disconnectWebSocket } from './services/websocketService';
import { AuthProvider } from './context/AuthContext'; // AuthProvider import

// --- 사용자 페이지 컴포넌트 import (경로는 실제 구조에 맞게 조정 필요) ---
import HomePage from './pages/HomePage';
import TradePage from './pages/TradePage';
import PortfolioPage from './pages/PortfolioPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// --- 관리자 앱 컴포넌트 import ---
import AdminApp from './admin/AdminApp';

// --- 공통 컴포넌트 import (필요한 경우) ---
import Header from './components/common/Header';

// --- CSS import ---
import './App.css';

function App() {
  // WebSocket 연결 및 해제 관리
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider로 전체 앱 감싸기 */} 
        <Header />
        <div className="main-content">
          <Routes>
            {/* --- 사용자 페이지 라우트 --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/trade/:symbol" element={<TradePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- 관리자 페이지 라우트 --- */}
            <Route path="/admin/*" element={<AdminApp />} />

            {/* --- 기타 라우트 (예: 404 페이지) --- */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
