// src/services/WalletService.js
import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3035',
  headers: {
    'Content-Type': 'application/json',
  },
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
    return Promise.reject(error);
  }
);

/**
 * 입금 주소 생성/조회
 */
export async function getDepositAddress(coin) {
  const res = await api.get(`/api/v1/wallet/deposit-address/${coin}`);
  return res.data.data;  // { address }
}

/**
 * 화이트리스트 조회/등록/삭제
 */
export async function listWhitelist(coin) {
  const res = await api.get(`/api/v1/wallet/${coin}/whitelist`);
  return res.data.data;
}

export async function addWhitelist(coin, address, label) {
  const res = await api.post(`/api/v1/wallet/${coin}/whitelist`, { address, label });
  return res.data.data;
}

export async function deleteWhitelist(coin, id) {
  const res = await api.delete(`/api/v1/wallet/${coin}/whitelist/${id}`);
  return res.data.success;
}

/**
 * 출금 요청
 */
export async function requestWithdrawal(coin, toAddress, amount) {
  const res = await api.post('/api/v1/wallet/withdraw', {
    coin,
    address: toAddress,
    amount,
  });
  return res.data.data; // { txHash }
}

/**
 * 잔액 조회
 */
export async function getBalance(coin) {
  const res = await api.get(`/api/v1/wallet/balance/${coin}`);
  return res.data.data;
}

/**
 * 전체 잔액 조회
 */
export async function getAllBalances() {
  const res = await api.get('/api/v1/wallet/balances');
  return res.data.data;
}
