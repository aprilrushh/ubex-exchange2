// src/services/WalletService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

// 더미 입금 주소 생성
const generateDummyDepositAddress = (currency) => {
  const addresses = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    USDT: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  };
  return addresses[currency] || 'dummy_address';
};

// 더미 잔액 생성
const generateDummyBalance = (currency) => {
  const balances = {
    BTC: 0.5,
    ETH: 5.0,
    USDT: 10000
  };
  return balances[currency] || 0;
};

// 더미 화이트리스트 주소 저장소
let dummyWhitelistAddresses = [
  {
    id: 1,
    coin_symbol: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    label: 'My Bitcoin Wallet',
    status: 'CONFIRMED',
    created_at: new Date().toISOString(),
  }
];

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
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
    return Promise.reject(error);
  }
);

/**
 * 입금 주소 생성/조회
 */
export const getDepositAddress = async (currency) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return generateDummyDepositAddress(currency);
  }

  try {
    const response = await api.get(`/wallet/deposit-address/${currency}`);
    return response.data.data.address;
  } catch (error) {
    console.error('입금주소 조회 실패', error);
    throw error;
  }
};

/**
 * 사용자가 직접 입금 주소를 설정
 */
export const setDepositAddress = async (currency, data) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return { success: true };
  }

  try {
    const response = await api.post(`/wallet/deposit-address/${currency}`, data);
    return response.data;
  } catch (error) {
    console.error('입금주소 설정 실패', error);
    throw error;
  }
};

/**
 * 화이트리스트 조회/등록/삭제
 */
export const listWhitelist = async (currency) => {
  console.log('화이트리스트 조회 시작:', currency);
  
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    console.log('더미 데이터 모드에서 화이트리스트 조회');
    const addresses = dummyWhitelistAddresses.filter(addr => addr.coin_symbol === currency);
    console.log('조회된 더미 화이트리스트:', addresses);
    return { success: true, data: addresses };
  }

  try {
    const response = await api.get(`/wallet/whitelist-addresses/${currency}`);
    return response.data;
  } catch (error) {
    console.error('화이트리스트 조회 실패:', error);
    throw error;
  }
};

// 화이트리스트 주소 추가
export const addWhitelistAddress = async ({ coin, address, label }) => {
  console.log('화이트리스트 주소 추가 시작:', { coin, address, label });
  
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    console.log('더미 데이터 모드에서 화이트리스트 주소 추가');
    const newAddress = {
      id: dummyWhitelistAddresses.length + 1,
      coin_symbol: coin,
      address,
      label,
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    };
    dummyWhitelistAddresses = [...dummyWhitelistAddresses, newAddress];
    console.log('추가된 더미 화이트리스트:', newAddress);
    console.log('전체 더미 화이트리스트:', dummyWhitelistAddresses);
    return { success: true, data: newAddress };
  }

  try {
    const response = await api.post('/wallet/whitelist-address', {
      coin,
      address,
      label
    });
    return response.data;
  } catch (error) {
    console.error('화이트리스트 주소 추가 실패:', error);
    throw error;
  }
};

export const removeWhitelistAddress = async (addressId) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    dummyWhitelistAddresses = dummyWhitelistAddresses.filter(addr => addr.id !== addressId);
    return {
      success: true,
      message: 'Address removed from whitelist successfully'
    };
  }

  try {
    const response = await api.delete(`/wallet/whitelist-address/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('화이트리스트 주소 삭제 실패', error);
    throw error;
  }
};

export const resendWhitelistConfirmation = async (addressId) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return { success: true };
  }

  try {
    const response = await api.post(`/wallet/whitelist/${addressId}/resend`);
    return response.data;
  } catch (error) {
    console.error('화이트리스트 확인 재전송 실패', error);
    throw error;
  }
};

export const getWhitelistAddresses = async () => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return dummyWhitelistAddresses;
  }

  try {
    const response = await api.get('/wallet/whitelist-addresses');
    return response.data.data;
  } catch (error) {
    console.error('화이트리스트 전체 조회 실패', error);
    throw error;
  }
};

/**
 * 출금 요청
 */
export const requestWithdrawal = async (data) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return {
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawalId: Math.floor(Math.random() * 1000000)
    };
  }

  try {
    const response = await api.post('/wallet/withdraw', data);
    return response.data;
  } catch (error) {
    console.error('출금 요청 실패', error);
    throw error;
  }
};

/**
 * 잔액 조회
 */
export const getBalance = async (currency) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    return generateDummyBalance(currency);
  }

  try {
    const response = await api.get(`/wallet/balance/${currency}`);
    return response.data.balance;
  } catch (error) {
    console.error('잔액 조회 실패', error);
    throw error;
  }
};

/**
 * 전체 잔액 조회
 */
export async function getAllBalances() {
  const res = await api.get('/wallet/balances');
  return res.data.data;
}
