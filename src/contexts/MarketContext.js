import React, { createContext, useState, useEffect } from 'react';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);

  // 샘플 코인 데이터 로드
  useEffect(() => {
    const data = [
      { symbol: 'BIT', name: '비트',       price: 2500,    change: 0.25,  volume: 12345 },
      { symbol: 'ETH', name: '이더리움',   price: 1700000, change: -1.2,  volume: 67890 },
      { symbol: 'USDT', name: '테더',      price: 1350,    change: 0.05,  volume: 54321 },
      { symbol: 'DOGE', name: '도지코인',  price: 85,      change: 3.2,   volume: 234567 },
      { symbol: 'SOL', name: '솔라나',     price: 25000,   change: -0.8,  volume: 98765 },
      { symbol: 'ADA', name: '에이다',     price: 500,     change: 1.5,   volume: 45678 },
      { symbol: 'XRP', name: '리플',       price: 750,     change: -0.3,  volume: 123456 },
      { symbol: 'BNB', name: '바이낸스',   price: 420000,  change: 0.7,   volume: 98765 },
      { symbol: 'LTC', name: '라이트코인', price: 95000,   change: -2.1,  volume: 22222 },
      { symbol: 'DOT', name: '폴카닷',     price: 15000,   change: 0.9,   volume: 33333 }
    ];
    setCoins(data);
  }, []);

  return (
    <MarketContext.Provider value={{ coins }}>
      {children}
    </MarketContext.Provider>
  );
};
