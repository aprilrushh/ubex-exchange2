// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
// walletController에서 다양한 함수를 가져올 것이므로, 객체 구조 분해 할당을 사용합니다.
// const {
//   getDepositAddress,
//   setDepositAddress,
//   requestWithdrawal,
//   getDeposits,
//   getWithdrawals,
//   getCoinBalance,
//   getUserBalances,
//   listWhitelist,
//   addWhitelist,
//   deleteWhitelist,
//   confirmWhitelistAddress
// } = require('../controllers/walletController');
const authMiddleware = require('../middlewares/authMiddleware');
const whitelistRateLimit = require('../middlewares/whitelistRateLimit');
// const { validateWithdraw } = require('../middlewares/validation'); // 유효성 검사 미들웨어 (추후 구현 시 사용)

// ETH 주소 검증 함수
function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// GET /api/wallet/deposit-address/:coin - 입금 주소 조회
// router.get('/deposit-address/:coin', authMiddleware, getDepositAddress);

// POST /api/wallet/deposit-address/:coin - 입금 주소 수동 설정
router.post('/deposit-address/:coin', async (req, res) => {
  try {
    console.log('🚀 라우터 직접 처리 시작');
    console.log('📋 req.params:', req.params);
    console.log('📋 req.body:', req.body);
    
    const { coin } = req.params;
    const { address } = req.body;
    
    console.log('💰 코인:', coin);
    console.log('📍 주소:', address);
    
    // 간단한 성공 응답
    const result = {
      success: true,
      message: '입금 주소가 저장되었습니다',
      data: { coin, address }
    };
    
    console.log('✅ 응답 데이터:', result);
    res.json(result);
    console.log('✅ 응답 전송 완료');
    
  } catch (error) {
    console.error('💥 라우터 직접 처리 오류:', error);
    console.error('💥 에러 스택:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: '라우터 직접 처리 오류'
    });
  }
});

// POST /api/wallet/withdraw - 출금 요청
// 사용자님 코드의 validateWithdraw 미들웨어는 우선 컨트롤러 내에서 처리합니다.
// router.post('/withdraw', authMiddleware, /* validateWithdraw, */ requestWithdrawal);

// GET /api/wallet/deposits - 입금 내역 조회
// router.get('/deposits', authMiddleware, getDeposits);

// GET /api/wallet/withdrawals - 출금 내역 조회
// router.get('/withdrawals', authMiddleware, getWithdrawals);

// GET /api/wallet/balance/:coin - 특정 코인 잔액 조회
// router.get('/balance/:coin', authMiddleware, getCoinBalance);

// GET /api/wallet/balances - 전체 코인 잔액 조회 (이전 버전에서 사용)
// router.get('/balances', authMiddleware, getUserBalances);

// GET /api/v1/wallet/whitelist-addresses/:coin - 특정 코인의 화이트리스트 주소 목록 조회
// router.get('/whitelist-addresses/:coin', authMiddleware, listWhitelist);

// POST /api/v1/wallet/whitelist-address - 화이트리스트 주소 추가
// router.post('/whitelist-address', authMiddleware, whitelistRateLimit, addWhitelist);

// DELETE /api/v1/wallet/whitelist-address/:id - 화이트리스트 주소 삭제
// router.delete('/whitelist-address/:id', authMiddleware, deleteWhitelist);

// POST /api/v1/wallet/whitelist/:id/confirm - 화이트리스트 확인
// router.post('/whitelist/:id/confirm', authMiddleware, confirmWhitelistAddress);

module.exports = router;
