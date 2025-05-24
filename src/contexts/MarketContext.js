import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchCoinList } from '../services/MarketService';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCoins = useCallback(async () => {
    let isMounted = true;
    setIsLoading(true);
    try {
      const data = await fetchCoinList();
      if (isMounted) {
        setCoins(data);
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        console.error('MarketContext coin load error:', err);
        setError(err.message || 'Failed to load coin list');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadCoins();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [loadCoins]);

  return (
    <MarketContext.Provider value={{ coins, isLoading, error }}>
      {children}
    </MarketContext.Provider>
  );
};
