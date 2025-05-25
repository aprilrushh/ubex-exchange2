const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const config = require('./config/config');
const WebSocketService = require('./services/websocketService');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const tradeRoutes = require('./routes/tradeRoutes');

const app = express();
const port = process.env.PORT || 3035;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://172.30.1.99:3000', 'http://192.168.1.99:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api', tradeRoutes);

// WebSocket 서비스 초기화
const wsService = new WebSocketService(app);

// tradeRoutes가 없는 경우를 위한 대체 라우트
if (!tradeRoutes) {
  console.log('⚠️ tradeRoutes.js가 없습니다. 직접 라우트 등록합니다.');
  
  // 직접 trades API 등록
  app.get('/api/trades', (req, res) => {
    const { symbol, limit = 50 } = req.query;
    
    const dummyTrades = [
      {
        id: 1,
        symbol: symbol || 'BTC/USDT',
        price: '50000.00',
        amount: '0.001',
        side: 'buy',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        symbol: symbol || 'BTC/USDT', 
        price: '49950.00',
        amount: '0.002',
        side: 'sell',
        timestamp: new Date(Date.now() - 60000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: dummyTrades.slice(0, parseInt(limit))
    });
  });
  
  // 직접 coins API 등록
  app.get('/api/coins', (req, res) => {
    const coins = [
      { symbol: 'BTC', name: 'Bitcoin', price: '50000.00' },
      { symbol: 'ETH', name: 'Ethereum', price: '3000.00' },
      { symbol: 'USDT', name: 'Tether', price: '1.00' }
    ];
    
    res.json({
      success: true,
      data: coins
    });
  });
}

// 서버 시작
app.listen(port, async () => {
    console.log(`🚀 ================================`);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📡 API: http://localhost:${port}`);
    console.log(`🌐 Network: http://172.30.1.99:${port}`);
    console.log(`🔌 WebSocket: active`);
    console.log(`✅ CORS: enabled`);
    
    if (process.env.NODE_ENV !== 'development') {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            console.log(`💾 Database: connected`);
        } catch (error) {
            console.error('[DB] Connection error:', error);
        }
    } else {
        console.log(`💾 Database: disabled (dev mode)`);
    }
    console.log(`🚀 ================================`);
}); 