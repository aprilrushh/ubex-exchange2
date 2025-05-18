// src/services/AuthService.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',       // 프록시를 위해 /api로 시작
  withCredentials: true, // 쿠키 사용 시 필요
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('Network Error:', error.request);
      return Promise.reject({ message: '서버에 연결할 수 없습니다.' });
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error('Request Error:', error.message);
      return Promise.reject({ message: '요청을 처리할 수 없습니다.' });
    }
  }
);

export function registerUser(payload) {
  return api.post('/auth/register', payload);
}

export function loginUser(payload) {
  return api.post('/auth/login', payload);
}
