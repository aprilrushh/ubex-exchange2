// src/services/PortfolioService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3035/api';

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

// 포트폴리오 요약 정보 조회
export const getAssetSummary = async () => {
  try {
    const response = await api.get('/portfolio/summary');
    return response.data;
  } catch (error) {
    console.error('포트폴리오 요약 불러오기 서비스 실패:', error);
    throw new Error(error.response?.data?.message || '포트폴리오 요약을 불러오는데 실패했습니다.');
  }
};

// 자산 목록 조회
export const getAssetList = async () => {
  try {
    const response = await api.get('/portfolio/assets');
    return response.data;
  } catch (error) {
    console.error('자산 목록 불러오기 서비스 실패:', error);
    throw new Error(error.response?.data?.message || '자산 목록을 불러오는데 실패했습니다.');
  }
};

export const getPortfolio = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`, {
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
    const response = await fetch(`${API_BASE_URL}/portfolio/history`, {
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