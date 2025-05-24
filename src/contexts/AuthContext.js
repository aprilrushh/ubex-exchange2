import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    token: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setAuthState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        token: storedToken
      });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('[AuthContext] 로그인 시도:', credentials);
      const response = await loginService(credentials);
      
      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        setAuthState({
          user: userData,
          isAuthenticated: true,
          token: token
        });
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[AuthContext] 로그인 에러:', error);
      // 더미 데이터 모드에서는 성공으로 처리
      if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
        const dummyUser = {
          id: 1,
          username: credentials.email,
          email: credentials.email
        };
        const dummyToken = 'dummy-token';
        setAuthState({
          user: dummyUser,
          isAuthenticated: true,
          token: dummyToken
        });
        localStorage.setItem('user', JSON.stringify(dummyUser));
        localStorage.setItem('token', dummyToken);
        return { success: true };
      }
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null
    });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    authState,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 