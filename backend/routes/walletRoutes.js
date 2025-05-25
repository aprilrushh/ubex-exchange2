// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
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
  deleteWhitelist,
  confirmWhitelistAddress
} = require('../controllers/walletController');
const whitelistRateLimit = require('../middlewares/whitelistRateLimit');
// const { validateWithdraw } = require('../middlewares/validation'); // 유효성 검사 미들웨어 (추후 구현 시 사용)

// ETH 주소 검증 함수
function isValidEthAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// 입금 주소 관련
router.get('/deposit-address/:coin', getDepositAddress);
router.post('/deposit-address/:coin', setDepositAddress);

// 입금 내역 조회
router.get('/deposits', async (req, res) => {
  try {
    console.log('📋 입금 내역 조회 시작');
    const { coin, limit = 5, offset = 0 } = req.query;
    console.log('📋 쿼리 파라미터:', { coin, limit, offset });
    
    // 임시 더미 데이터 (나중에 실제 DB 조회로 변경)
    const dummyDeposits = [
      {
        id: 1,
        coin_symbol: 'ETH',
        amount: '0.05',
        tx_hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
        status: 'confirmed',
        confirmations: 12,
        created_at: new Date('2025-05-25T14:30:25'),
        block_number: 12345678
      },
      {
        id: 2,
        coin_symbol: 'ETH', 
        amount: '0.12',
        tx_hash: '0x5678901234abcdef5678901234abcdef56789012345678901234abcdef567890',
        status: 'confirmed',
        confirmations: 25,
        created_at: new Date('2025-05-25T13:15:42'),
        block_number: 12345650
      },
      {
        id: 3,
        coin_symbol: 'ETH',
        amount: '0.03',
        tx_hash: '0x9abcdef01234567890abcdef01234567890abcdef01234567890abcdef012345',
        status: 'pending',
        confirmations: 2,
        created_at: new Date('2025-05-25T12:05:18'),
        block_number: 12345690
      }
    ];
    
    // 코인 필터링
    let filteredDeposits = dummyDeposits;
    if (coin) {
      filteredDeposits = dummyDeposits.filter(d => d.coin_symbol === coin.toUpperCase());
    }
    
    // 제한 적용
    const limitedDeposits = filteredDeposits.slice(0, parseInt(limit));
    
    console.log('📋 조회된 입금 내역:', limitedDeposits.length, '건');
    
    res.json({
      success: true,
      data: limitedDeposits,
      total: filteredDeposits.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('💥 입금 내역 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: '입금 내역 조회 실패' 
    });
  }
});

// 출금 관련
router.post('/withdraw', authMiddleware, requestWithdrawal);
router.get('/withdrawals', authMiddleware, getWithdrawals);

// 잔액 조회
router.get('/balance/:coin', authMiddleware, getCoinBalance);
router.get('/balances', authMiddleware, getUserBalances);

// 화이트리스트 관련
router.get('/whitelist', authMiddleware, listWhitelist);
router.post('/whitelist', authMiddleware, addWhitelist);
router.delete('/whitelist/:id', authMiddleware, deleteWhitelist);
router.post('/whitelist/confirm', authMiddleware, confirmWhitelistAddress);

module.exports = router;
