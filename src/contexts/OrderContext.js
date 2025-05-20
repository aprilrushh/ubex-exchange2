import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as tradeService from '../services/tradeService';

// 더미 주문 데이터
const DUMMY_ORDERS = [
  {
    id: 1,
    symbol: 'BTC/USDT',
    type: 'LIMIT',
    side: 'BUY',
    price: 50000,
    quantity: 0.1,
    status: 'OPEN',
    timestamp: new Date().getTime() - 3600000
  },
  {
    id: 2,
    symbol: 'ETH/USDT',
    type: 'MARKET',
    side: 'SELL',
    price: null,
    quantity: 1.5,
    status: 'FILLED',
    timestamp: new Date().getTime() - 7200000
  },
  {
    id: 3,
    symbol: 'BTC/USDT',
    type: 'LIMIT',
    side: 'SELL',
    price: 51000,
    quantity: 0.05,
    status: 'PARTIALLY_FILLED',
    timestamp: new Date().getTime() - 10800000
  }
];

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const { authState } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    if (!authState.isAuthenticated) {
      throw new Error('User must be authenticated to create orders');
    }

    try {
      const response = await fetch('http://localhost:3035/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const newOrder = await response.json();
      setOrders(prevOrders => [...prevOrders, newOrder]);
      return newOrder;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }, [authState]);

  const cancelOrder = useCallback(async (orderId) => {
    if (!authState.isAuthenticated) {
      throw new Error('User must be authenticated to cancel orders');
    }

    try {
      const response = await fetch(`http://localhost:3035/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }, [authState]);

  const refreshOrders = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3035/api/orders', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [authState]);

  const value = {
    orders,
    isLoading,
    error,
    createOrder,
    cancelOrder,
    refreshOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}; 