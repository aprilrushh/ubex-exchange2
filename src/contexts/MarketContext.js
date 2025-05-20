import React, { createContext, useContext, useState, useCallback } from 'react';

const MarketContext = createContext(null);

export const MarketProvider = ({ children }) => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('BTC/USDT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3035/api/markets');
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }

      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error('Fetch markets error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    markets,
    selectedMarket,
    isLoading,
    error,
    setSelectedMarket,
    fetchMarkets
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}; 