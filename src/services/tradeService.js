// src/services/tradeService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

// 더미 거래 데이터 생성
const generateDummyTrades = (symbol) => {
  const trades = [];
  const types = ['BUY', 'SELL'];
  const basePrice = symbol === 'BTC/USDT' ? 50000 : 
                   symbol === 'ETH/USDT' ? 3000 : 0.5;
  
  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const price = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const amount = Math.random() * 10;
    
    trades.push({
      id: i + 1,
      symbol,
      type,
      price,
      amount,
      total: price * amount,
      timestamp: new Date(Date.now() - i * 3600000).toISOString()
    });
  }
  
  return trades;
};

// 더미 주문 데이터
const DUMMY_ORDERS = [
  {
    id: 1,
    symbol: 'BTC/USDT',
    type: 'LIMIT',
    side: 'BUY',
    price: 50000,
    quantity: 0.1,
    status: 'OPEN',
    timestamp: Date.now() - 3600000
  },
  {
    id: 2,
    symbol: 'ETH/USDT',
    type: 'MARKET',
    side: 'SELL',
    price: null,
    quantity: 1.5,
    status: 'FILLED',
    timestamp: Date.now() - 7200000
  }
];

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (error.response?.status === 504) {
      console.error('Gateway timeout');
      return Promise.reject(new Error('Server is taking too long to respond. Please try again.'));
    }

    return Promise.reject(error);
  }
);

/**
 * 새 주문을 생성합니다.
 * @param {object} orderData - 주문 정보 (symbol, type, side, price, quantity)
 * @returns {Promise<object>} 생성된 주문 정보 또는 오류 메시지
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('주문 생성 서비스 실패:', error.message);
    throw error;
  }
};

/**
 * 현재 로그인된 사용자의 주문 목록을 조회합니다.
 * @returns {Promise<Array>} 주문 목록 배열 또는 오류 메시지
 */
export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('내 주문 목록 조회 서비스 실패:', error.message);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return {
      success: true,
      message: 'Order cancelled successfully'
    };
  }

  try {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('주문 취소 서비스 실패:', error.message);
    throw error;
  }
};

export const getOrderBook = async (symbol) => {
  try {
    const response = await api.get(`/orderbook/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('호가창 조회 서비스 실패:', error.message);
    throw error;
  }
};

export const getRecentTrades = async (symbol) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return generateDummyTrades(symbol);
  }

  try {
    const response = await api.get(`/trades?symbol=${encodeURIComponent(symbol)}`);
    return response.data;
  } catch (error) {
    console.error('최근 체결 내역 조회 서비스 실패:', error.message);
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return {
      success: true,
      orderId: Math.floor(Math.random() * 1000000),
      message: 'Order placed successfully'
    };
  }

  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('주문 실행 서비스 실패:', error);
    throw error;
  }
};

   