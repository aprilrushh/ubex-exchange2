// backend/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

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

// 🔧 화이트리스트 조회 API (코인별) - 프론트엔드 호환
router.get('/whitelist-addresses/:coin', optionalAuth, async (req, res) => {
  try {
    const { coin } = req.params;
    console.log('📝 화이트리스트 조회 요청:', coin);
    
    const userId = req.user?.id || 'default';
    
    // 임시 더미 데이터 (저장된 입금 주소 포함)
    const whitelist = [];
    
    // 저장된 입금 주소가 있으면 화이트리스트에 추가
    const depositAddress = global.depositAddresses?.[userId];
    if (depositAddress && depositAddress.coin.toUpperCase() === coin.toUpperCase()) {
      whitelist.push({
        id: 1,
        address: depositAddress.address,
        label: '내 입금 주소',
        coin: depositAddress.coin,
        createdAt: depositAddress.createdAt,
        verified: true
      });
    }
    
    // 추가 더미 데이터
    if (coin.toUpperCase() === 'ETH') {
      whitelist.push({
        id: 2,
        address: '0x742d35Cc7B6C2158532e3B8b7F9ea02E29a2D5F6',
        label: '예시 주소 1',
        coin: 'ETH',
        createdAt: new Date().toISOString(),
        verified: false
      });
    }
    
    res.json({
      success: true,
      data: whitelist,
      total: whitelist.length,
      coin: coin.toUpperCase()
    });
    
  } catch (error) {
    console.error('📝 화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 조회 실패'
    });
  }
});

// 🔧 화이트리스트 조회 API (일반) - 기존 호환성
router.get('/whitelist', optionalAuth, async (req, res) => {
  try {
    console.log('📝 화이트리스트 조회 요청 (일반)');
    
    const userId = req.user?.id || 'default';
    const whitelist = [];
    
    // 저장된 입금 주소가 있으면 포함
    const depositAddress = global.depositAddresses?.[userId];
    if (depositAddress) {
      whitelist.push({
        id: 1,
        address: depositAddress.address,
        label: '내 입금 주소',
        coin: depositAddress.coin,
        createdAt: depositAddress.createdAt,
        verified: true
      });
    }
    
    res.json({
      success: true,
      data: whitelist
    });
    
  } catch (error) {
    console.error('📝 화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 조회 실패'
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

module.exports = router;
// 🚨 누락된 API: 화이트리스트 주소 추가 API
// walletRoutes.js의 module.exports = router; 바로 위에 이 코드를 추가하세요

// 🔧 화이트리스트 주소 추가 API
router.post('/whitelist-address', optionalAuth, async (req, res) => {
  try {
    console.log('📝 화이트리스트 주소 추가 요청:', req.body);
    const { coin, address, label } = req.body;
    
    // 입력 검증
    if (!coin || !address || !label) {
      return res.status(400).json({
        success: false,
        error: '코인, 주소, 라벨이 모두 필요합니다'
      });
    }
    
    // 주소 형식 검증
    let isValidAddress = false;
    if (coin.toUpperCase() === 'ETH') {
      // Ethereum 주소 검증
      isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
    } else if (coin.toUpperCase() === 'BTC') {
      // Bitcoin 주소 검증 (간단한 형태)
      isValidAddress = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
                     /^bc1[a-z0-9]{39,59}$/.test(address);
    } else {
      // 기타 코인은 기본 검증
      isValidAddress = address.length > 10;
    }
    
    if (!isValidAddress) {
      return res.status(400).json({
        success: false,
        error: `유효하지 않은 ${coin.toUpperCase()} 주소입니다`
      });
    }
    
    const userId = req.user?.id || 'default';
    
    // 임시: 메모리에 저장 (나중에 DB로 변경)
    global.whitelistAddresses = global.whitelistAddresses || {};
    global.whitelistAddresses[userId] = global.whitelistAddresses[userId] || [];
    
    // 중복 주소 확인
    const existingAddress = global.whitelistAddresses[userId].find(
      item => item.address.toLowerCase() === address.toLowerCase() && 
              item.coin.toUpperCase() === coin.toUpperCase()
    );
    
    if (existingAddress) {
      return res.status(400).json({
        success: false,
        error: '이미 등록된 주소입니다'
      });
    }
    
    // 새 화이트리스트 주소 추가
    const newWhitelistItem = {
      id: Date.now(), // 임시 ID
      address,
      label,
      coin: coin.toUpperCase(),
      verified: false, // 초기에는 미검증
      createdAt: new Date().toISOString(),
      userId
    };
    
    global.whitelistAddresses[userId].push(newWhitelistItem);
    
    console.log('📝 화이트리스트 주소 추가 완료:', newWhitelistItem);
    console.log('📝 현재 화이트리스트:', global.whitelistAddresses[userId]);
    
    res.json({
      success: true,
      message: '화이트리스트 주소가 성공적으로 추가되었습니다',
      data: newWhitelistItem
    });
    
  } catch (error) {
    console.error('📝 화이트리스트 주소 추가 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 주소 추가 실패'
    });
  }
});

// 🔧 화이트리스트 주소 삭제 API (보너스)
router.delete('/whitelist-address/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'default';
    
    console.log('📝 화이트리스트 주소 삭제 요청:', { id, userId });
    
    if (!global.whitelistAddresses?.[userId]) {
      return res.status(404).json({
        success: false,
        error: '화이트리스트가 없습니다'
      });
    }
    
    const initialLength = global.whitelistAddresses[userId].length;
    global.whitelistAddresses[userId] = global.whitelistAddresses[userId].filter(
      item => item.id !== parseInt(id)
    );
    
    if (global.whitelistAddresses[userId].length === initialLength) {
      return res.status(404).json({
        success: false,
        error: '삭제할 주소를 찾을 수 없습니다'
      });
    }
    
    console.log('📝 화이트리스트 주소 삭제 완료');
    
    res.json({
      success: true,
      message: '화이트리스트 주소가 삭제되었습니다'
    });
    
  } catch (error) {
    console.error('📝 화이트리스트 주소 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 주소 삭제 실패'
    });
  }
});