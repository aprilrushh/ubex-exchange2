// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // 전역 CSS 임포트
import './App.css';        // App 전역 스타일
import App from './App';
import { ThemeProvider } from './context/ThemeContext'; // 생성된 ThemeContext 사용
import { AuthProvider } from './context/AuthContext';   // 기존 AuthContext 사용
import { MarketProvider } from './context/MarketContext'; // 주인님의 MarketContext 사용
import { OrderProvider } from './context/OrderContext';   // 기존 OrderContext 사용

// import './i18n'; // 다국어 지원 설정이 있다면 주석 해제

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MarketProvider> {/* CryptoDataProvider 대신 MarketProvider 사용 */}
          <OrderProvider>
            <App />
          </OrderProvider>
        </MarketProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
