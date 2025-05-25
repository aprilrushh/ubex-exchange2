// backend/routes/tradeRoutes.js - 누락된 거래 API 추가

const express = require('express');
const router = express.Router();

// 🔧 거래 내역 조회 API
router.get('/trades', async (req, res) => {
  try {
    const { symbol, limit = 50 } = req.query;
    console.log('📊 거래 내역 조회 요청:', { symbol, limit });
    
    // 임시 더미 거래 데이터
    const dummyTrades = [
      {
        id: 1,
        symbol: symbol || 'BTC/USDT',
        price: '50000.00',
        amount: '0.001',
        side: 'buy',
        timestamp: new Date().toISOString(),
        fee: '0.1'
      },
      {
        id: 2,
        symbol: symbol || 'BTC/USDT',
        price: '49950.00',
        amount: '0.002',
        side: 'sell',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        fee: '0.1'
      },
      {
        id: 3,
        symbol: symbol || 'BTC/USDT',
        price: '50100.00',
        amount: '0.0015',
        side: 'buy',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        fee: '0.1'
      }
    ];
    
    // 심볼 필터링
    let filteredTrades = dummyTrades;
    if (symbol) {
      filteredTrades = dummyTrades.map(trade => ({
        ...trade,
        symbol: symbol
      }));
    }
    
    // 제한 적용
    const limitedTrades = filteredTrades.slice(0, parseInt(limit));
    
    console.log('📊 조회된 거래 내역:', limitedTrades.length, '건');
    
    res.json({
      success: true,
      data: limitedTrades,
      total: filteredTrades.length,
      symbol: symbol
    });
    
  } catch (error) {
    console.error('📊 거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '거래 내역 조회 실패'
    });
  }
});

// 🔧 코인 목록 조회 API
router.get('/coins', async (req, res) => {
  try {
    console.log('💰 코인 목록 조회 요청');
    
    const coins = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: '50000.00',
        change24h: '+2.5%',
        volume24h: '1000000000',
        marketCap: '950000000000'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: '3000.00',
        change24h: '+1.8%',
        volume24h: '500000000',
        marketCap: '360000000000'
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        price: '1.00',
        change24h: '0.0%',
        volume24h: '2000000000',
        marketCap: '90000000000'
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        price: '300.00',
        change24h: '+3.2%',
        volume24h: '100000000',
        marketCap: '46000000000'
      }
    ];
    
    res.json({
      success: true,
      data: coins,
      total: coins.length
    });
    
  } catch (error) {
    console.error('💰 코인 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '코인 목록 조회 실패'
    });
  }
});

// 🔧 오더북 조회 API
router.get('/orderbook', async (req, res) => {
  try {
    const { symbol } = req.query;
    console.log('📖 오더북 조회 요청:', symbol);
    
    const orderbook = {
      symbol: symbol || 'BTC/USDT',
      bids: [
        ['49950.00', '0.5'],
        ['49900.00', '1.2'],
        ['49850.00', '0.8'],
        ['49800.00', '2.1'],
        ['49750.00', '1.5']
      ],
      asks: [
        ['50050.00', '0.3'],
        ['50100.00', '0.9'],
        ['50150.00', '1.1'],
        ['50200.00', '0.7'],
        ['50250.00', '1.8']
      ],
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: orderbook
    });
    
  } catch (error) {
    console.error('📖 오더북 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '오더북 조회 실패'
    });
  }
});

// 🔧 가격 정보 조회 API
router.get('/ticker', async (req, res) => {
  try {
    const { symbol } = req.query;
    console.log('💹 가격 정보 조회 요청:', symbol);
    
    const ticker = {
      symbol: symbol || 'BTC/USDT',
      price: '50000.00',
      high24h: '51000.00',
      low24h: '48500.00',
      volume24h: '1000.5',
      change24h: '+1250.00',
      changePercent24h: '+2.56%',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: ticker
    });
    
  } catch (error) {
    console.error('💹 가격 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '가격 정보 조회 실패'
    });
  }
});

// 🔧 주문 생성 API
router.post('/orders', async (req, res) => {
  try {
    console.log('📝 주문 생성 요청:', req.body);
    const { symbol, side, type, amount, price } = req.body;
    
    if (!symbol || !side || !type || !amount) {
      return res.status(400).json({
        success: false,
        error: '필수 파라미터가 누락되었습니다'
      });
    }
    
    const order = {
      id: 'order_' + Date.now(),
      symbol,
      side,
      type,
      amount,
      price: price || '시장가',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    console.log('📝 주문 생성 완료:', order.id);
    
    res.json({
      success: true,
      message: '주문이 접수되었습니다',
      data: order
    });
    
  } catch (error) {
    console.error('📝 주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 생성 실패'
    });
  }
});

// 🔧 주문 내역 조회 API
router.get('/orders', async (req, res) => {
  try {
    const { symbol, status } = req.query;
    console.log('📋 주문 내역 조회 요청:', { symbol, status });
    
    const dummyOrders = [
      {
        id:
