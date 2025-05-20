   // src/services/auth.js
   import axios from 'axios';
   
   const API_BASE_URL = 'http://localhost:3035/api';

   // axios 인스턴스 생성
   const api = axios.create({
     baseURL: API_BASE_URL,
     withCredentials: true,
     headers: {
       'Content-Type': 'application/json'
     }
   });

   // 요청 인터셉터 추가
   api.interceptors.request.use(
     config => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers['Authorization'] = `Bearer ${token}`;
       }
       return config;
     },
     error => {
       console.error('Request interceptor error:', error);
       return Promise.reject(error);
     }
   );

   // 응답 인터셉터 추가
   api.interceptors.response.use(
     response => response,
     async error => {
       if (error.response?.status === 401) {
         console.log('401 Unauthorized - 로그아웃 처리');
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         window.location.href = '/login';
       }
       return Promise.reject(error);
     }
   );

   export const registerUser = async (userData) => {
     try {
       const response = await api.post('/auth/register', userData);
       const { token, user } = response.data;
       if (token) {
         localStorage.setItem('token', token);
       }
       if (user) {
         localStorage.setItem('user', JSON.stringify(user));
       }
       return { success: true, user };
     } catch (error) {
       console.error('회원가입 서비스 실패:', error.response?.data || error);
       return { 
         success: false, 
         message: error.response?.data?.message || '회원가입 중 오류가 발생했습니다.' 
       };
     }
   };

   export const loginUser = async (credentials) => {
     try {
       console.log('로그인 시도:', credentials);
       const response = await api.post('/auth/login', credentials);
       console.log('로그인 응답:', response.data);
       
       const { token, user } = response.data;
       if (!token) {
         throw new Error('토큰이 없습니다.');
       }
       
       // 토큰 저장
       localStorage.setItem('token', token);
       if (user) {
         localStorage.setItem('user', JSON.stringify(user));
       }
       
       // axios 기본 헤더에 토큰 설정
       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
       
       return { success: true, token, user };
     } catch (error) {
       console.error('로그인 서비스 실패:', error.response?.data || error);
       return { 
         success: false, 
         message: error.response?.data?.message || '로그인 중 오류가 발생했습니다.' 
       };
     }
   };

   export const logoutUser = () => {
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     delete api.defaults.headers.common['Authorization'];
     window.location.href = '/login';
   };

   export const refreshToken = async () => {
     try {
       const token = localStorage.getItem('token');
       if (!token) {
         throw new Error('No token found');
       }

       const response = await api.post('/auth/refresh-token');
       const { token: newToken } = response.data;
       if (!newToken) {
         throw new Error('No new token received');
       }

       localStorage.setItem('token', newToken);
       return { success: true, token: newToken };
     } catch (error) {
       console.error('토큰 갱신 실패:', error.response?.data || error);
       return { 
         success: false, 
         message: error.response?.data?.message || '토큰 갱신 중 오류가 발생했습니다.' 
       };
     }
   };
   