// backend/routes/tradeRoutes.js
const express = require('express');
const router = express.Router(); // Express 라우터 인스턴스 생성
const tradeController = require('../controllers/tradeController'); // 주문 관련 로직을 처리할 컨트롤러
const authMiddleware = require('../middlewares/authMiddleware'); // 사용자 인증을 위한 미들웨어

/**
 * @route   POST /api/orders
 * @desc    새로운 주문 생성
 * @access  Private (인증된 사용자만 접근 가능)
 */
router.post(
  '/', // 기본 경로 ('/api/orders'의 하위 경로이므로 '/'는 '/api/orders'를 의미)
  authMiddleware, // 이 라우트에 접근하기 전에 인증 미들웨어를 통과해야 함
  tradeController.createOrder // 인증 성공 시 tradeController의 createOrder 함수 실행
);

/**
 * @route   GET /api/orders
 * @desc    현재 로그인된 사용자의 주문 목록 조회
 * @access  Private (인증된 사용자만 접근 가능)
 */
router.get(
  '/', // 기본 경로 ('/api/orders'의 하위 경로이므로 '/'는 '/api/orders'를 의미)
  authMiddleware, // 이 라우트에 접근하기 전에 인증 미들웨어를 통과해야 함
  tradeController.getUserOrders // 인증 성공 시 tradeController의 getUserOrders 함수 실행
);

// 최근 거래 내역 조회 API
router.get('/trades', async (req, res) => {
  try {
    const { symbol, limit = 50 } = req.query;
    console.log('📊 거래 내역 조회:', { symbol, limit });
    
    // 임시 더미 거래 데이터
    const generateTradeData = (symbol, count) => {
      const trades = [];
      const basePrice = symbol === 'BTC/USDT' ? 67500 : symbol === 'ETH/USDT' ? 3420 : 1;
      
      for (let i = 0; i < count; i++) {
        const price = basePrice + (Math.random() - 0.5) * basePrice * 0.01; // ±1% 변동
        const quantity = Math.random() * 2; // 0-2 범위의 랜덤 수량
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        
        trades.push({
          id: Date.now() + i,
          symbol: symbol || 'BTC/USDT',
          price: price.toFixed(2),
          quantity: quantity.toFixed(6),
          side,
          timestamp: new Date(Date.now() - i * 60000).toISOString(), // 1분씩 이전
          total: (price * quantity).toFixed(2)
        });
      }
      
      return trades;
    };
    
    const trades = generateTradeData(symbol, parseInt(limit));
    
    console.log('📊 생성된 거래 내역:', trades.length, '개');
    
    res.json({
      success: true,
      data: trades,
      total: trades.length,
      symbol: symbol || 'BTC/USDT'
    });
    
  } catch (error) {
    console.error('💥 거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '거래 내역 조회 실패',
      message: error.message
    });
  }
});

// 오더북 조회 API
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('📖 오더북 조회:', symbol);
    
    const basePrice = symbol === 'BTCUSDT' ? 67500 : symbol === 'ETHUSDT' ? 3420 : 1;
    
    // 임시 오더북 데이터 생성
    const generateOrderbook = (basePrice) => {
      const bids = []; // 매수 주문
      const asks = []; // 매도 주문
      
      // 매수 주문 (가격이 높은 순서)
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * basePrice * 0.001; // 0.1%씩 낮은 가격
        const quantity = Math.random() * 5;
        bids.push([price.toFixed(2), quantity.toFixed(6)]);
      }
      
      // 매도 주문 (가격이 낮은 순서)
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * basePrice * 0.001; // 0.1%씩 높은 가격
        const quantity = Math.random() * 5;
        asks.push([price.toFixed(2), quantity.toFixed(6)]);
      }
      
      return { bids, asks };
    };
    
    const orderbook = generateOrderbook(basePrice);
    
    res.json({
      success: true,
      symbol,
      bids: orderbook.bids,
      asks: orderbook.asks,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 오더북 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '오더북 조회 실패'
    });
  }
});

// 24시간 통계 조회 API
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('📈 티커 조회:', symbol);
    
    const basePrice = symbol === 'BTCUSDT' ? 67500 : symbol === 'ETHUSDT' ? 3420 : 1;
    const change = (Math.random() - 0.5) * basePrice * 0.05; // ±5% 변동
    
    const ticker = {
      symbol,
      price: basePrice.toFixed(2),
      priceChange: change.toFixed(2),
      priceChangePercent: ((change / basePrice) * 100).toFixed(2),
      high: (basePrice * 1.03).toFixed(2),
      low: (basePrice * 0.97).toFixed(2),
      volume: (Math.random() * 1000000).toFixed(2),
      quoteVolume: (Math.random() * basePrice * 1000000).toFixed(2),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: ticker
    });
    
  } catch (error) {
    console.error('💥 티커 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '티커 조회 실패'
    });
  }
});

// 생성한 라우터를 모듈로 내보내서 server.js에서 사용할 수 있도록 함
module.exports = router;
