import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

export const register = async (userData) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    console.log('[authService] 더미 데이터 모드 - 회원가입 성공');
    return { 
      success: true, 
      data: {
        user: {
          id: 1,
          username: userData.email,
          email: userData.email
        },
        token: 'dummy-token'
      }
    };
  }

  try {
    console.log('[authService] 회원가입 요청 시작:', userData.email);
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    console.log('[authService] 회원가입 응답 받음:', response);
    console.log('[authService] 응답 데이터:', response.data);
    
    // 🔧 응답 구조 확인
    if (response.data && response.data.success) {
      console.log('[authService] 회원가입 성공 응답:', response.data);
      return response.data; // { success: true, data: { user, token } }
    } else {
      console.error('[authService] 회원가입 실패 응답:', response.data);
      throw new Error(response.data?.message || 'Registration failed');
    }
  } catch (error) {
    console.error('[authService] 회원가입 오류:', error);
    
    // 🔧 오류 응답 처리
    if (error.response) {
      console.error('[authService] 서버 오류 응답:', error.response.data);
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error('[authService] 네트워크 오류:', error.request);
      throw new Error('Network error: Cannot reach server');
    } else {
      console.error('[authService] 기타 오류:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  }
};

export const login = async (credentials) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    console.log('[authService] 더미 데이터 모드 - 로그인 성공');
    return {
      success: true,
      data: {
        token: 'dummy-token',
        user: {
          id: 1,
          username: credentials.email,
          email: credentials.email
        }
      }
    };
  }

  try {
    console.log('[authService] 로그인 요청 시작:', credentials.email);
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    console.log('[authService] 로그인 응답 받음:', response);
    console.log('[authService] 응답 데이터:', response.data);
    
    // 🔧 응답 구조 확인
    if (response.data && response.data.success) {
      console.log('[authService] 로그인 성공 응답:', response.data);
      return response.data; // { success: true, data: { user, token } }
    } else {
      console.error('[authService] 로그인 실패 응답:', response.data);
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error) {
    console.error('[authService] 로그인 오류:', error);
    
    // 🔧 오류 응답 처리
    if (error.response) {
      console.error('[authService] 서버 오류 응답:', error.response.data);
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error('[authService] 네트워크 오류:', error.request);
      throw new Error('Network error: Cannot reach server');
    } else {
      console.error('[authService] 기타 오류:', error.message);
      throw new Error(error.message || 'Login failed');
    }
  }
};

// 🧪 디버깅용 - API 베이스 URL 확인
console.log('[authService] API_BASE_URL:', API_BASE_URL);

// 🧪 디버깅용 - 백엔드 연결 테스트
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    console.log('[authService] 백엔드 연결 테스트 성공:', response.data);
    return true;
  } catch (error) {
    console.error('[authService] 백엔드 연결 테스트 실패:', error);
    return false;
  }
}; 