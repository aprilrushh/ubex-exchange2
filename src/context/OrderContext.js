// src/context/OrderContext.js
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getMyOrders } from '../services/tradeService'; // 주문 목록 조회 서비스
import { useAuth } from './AuthContext'; // 인증 상태 사용

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');
  const { authState } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUserOrders = useCallback(async () => {
    console.log('[OrderContext] fetchUserOrders 시도. authState.isAuthenticated:', authState.isAuthenticated, 'User ID:', authState.user?.id);
    if (!authState.isAuthenticated || !authState.user) {
      setOrders([]);
      console.log('[OrderContext] 사용자가 로그인하지 않았거나 사용자 정보가 없어 주문을 불러오지 않습니다.');
      return;
    }
    setIsLoadingOrders(true);
    setOrderError('');
    try {
      console.log('[OrderContext] fetchUserOrders API 호출 시작 (사용자 ID:', authState.user.id, ')');
      const fetchedOrders = await getMyOrders();
      setOrders(fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      console.log('[OrderContext] 주문 목록 로드 성공:', fetchedOrders.length, '건.');
    } catch (err) {
      console.error('[OrderContext] 주문 목록 로드 중 오류 발생:', err);
      setOrderError(err.message || '주문 내역을 불러오는 데 실패했습니다.');
      setOrders([]);
    }
    setIsLoadingOrders(false);
  }, [authState.isAuthenticated, authState.user]);

  useEffect(() => {
    console.log('[OrderContext] useEffect 실행 (로그인 상태 또는 refreshTrigger 변경 감지). isAuthenticated:', authState.isAuthenticated, 'User ID:', authState.user?.id, 'RefreshTrigger:', refreshTrigger);
    if (authState.isAuthenticated && authState.user) {
        fetchUserOrders();
    } else {
        setOrders([]);
        console.log('[OrderContext] 로그아웃 상태로 판단, 주문 목록을 비웁니다.');
    }
  }, [authState.isAuthenticated, authState.user, fetchUserOrders, refreshTrigger]);

  // 새 주문을 로컬 주문 목록 상태에 즉시 추가 (낙관적 업데이트용)
  const addOrderToLocalList = useCallback((newOrder) => {
    console.log('[OrderContext] addOrderToLocalList 호출됨, 새 주문:', newOrder);
    setOrders(prevOrders =>
      [newOrder, ...prevOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    );
  }, []);

  const refreshOrders = useCallback(() => {
    console.log('[OrderContext] refreshOrders 명시적 호출됨. refreshTrigger 값 변경.');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const value = {
    orders,
    isLoadingOrders,
    orderError,
    addOrderToLocalList, // TradingPanel에서 사용
    refreshOrders,       // TradingPanel에서 사용 (선택적)
    fetchUserOrders
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders는 OrderProvider 내부에서 사용해야 합니다.');
  }
  return context;
};

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
