// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
// walletController에서 다양한 함수를 가져올 것이므로, 객체 구조 분해 할당을 사용합니다.
const {
  getDepositAddress,
  setDepositAddress,
  requestWithdrawal,
  getDeposits,
  getWithdrawals,
  getCoinBalance,
  getUserBalances,
  listWhitelist,
  addWhitelist,
  deleteWhitelist // 화이트리스트 관리
} = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { validateWithdraw } = require('../middlewares/validation'); // 유효성 검사 미들웨어 (추후 구현 시 사용)

// GET /api/wallet/deposit-address/:coin - 입금 주소 조회
router.get('/deposit-address/:coin', authMiddleware, getDepositAddress);

// POST /api/wallet/deposit-address/:coin - 입금 주소 수동 설정
router.post('/deposit-address/:coin', authMiddleware, setDepositAddress);

// POST /api/wallet/withdraw - 출금 요청
// 사용자님 코드의 validateWithdraw 미들웨어는 우선 컨트롤러 내에서 처리합니다.
router.post('/withdraw', authMiddleware, /* validateWithdraw, */ requestWithdrawal);

// GET /api/wallet/deposits - 입금 내역 조회
router.get('/deposits', authMiddleware, getDeposits);

// GET /api/wallet/withdrawals - 출금 내역 조회
router.get('/withdrawals', authMiddleware, getWithdrawals);

// GET /api/wallet/balance/:coin - 특정 코인 잔액 조회
router.get('/balance/:coin', authMiddleware, getCoinBalance);

// GET /api/wallet/balances - 전체 코인 잔액 조회 (이전 버전에서 사용)
router.get('/balances', authMiddleware, getUserBalances);

// 화이트리스트 관리 - 새로운 엔드포인트
router.get('/whitelist-addresses/:coin', authMiddleware, listWhitelist);
router.post('/whitelist-address', authMiddleware, addWhitelist);
router.delete('/whitelist-address/:id', authMiddleware, deleteWhitelist);

// 기존 경로와의 호환을 위해 리다이렉트 처리
router.get('/:coin/whitelist', (req, res) => {
  const { coin } = req.params;
  res.redirect(`/api/v1/wallet/whitelist-addresses/${coin}`);
});
router.post('/:coin/whitelist', (req, res) => {
  req.body.coin = req.params.coin;
  addWhitelist(req, res);
});
router.delete('/:coin/whitelist/:id', (req, res) => {
  deleteWhitelist(req, res);
});

module.exports = router;
