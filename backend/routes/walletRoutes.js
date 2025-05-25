// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// 화이트리스트 조회 함수
const getWhitelist = async (userId) => {
  // 임시 더미 데이터
  return [
    {
      id: 1,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      label: '내 지갑',
      createdAt: new Date().toISOString()
    }
  ];
};

// 🔧 입금 주소 조회 API (코인별) - 프론트엔드 호환
router.get('/deposit-address/:coin', optionalAuth, async (req, res) => {
  try {
    const { coin } = req.params;
    console.log('💰 입금 주소 조회 요청:', coin);
    
    const userId = req.user?.id || 'default';
    const depositAddress = global.depositAddresses?.[userId];
    
    if (!depositAddress) {
      return res.json({
        success: true,
        data: null,
        message: '설정된 입금 주소가 없습니다'
      });
    }
    
    // 요청한 코인과 저장된 코인이 일치하는지 확인
    if (depositAddress.coin.toUpperCase() !== coin.toUpperCase()) {
      return res.json({
        success: true,
        data: null,
        message: `${coin} 입금 주소가 설정되지 않았습니다`
      });
    }
    
    res.json({
      success: true,
      data: {
        address: depositAddress.address,
        coin: depositAddress.coin,
        createdAt: depositAddress.createdAt
      }
    });
    
  } catch (error) {
    console.error('💰 입금 주소 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '입금 주소 조회 실패'
    });
  }
});

// 🔧 입금 주소 조회 API (일반) - 기존 호환성
router.get('/deposit-address', optionalAuth, async (req, res) => {
  try {
    console.log('💰 입금 주소 조회 요청 (일반)');
    
    const userId = req.user?.id || 'default';
    const depositAddress = global.depositAddresses?.[userId];
    
    if (!depositAddress) {
      return res.json({
        success: true,
        data: null,
        message: '설정된 입금 주소가 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: depositAddress
    });
    
  } catch (error) {
    console.error('💰 입금 주소 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '입금 주소 조회 실패'
    });
  }
});

// 🔧 입금 주소 설정 API (코인별) - 프론트엔드 호환
router.post('/deposit-address/:coin', optionalAuth, async (req, res) => {
  try {
    const { coin } = req.params;
    const { address } = req.body;
    
    console.log('💰 입금 주소 설정 요청:', { coin, address });
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: '주소가 필요합니다'
      });
    }
    
    // 주소 형식 검증 (Ethereum 주소)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ETH 주소입니다'
      });
    }
    
    const userId = req.user?.id || 'default';
    
    // 임시: 메모리에 저장 (나중에 DB로 변경)
    global.depositAddresses = global.depositAddresses || {};
    global.depositAddresses[userId] = {
      address,
      coin: coin.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('💰 입금 주소 저장 완료:', global.depositAddresses[userId]);
    
    res.json({
      success: true,
      message: '입금 주소가 설정되었습니다',
      data: {
        address,
        coin: coin.toUpperCase(),
        userId: userId
      }
    });
    
  } catch (error) {
    console.error('💰 입금 주소 설정 오류:', error);
    res.status(500).json({
      success: false,
      error: '입금 주소 설정 실패'
    });
  }
});

// 🔧 입금 주소 설정 API (일반) - 기존 호환성
router.post('/deposit-address', optionalAuth, async (req, res) => {
  try {
    console.log('💰 입금 주소 설정 요청 (일반)');
    const { address, coin = 'ETH' } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: '주소가 필요합니다'
      });
    }
    
    // 주소 형식 검증 (Ethereum 주소)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ETH 주소입니다'
      });
    }
    
    const userId = req.user?.id || 'default';
    
    global.depositAddresses = global.depositAddresses || {};
    global.depositAddresses[userId] = {
      address,
      coin,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: '입금 주소가 설정되었습니다',
      data: {
        address,
        coin,
        userId: userId
      }
    });
    
  } catch (error) {
    console.error('💰 입금 주소 설정 오류:', error);
    res.status(500).json({
      success: false,
      error: '입금 주소 설정 실패'
    });
  }
});

// 🚨 중요: 입금 내역 조회 API (404 오류 해결)
router.get('/deposits', optionalAuth, async (req, res) => {
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

// 🔧 화이트리스트 주소 조회 API (코인별)
router.get('/whitelist-addresses/:coin', optionalAuth, async (req, res) => {
  try {
    const { coin } = req.params;
    console.log('📋 화이트리스트 주소 조회:', coin);
    
    // 임시 더미 데이터
    const whitelist = [
      {
        id: 1,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        coin: coin.toUpperCase(),
        label: 'My Wallet',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: whitelist
    });
    
  } catch (error) {
    console.error('📋 화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 조회 실패'
    });
  }
});

// 🔧 화이트리스트 주소 추가 API
router.post('/whitelist-address', optionalAuth, async (req, res) => {
  try {
    const { address, coin, label } = req.body;
    console.log('📋 화이트리스트 주소 추가:', { address, coin, label });
    
    if (!address || !coin) {
      return res.status(400).json({
        success: false,
        error: '주소와 코인이 필요합니다'
      });
    }
    
    // 주소 형식 검증
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주소입니다'
      });
    }
    
    // 임시: 성공 응답
    res.json({
      success: true,
      message: '화이트리스트 주소가 추가되었습니다',
      data: {
        id: Date.now(),
        address,
        coin: coin.toUpperCase(),
        label: label || 'My Wallet',
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('📋 화이트리스트 추가 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 추가 실패'
    });
  }
});

// 🔧 화이트리스트 주소 삭제 API
router.delete('/whitelist-address/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 화이트리스트 주소 삭제:', id);
    
    // 임시: 성공 응답
    res.json({
      success: true,
      message: '화이트리스트 주소가 삭제되었습니다'
    });
    
  } catch (error) {
    console.error('📋 화이트리스트 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 삭제 실패'
    });
  }
});

// 🔧 잔고 조회 API
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    console.log('💰 잔고 조회 요청:', req.user?.id);
    
    // 임시 더미 잔고 데이터
    const dummyBalances = [
      {
        coin_symbol: 'ETH',
        available: '1.25000000',
        locked: '0.05000000',
        total: '1.30000000'
      },
      {
        coin_symbol: 'BTC',
        available: '0.00512000',
        locked: '0.00000000',
        total: '0.00512000'
      },
      {
        coin_symbol: 'USDT',
        available: '5420.50000000',
        locked: '100.00000000',
        total: '5520.50000000'
      }
    ];
    
    res.json({
      success: true,
      data: dummyBalances,
      userId: req.user?.id
    });
    
  } catch (error) {
    console.error('💰 잔고 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '잔고 조회 실패'
    });
  }
});

// 🔧 출금 요청 API
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    console.log('💸 출금 요청:', req.body);
    const { coin, amount, address, memo } = req.body;
    
    if (!coin || !amount || !address) {
      return res.status(400).json({
        success: false,
        error: '필수 파라미터가 누락되었습니다'
      });
    }
    
    // 임시: 출금 요청만 로그
    console.log('💸 출금 처리 중:', {
      userId: req.user?.id,
      coin,
      amount,
      address: address.slice(0, 6) + '...' + address.slice(-4)
    });
    
    res.json({
      success: true,
      message: '출금 요청이 접수되었습니다',
      data: {
        withdrawId: 'temp-' + Date.now(),
        status: 'pending',
        estimatedTime: '10-30분'
      }
    });
    
  } catch (error) {
    console.error('💸 출금 요청 오류:', error);
    res.status(500).json({
      success: false,
      error: '출금 요청 실패'
    });
  }
});

// 화이트리스트 조회 API
router.get('/whitelist', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const whitelist = await getWhitelist(userId);
    
    res.json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    console.error('화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 조회 실패'
    });
  }
});

module.exports = router;