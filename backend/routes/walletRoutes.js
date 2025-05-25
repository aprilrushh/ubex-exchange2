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

// 🔧 화이트리스트 조회 API (코인별) - 프론트엔드 호환
router.get('/whitelist/:coin', optionalAuth, async (req, res) => {
  try {
    const { coin } = req.params;
    console.log('🔒 화이트리스트 조회 요청:', coin);
    
    const userId = req.user?.id || 'default';
    const whitelist = global.whitelist?.[userId]?.[coin] || [];
    
    res.json({
      success: true,
      data: whitelist
    });
    
  } catch (error) {
    console.error('🔒 화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 조회 실패'
    });
  }
});

// 🔧 화이트리스트 조회 API (일반) - 기존 호환성
router.get('/whitelist', optionalAuth, async (req, res) => {
  try {
    console.log('🔒 화이트리스트 조회 요청 (일반)');
    
    const userId = req.user?.id || 'default';
    const whitelist = global.whitelist?.[userId] || {};
    
    res.json({
      success: true,
      data: whitelist
    });
    
  } catch (error) {
    console.error('🔒 화이트리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '화이트리스트 조회 실패'
    });
  }
});

module.exports = router;