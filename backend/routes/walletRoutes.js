// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
// walletController에서 다양한 함수를 가져올 것이므로, 객체 구조 분해 할당을 사용합니다.
const {
  getDepositAddress,
  requestWithdrawal,
  getDeposits,
  getWithdrawals,
  getCoinBalance,
  getUserBalances // 이전 버전과의 호환성 또는 전체 잔액 조회를 위해 유지
} = require('../controllers/walletController');
// const authMiddleware = require('../middlewares/authMiddleware'); // 인증 미들웨어 주석 처리
// const { validateWithdraw } = require('../middleware/validation'); // 유효성 검사 미들웨어 (추후 구현 시 사용)

// GET /api/wallet/deposit-address/:coin - 입금 주소 조회
router.get('/deposit-address/:coin', getDepositAddress);

// POST /api/wallet/withdraw - 출금 요청
// 사용자님 코드의 validateWithdraw 미들웨어는 우선 컨트롤러 내에서 처리합니다.
router.post('/withdraw', /* validateWithdraw, */ requestWithdrawal);

// GET /api/wallet/deposits - 입금 내역 조회
router.get('/deposits', getDeposits);

// GET /api/wallet/withdrawals - 출금 내역 조회
router.get('/withdrawals', getWithdrawals);

// GET /api/wallet/balance/:coin - 특정 코인 잔액 조회
router.get('/balance/:coin', getCoinBalance);

// GET /api/wallet/balances - 전체 코인 잔액 조회 (이전 버전에서 사용)
router.get('/balances', getUserBalances);

module.exports = router;
