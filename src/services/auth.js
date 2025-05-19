   // src/services/auth.js
   import axios from 'axios';

   const API_BASE_URL = '/api';

   // axios 인스턴스 생성
   const api = axios.create({
     baseURL: API_BASE_URL,
     withCredentials: true,
     headers: {
       'Content-Type': 'application/json',
       'Cache-Control': 'no-cache',
       'Pragma': 'no-cache'
     }
   });

   // 응답 인터셉터 추가
   api.interceptors.response.use(
     response => response,
     async error => {
       const originalRequest = error.config;

       // 토큰 만료로 인한 401 에러이고, 아직 재시도하지 않은 요청인 경우
       if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;

         try {
           // 토큰 갱신 시도
           const response = await api.post('/auth/refresh-token');
           const { token } = response.data;

           // 새 토큰 저장
           localStorage.setItem('token', token);

           // 원래 요청의 Authorization 헤더 업데이트
           originalRequest.headers['Authorization'] = `Bearer ${token}`;

           // 원래 요청 재시도
           return api(originalRequest);
         } catch (refreshError) {
           // 토큰 갱신 실패 시 로그아웃 처리
           localStorage.removeItem('token');
           window.location.href = '/login';
           return Promise.reject(refreshError);
         }
       }

       return Promise.reject(error);
     }
   );

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
       return Promise.reject(error);
     }
   );

   export const registerUser = async (userData) => {
     try {
       const response = await api.post('/auth/register', userData);
       const { token, user } = response.data;
       localStorage.setItem('token', token);
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
       const response = await api.post('/auth/login', credentials);
       const { token, user } = response.data;
       localStorage.setItem('token', token);
       return { success: true, user };
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
     window.location.href = '/login';
   };

   export const refreshToken = async () => {
     try {
       const response = await api.post('/auth/refresh-token');
       const { token } = response.data;
       localStorage.setItem('token', token);
       return { success: true, token };
     } catch (error) {
       console.error('토큰 갱신 실패:', error.response?.data || error);
       return { 
         success: false, 
         message: error.response?.data?.message || '토큰 갱신 중 오류가 발생했습니다.' 
       };
     }
   };
   