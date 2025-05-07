import React from 'react';
import AppRoutes from './routes';
import { MarketProvider } from './context/MarketContext';
import './App.css';

function App() {
  return (
    <MarketProvider>
      <AppRoutes />
    </MarketProvider>
  );
}

export default App;
