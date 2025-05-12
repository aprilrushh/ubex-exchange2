// src/App.js - 모든 내용 교체
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TradingLayout from './components/layout/TradingLayout';
import DepositWithdrawPage from './pages/DepositWithdrawPage';
import AdminApp from './admin/AdminApp';
import PortfolioPage from './pages/PortfolioPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradingLayout />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/wallet" element={<DepositWithdrawPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;