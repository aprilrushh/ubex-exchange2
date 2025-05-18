import React, { createContext, useState, useEffect } from 'react';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);

  // 샘플 코인 데이터 로드
  useEffect(() => {
    const data = [
      { symbol: 'BTC', name: '비트코인', price: 136881000, change: -0.38, volume: 200979 },
      { symbol: 'ETH', name: '이더리움', price: 2577000,  change: -0.15, volume:  69997 },
      { symbol: 'XRP', name: '리플',     price: 3011,     change: -1.5,  volume:  20556 },
      { symbol: 'SOL', name: '솔라나',   price: 257700,   change: 0.15,  volume:  69997 },
      { symbol: 'ADA', name: '에이다',   price: 3011,     change: 1.5,   volume:  20556 }
    ];
    setCoins(data);
  }, []);

  return (
    <MarketContext.Provider value={{ coins }}>
      {children}
    </MarketContext.Provider>
  );
};
