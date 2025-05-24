// src/services/PortfolioService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
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
    return Promise.reject(error);
  }
);

// 더미 포트폴리오 데이터 생성
const generateDummyPortfolioData = () => {
  return {
    totalValue: 100000,
    totalProfit: 5000,
    profitPercentage: 5.0,
    assets: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 0.5,
        value: 25000,
        profit: 2500,
        profitPercentage: 10.0
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 5,
        value: 15000,
        profit: 1500,
        profitPercentage: 10.0
      },
      {
        symbol: 'XRP',
        name: 'Ripple',
        amount: 1000,
        value: 500,
        profit: 100,
        profitPercentage: 20.0
      }
    ]
  };
};

// 포트폴리오 요약 정보 조회
export const getAssetSummary = async () => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return generateDummyPortfolioData();
  }

  try {
    const response = await api.get('/portfolio/summary');
    return response.data;
  } catch (error) {
    console.error('포트폴리오 요약 불러오기 서비스 실패:', error);
    throw error;
  }
};

// 자산 목록 조회
export const getAssetList = async () => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return generateDummyPortfolioData().assets;
  }

  try {
    const response = await api.get('/portfolio/assets');
    return response.data;
  } catch (error) {
    console.error('자산 목록 불러오기 서비스 실패:', error);
    throw error;
  }
};

export const getPortfolio = async () => {
  try {
    const response = await fetch(`${API_URL}/portfolio`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API 오류: ${response.status}` }));
      throw new Error(errorData.message || `API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('포트폴리오 불러오기 서비스 실패:', error);
    throw error;
  }
};

export const getPortfolioHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/portfolio/history`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API 오류: ${response.status}` }));
      throw new Error(errorData.message || `API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('포트폴리오 히스토리 불러오기 서비스 실패:', error);
    throw error;
  }
};

// 자산 상세 정보 조회
export const getAssetDetail = async (assetId) => {
  try {
    const response = await api.get(`/portfolio/assets/${assetId}`);
    return response.data;
  } catch (error) {
    console.error('자산 상세 정보 불러오기 서비스 실패:', error);
    throw new Error(error.response?.data?.message || '자산 상세 정보를 불러오는데 실패했습니다.');
  }
};

// 거래 내역 조회
export const getTradeHistory = async (params) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return generateDummyTradeHistory();
  }

  try {
    const response = await api.get('/portfolio/trades', { params });
    return response.data;
  } catch (error) {
    console.error('거래 내역 불러오기 서비스 실패:', error);
    throw error;
  }
};

// 더미 거래 내역 생성
const generateDummyTradeHistory = () => {
  const trades = [];
  const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT'];
  const types = ['BUY', 'SELL'];
  
  for (let i = 0; i < 20; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const price = Math.random() * 1000;
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
  
  return {
    trades,
    total: trades.length,
    page: 1,
    limit: 20
  };
};