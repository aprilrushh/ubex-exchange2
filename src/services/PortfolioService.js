// src/services/PortfolioService.js
import axios from 'axios';

const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

// getAssetSummary 함수를 export const로 선언
export const getAssetSummary = async () => {
  try {
    const response = await fetch(`${BASE_URL}/portfolio/summary`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API 오류: ${response.status}` }));
      throw new Error(errorData.message || `API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('포트폴리오 요약 불러오기 서비스 실패:', error);
    throw error;
  }
};

// getAssetList 함수를 export const로 선언
export const getAssetList = async () => {
  try {
    const response = await fetch(`${BASE_URL}/portfolio/assets`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `API 오류: ${response.status}` }));
      throw new Error(errorData.message || `API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('자산 목록 불러오기 서비스 실패:', error);
    throw error;
  }
};

export const getPortfolio = async () => {
  return axios.get('/portfolio');
};

export const getPortfolioHistory = async () => {
  return axios.get('/portfolio/history');
};