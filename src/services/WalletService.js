// src/services/WalletService.js
import axios from 'axios';

/**
 * 입금 주소 생성/조회
 */
export async function getDepositAddress(coin) {
  const res = await axios.get(`/api/v1/deposit-address/${coin}`);
  return res.data.data;  // { address }
}

/**
 * 화이트리스트 조회/등록/삭제
 */
export async function listWhitelist(coin) {
  const res = await axios.get(`/api/v1/${coin}/whitelist`);
  return res.data.data;
}

export async function addWhitelist(coin, address, label) {
  const res = await axios.post(`/api/v1/${coin}/whitelist`, { address, label });
  return res.data.data;
}

export async function deleteWhitelist(coin, id) {
  const res = await axios.delete(`/api/v1/${coin}/whitelist/${id}`);
  return res.data.success;
}

/**
 * 출금 요청
 */
export async function requestWithdrawal(coin, toAddress, amount) {
  const res = await axios.post('/api/v1/withdraw', {
    coin,
    address: toAddress,
    amount,
  });
  return res.data.data; // { txHash }
}
