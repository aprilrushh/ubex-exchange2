import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CoinListPage from './pages/CoinListPage';
import CoinEditPage from './pages/CoinEditPage';
import PairListPage from './pages/PairListPage';

const AdminRoutes = () => (
  <Routes>
    <Route path="coins" element={<CoinListPage />} />
    <Route path="coins/:id" element={<CoinEditPage />} />
    <Route path="pairs" element={<PairListPage />} />
  </Routes>
);

export default AdminRoutes; 