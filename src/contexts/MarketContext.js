import React, { createContext, useState, useEffect } from 'react';
import { fetchCoinList } from '../services/MarketService';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 코인 목록 로드
  useEffect(() => {
    const loadCoins = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCoinList();
        setCoins(data);
        setError(null);
      } catch (err) {
        console.error('MarketContext coin load error:', err);
        setError(err.message || 'Failed to load coin list');
      } finally {
        setIsLoading(false);
      }
    };

    loadCoins();
  }, []);

  return (
    <MarketContext.Provider value={{ coins, isLoading, error }}>
      {children}
    </MarketContext.Provider>
  );
};
