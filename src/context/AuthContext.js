// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    // console.log('[AuthContext] useState 초기화 함수 실행');
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    // console.log('[AuthContext] 초기 localStorage - token:', token, 'userString:', userString);

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        // console.log('[AuthContext] 초기 상태: 로컬 스토리지 유효, isAuthenticated: true, user:', user);
        return { token, user, isAuthenticated: true };
      } catch (error) {
        console.error('[AuthContext] 초기 상태: 로컬 스토리지 user 파싱 오류:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { token: null, user: null, isAuthenticated: false };
      }
    }
    // console.log('[AuthContext] 초기 상태: 로컬 스토리지 비어있음 또는 정보 부족, isAuthenticated: false');
    return { token: null, user: null, isAuthenticated: false };
  });

  useEffect(() => {
    // console.log('[AuthContext] authState 변경 감지:', authState);
  }, [authState]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    const newState = { token, user, isAuthenticated: true };
    setAuthState(newState);
    console.log('[AuthContext] login 함수 호출됨, 새로운 authState:', newState);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const newState = { token: null, user: null, isAuthenticated: false };
    setAuthState(newState);
    console.log('[AuthContext] logout 함수 호출됨, 새로운 authState:', newState);
  };

  const value = { authState, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  }
  return context;
};
