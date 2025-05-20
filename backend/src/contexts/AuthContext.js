// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const getInitialAuthState = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        return { token, user, isAuthenticated: true };
      } catch (error) {
        // 파싱 오류 시 저장된 정보 제거
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { token: null, user: null, isAuthenticated: false };
      }
    }
    return { token: null, user: null, isAuthenticated: false };
  };

  const [authState, setAuthState] = useState(getInitialAuthState);

  // useEffect는 로컬 스토리지 변경을 감지하는 용도보다는,
  // 외부 요인(예: 다른 탭에서의 로그아웃)에 의한 동기화에 더 적합할 수 있습니다.
  // 여기서는 초기 상태 설정을 getInitialAuthState 함수로 명확히 했습니다.
  // 만약 다른 탭과의 동기화가 필요하다면 'storage' 이벤트를 리스닝할 수 있습니다.

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ token, user, isAuthenticated: true });
    console.log('로그인 상태 업데이트 (AuthContext):', { user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ token: null, user: null, isAuthenticated: false });
    console.log('로그아웃 완료 (AuthContext)');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
