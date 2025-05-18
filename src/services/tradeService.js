// src/services/tradeService.js
import axios from 'axios';

const API_BASE_URL = '/api'; // 백엔드 API 주소 (포트 3035)

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }
  // 인증이 필요 없는 요청의 경우 또는 토큰이 없을 경우
  return { 'Content-Type': 'application/json' };
};

/**
 * 새 주문을 생성합니다.
 * @param {object} orderData - 주문 정보 (symbol, type, side, price, quantity)
 * @returns {Promise<object>} 생성된 주문 정보 또는 오류 메시지
 */
export const createOrder = async (orderData) => {
  try {
    // 백엔드의 /api/orders 경로로 POST 요청
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: getAuthHeaders(),
    });
    return response.data; // 성공 시 { message: '...', order: { ... } } 형태의 객체 반환
  } catch (error) {
    console.error('주문 생성 서비스 실패:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || '주문 생성에 실패했습니다.';
    throw new Error(errorMessage);
  }
};

/**
 * 현재 로그인된 사용자의 주문 목록을 조회합니다.
 * @returns {Promise<Array>} 주문 목록 배열 또는 오류 메시지
 */
export const getMyOrders = async () => {
  try {
    // 백엔드의 /api/orders 경로로 GET 요청
    const response = await axios.get(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders(),
    });
    return response.data; // 주문 객체들의 배열 반환
  } catch (error) {
    console.error('내 주문 목록 조회 서비스 실패:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.message || error.message || '주문 목록 조회에 실패했습니다.';
    throw new Error(errorMessage);
  }
};

   