// AuthContext.js - JSON 파싱 오류 수정

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as loginService, register as registerService } from '../services/authService';

const AuthContext = createContext();

// 초기 상태
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// 리듀서
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// 🔧 안전한 JSON 파싱 함수
const safeJSONParse = (value) => {
  try {
    // null, undefined, 빈 문자열 체크
    if (!value || value === 'undefined' || value === 'null') {
      return null;
    }
    return JSON.parse(value);
  } catch (error) {
    console.warn('JSON 파싱 실패:', value, error);
    return null;
  }
};

// 🔧 안전한 localStorage 접근 함수
const safeGetLocalStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    return safeJSONParse(value);
  } catch (error) {
    console.warn('localStorage 접근 실패:', key, error);
    return null;
  }
};

// AuthProvider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 컴포넌트 마운트 시 localStorage에서 인증 정보 복원
  useEffect(() => {
    try {
      console.log('🔄 AuthContext 초기화 시작');
      
      // 🔧 안전한 localStorage 접근
      const savedToken = safeGetLocalStorage('token');
      const savedUser = safeGetLocalStorage('user');
      
      console.log('💾 저장된 토큰:', savedToken ? '존재함' : '없음');
      console.log('💾 저장된 사용자:', savedUser ? savedUser.email : '없음');
      
      if (savedToken && savedUser) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: savedUser,
            token: savedToken
          }
        });
        console.log('✅ 인증 정보 복원 완료');
      } else {
        console.log('ℹ️ 저장된 인증 정보 없음');
      }
    } catch (error) {
      console.error('❌ AuthContext 초기화 오류:', error);
      // 오류 발생 시 localStorage 정리
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  // 로그인 함수
  const login = async (credentials) => {
    try {
      console.log('[AuthContext] 로그인 시도:', credentials);
      dispatch({ type: 'LOGIN_START' });

      const response = await loginService(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // localStorage에 안전하게 저장
        try {
          localStorage.setItem('token', JSON.stringify(token));
          localStorage.setItem('user', JSON.stringify(user));
        } catch (storageError) {
          console.warn('localStorage 저장 실패:', storageError);
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });

        console.log('[AuthContext] 로그인 성공:', user.email);
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('[AuthContext] 로그인 실패:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // 회원가입 함수
  const register = async (userData) => {
    try {
      dispatch({ type: 'REGISTER_START' });

      const response = await registerService(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // localStorage에 안전하게 저장
        try {
          localStorage.setItem('token', JSON.stringify(token));
          localStorage.setItem('user', JSON.stringify(user));
        } catch (storageError) {
          console.warn('localStorage 저장 실패:', storageError);
        }

        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: { user, token }
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // 로그아웃 함수
  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      console.log('[AuthContext] 로그아웃 완료');
    } catch (error) {
      console.error('[AuthContext] 로그아웃 오류:', error);
    }
  };

  // 오류 클리어 함수
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;