// AuthContext.js - JSON 파싱 오류 수정

import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginService, register as registerService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const getInitialAuthState = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    console.log('🔍 AuthContext 초기화 체크:', { token: !!token, userString });
    
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        console.log('✅ 저장된 사용자 정보 복원:', user);
        return { token, user, isAuthenticated: true };
      } catch (error) {
        console.error('❌ 사용자 정보 파싱 오류:', error);
        // 파싱 오류 시 저장된 정보 제거
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { token: null, user: null, isAuthenticated: false };
      }
    }
    
    console.log('🔓 로그인되지 않은 상태');
    return { token: null, user: null, isAuthenticated: false };
  };

  const [authState, setAuthState] = useState(getInitialAuthState);

  // 🔧 authState 변경사항 디버깅
  useEffect(() => {
    console.log('🔄 AuthState 변경됨:', {
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      userInfo: authState.user
    });
  }, [authState]);

  const login = (token, user) => {
    console.log('🔐 로그인 시도:', { token: !!token, user });
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    const newAuthState = { token, user, isAuthenticated: true };
    setAuthState(newAuthState);
    
    console.log('✅ 로그인 완료, 새 상태:', newAuthState);
  };

  const logout = () => {
    console.log('🚪 로그아웃 시작');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const newAuthState = { token: null, user: null, isAuthenticated: false };
    setAuthState(newAuthState);
    
    console.log('✅ 로그아웃 완료, 새 상태:', newAuthState);
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

export default AuthContext;