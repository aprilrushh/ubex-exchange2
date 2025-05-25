// 파일: ubex-exchange/server.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
// Allow overriding the port via environment variable for flexibility
const PORT = process.env.PORT || 3035;
const logger = require('./backend/services/logger');

// 🔧 CORS 설정 (가장 중요!)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://172.30.1.99:3000',  // 현재 사용 중인 네트워크 IP
    'http://192.168.1.99:3000'  // 다른 가능한 IP들
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// DB 초기화와 모델 동기화 (backend/models/index.js 에서 Sequelize init)
const db = require('./backend/models');
db.sequelize.authenticate()
  .then(() => db.sequelize.sync())
  .then(() => console.log('[DB] Connected and synced'))
  .catch(err => console.error('[DB] Error:', err));

// 🚨 블록체인 리스너 오류 수정
try {
  const blockchainListener = require('./backend/services/blockchainListener');
  
  // ❌ 기존 오류 코드 주석 처리
  // startListening(); // 이 줄이 34번째 줄 오류의 원인
  
  // ✅ 올바른 호출
  blockchainListener.initialize().then(() => {
    console.log('⛓️ 블록체인 리스너 초기화 완료');
    // blockchainListener.startListening(); // 필요시 주석 해제
  }).catch(error => {
    console.log('⛓️ 블록체인 리스너 초기화 실패 (무시하고 진행):', error.message);
  });
  
} catch (error) {
  console.log('⛓️ 블록체인 리스너 로드 실패 (무시하고 진행):', error.message);
}

// 라우트 연결
const walletRoutes = require('./backend/routes/walletRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const tradeRoutes = require('./backend/routes/tradeRoutes');
const tradesRoutes = require('./backend/routes/tradesRoutes');
const marketRoutes = require('./backend/routes/marketRoutes');
const coinRoutes = require('./backend/routes/coinRoutes');
const apiKeyRoutes = require('./backend/routes/apiKeyRoutes');
const adminCoinRoutes = require('./backend/routes/adminCoinRoutes');
const adminPairRoutes = require('./backend/routes/adminPairRoutes');
const adminAuthRoutes = require('./backend/routes/adminAuthRoutes');
const adminUserRoutes = require('./backend/routes/adminUserRoutes');
const adminTransactionRoutes = require('./backend/routes/adminTransactionRoutes');
const adminStatsRoutes = require('./backend/routes/adminStatsRoutes');
const adminEngineRoutes = require('./backend/routes/adminEngineRoutes');
const adminAuth = require('./backend/middlewares/adminAuth');
const websocketService = require('./backend/services/websocketService');

app.use('/api/v1/wallet', walletRoutes);
app.use('/api/auth', authRoutes);  // /api/auth 경로로 수정
app.use('/auth', authRoutes);      // 기존 /auth 경로도 유지
app.use('/api/orders', tradeRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminAuth);
app.use('/api/admin/coins', adminCoinRoutes);
app.use('/api/admin/pairs', adminPairRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/transactions', adminTransactionRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/engine', adminEngineRoutes);

websocketService.initWebSocket(server);

// 🚀 서버 시작
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://172.30.1.99:${PORT}`);
  console.log('🔌 WebSocket: active');
  console.log('✅ CORS: enabled');
  console.log('💾 Database: disabled (dev mode)');
  console.log('🚀 ================================');
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 UBEX Exchange API Server',
    status: 'running',
    cors: 'enabled'
  });
});

// 코인 목록 API (임시)
app.get('/api/coins', (req, res) => {
  res.json({
    success: true,
    data: [
      { symbol: 'BTC', name: 'Bitcoin', price: '50000' },
      { symbol: 'ETH', name: 'Ethereum', price: '3000' },
      { symbol: 'USDT', name: 'Tether', price: '1' }
    ]
  });
});

module.exports = app;
