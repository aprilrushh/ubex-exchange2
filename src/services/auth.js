   // src/services/auth.js
   import axios from 'axios';
   const API_BASE_URL = '/api/auth'; // 포트 3035
   export const loginUser = async (credentials) => { /* 이전과 동일 */ try { const response = await axios.post(`${API_BASE_URL}/login`, credentials); if (response.data && response.data.token && response.data.user) return response.data; throw new Error('로그인 응답 형식이 올바르지 않습니다.'); } catch (error) { console.error('로그인 서비스 실패:', error.response?.data || error.message); throw new Error(error.response?.data?.message || error.message || '로그인 실패'); } };
   export const registerUser = async (userData) => { /* 이전과 동일 */ try { const response = await axios.post(`${API_BASE_URL}/register`, userData); return response.data; } catch (error) { console.error('회원가입 서비스 실패:', error.response?.data || error.message); throw new Error(error.response?.data?.message || error.message || '회원가입 실패'); } };
   
   export const refreshToken = async () => {
     try {
       const token = localStorage.getItem('token');
       if (!token) return null;

       const response = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });

       if (response.data && response.data.token) {
         localStorage.setItem('token', response.data.token);
         return response.data.token;
       }
       return null;
     } catch (error) {
       console.error('토큰 갱신 실패:', error);
       localStorage.removeItem('token');
       return null;
     }
   };

   // axios 인터셉터 추가
   axios.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       
       if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         
         const newToken = await refreshToken();
         if (newToken) {
           originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
           return axios(originalRequest);
         }
       }
       
       return Promise.reject(error);
     }
   );
   