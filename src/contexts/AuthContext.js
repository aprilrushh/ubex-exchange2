import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loginUser } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(user),
          token
        };
      } catch (error) {
        console.error('[AuthContext] 초기 상태 파싱 오류:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return {
          isAuthenticated: false,
          user: null,
          token: null
        };
      }
    }
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  });

  const login = useCallback(async (credentials) => {
    try {
      console.log('[AuthContext] 로그인 시도:', credentials);
      const result = await loginUser(credentials);
      
      if (!result.success) {
        throw new Error(result.message || '로그인에 실패했습니다.');
      }

      const { token, user } = result;
      if (!token || !user) {
        throw new Error('Invalid response format');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      const newState = {
        isAuthenticated: true,
        user,
        token
      };
      console.log('[AuthContext] 새로운 상태:', newState);
      
      setAuthState(newState);
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] 로그인 에러:', error);
      return { 
        success: false, 
        message: error.message || '로그인 중 오류가 발생했습니다.' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }, []);

  const value = {
    authState,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 