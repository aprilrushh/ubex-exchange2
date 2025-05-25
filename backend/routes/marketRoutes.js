const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

/**
 * @swagger
 * /api/markets:
 *   get:
 *     summary: Retrieve default market tickers
 *   /api/markets/{exchange}/{symbol}:
 *     get:
 *       summary: Retrieve ticker from specific exchange
 */

router.get('/', marketController.getMarkets);
router.get('/:exchange/:symbol', marketController.getTicker);
router.get('/:exchange/:symbol/orderbook', marketController.getOrderBook);
router.get('/:exchange/:symbol/trades', marketController.getTrades);

// 코인 목록 조회 API
router.get('/coins', async (req, res) => {
  try {
    console.log('💰 코인 목록 조회 시작');
    
    // 임시 더미 데이터 (나중에 실제 API 또는 DB로 교체)
    const coinList = [
      {
        id: 1,
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 67500.00,
        price_change_24h: 1250.50,
        price_change_percentage_24h: 1.89,
        market_cap: 1320000000000,
        volume_24h: 45000000000,
        high_24h: 68200.00,
        low_24h: 66800.00,
        ath: 73000.00,
        image: '/images/coins/btc.png'
      },
      {
        id: 2,
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 3420.75,
        price_change_24h: -85.30,
        price_change_percentage_24h: -2.43,
        market_cap: 411000000000,
        volume_24h: 18000000000,
        high_24h: 3510.00,
        low_24h: 3380.00,
        ath: 4800.00,
        image: '/images/coins/eth.png'
      },
      {
        id: 3,
        symbol: 'USDT',
        name: 'Tether',
        current_price: 1.00,
        price_change_24h: 0.00,
        price_change_percentage_24h: 0.02,
        market_cap: 95000000000,
        volume_24h: 52000000000,
        high_24h: 1.001,
        low_24h: 0.999,
        ath: 1.32,
        image: '/images/coins/usdt.png'
      },
      {
        id: 4,
        symbol: 'BNB',
        name: 'BNB',
        current_price: 590.25,
        price_change_24h: 12.40,
        price_change_percentage_24h: 2.15,
        market_cap: 88000000000,
        volume_24h: 2100000000,
        high_24h: 595.00,
        low_24h: 580.00,
        ath: 720.00,
        image: '/images/coins/bnb.png'
      },
      {
        id: 5,
        symbol: 'SOL',
        name: 'Solana',
        current_price: 158.90,
        price_change_24h: 5.75,
        price_change_percentage_24h: 3.75,
        market_cap: 71000000000,
        volume_24h: 4200000000,
        high_24h: 162.00,
        low_24h: 152.00,
        ath: 260.00,
        image: '/images/coins/sol.png'
      }
    ];
    
    console.log('💰 조회된 코인 수:', coinList.length);
    
    res.json({
      success: true,
      data: coinList,
      total: coinList.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 코인 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '코인 목록 조회 실패',
      message: error.message
    });
  }
});

// 개별 코인 정보 조회 API
router.get('/coins/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('🔍 개별 코인 조회:', symbol);
    
    // 임시 더미 데이터
    const coinData = {
      symbol: symbol.toUpperCase(),
      name: symbol === 'btc' ? 'Bitcoin' : symbol === 'eth' ? 'Ethereum' : 'Unknown',
      current_price: symbol === 'btc' ? 67500 : symbol === 'eth' ? 3420 : 1,
      price_change_24h: symbol === 'btc' ? 1250 : symbol === 'eth' ? -85 : 0,
      price_change_percentage_24h: symbol === 'btc' ? 1.89 : symbol === 'eth' ? -2.43 : 0
    };
    
    res.json({
      success: true,
      data: coinData
    });
    
  } catch (error) {
    console.error('💥 개별 코인 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '코인 정보 조회 실패'
    });
  }
});

module.exports = router;
