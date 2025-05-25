// backend/app.js (또는 server.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// 🔧 CORS 설정
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔧 Socket.IO 설정
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// 전역 io 객체 설정 (블록체인 리스너에서 사용)
global.io = io;

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('[WS] Client connected:', socket.id);
  
  socket.on('subscribe', (data) => {
    console.log('[WS] Subscribe request:', data);
    socket.join(data.channel);
    socket.emit('subscribed', { channel: data.channel, status: 'success' });
  });
  
  socket.on('unsubscribe', (data) => {
    console.log('[WS] Unsubscribe request:', data);
    socket.leave(data.channel);
  });
  
  socket.on('disconnect', () => {
    console.log('[WS] Client disconnected:', socket.id);
  });
});

// 🔧 라우터 import
const walletRoutes = require('./routes/walletRoutes');
const marketRoutes = require('./routes/marketRoutes');
const tradeRoutes = require('./routes/tradeRoutes');

// 🚨 기본 공개 라우트 (인증 없음)
app.get('/', (req, res) => {
  res.json({
    message: 'UBEX Exchange API Server',
    status: 'running',
    mode: 'development (without database)',
    blockchain: 'connected',
    websocket: 'active',
    version: '1.0.0',
    endpoints: [
      'GET /api/coins',
      'GET /api/coins/:symbol',
      'GET /trades',
      'GET /orderbook/:symbol',
      'GET /ticker/:symbol',
      'GET /api/v1/wallet/deposit-address',
      'GET /api/v1/wallet/deposits'
    ],
    timestamp: new Date().toISOString()
  });
});

// 🚨 공개 상태 확인 라우트
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// 🔧 라우터 등록 (각 라우터에서 개별적으로 인증 처리)
app.use('/api/v1/wallet', walletRoutes);  // 지갑 관련 (일부 인증 필요)
app.use('/api', marketRoutes);             // 시장 데이터 (공개)
app.use('/', tradeRoutes);                 // 거래 데이터 (공개)

// 🔧 임시 데이터베이스 연결 비활성화
const initializeDatabase = async () => {
  if (process.env.SKIP_DB_CONNECTION === 'true') {
    console.log('🚫 데이터베이스 연결 건너뜀 (개발 모드)');
    return true;
  }
  
  try {
    console.log('💾 데이터베이스 연결 시도...');
    console.log('💾 데이터베이스: 임시 비활성화');
    return true;
  } catch (error) {
    console.error('💾 데이터베이스 연결 실패:', error.message);
    console.log('💾 더미 데이터 모드로 계속 진행...');
    return false;
  }
};

// 🔧 블록체인 리스너 초기화
const initializeBlockchainListener = async () => {
  try {
    const blockchainListener = require('./services/blockchainListener');
    await blockchainListener.initialize();
    
    // 감시할 주소 추가 (입금 주소)
    blockchainListener.addWatchedAddress('0x9726a5943D6e371FFC9FEc5Cb56FCDDB87f7b3d7');
    
    console.log('⛓️  블록체인 리스너 초기화 완료');
  } catch (error) {
    console.error('⛓️  블록체인 리스너 초기화 실패:', error.message);
  }
};

// 🔧 시장 데이터 초기화
const initializeMarkets = () => {
  try {
    // BTC/KRW 시장 초기화
    console.log('Market initialized: BTC/KRW at 0');
    
    // ETH/KRW 시장 초기화  
    console.log('Market initialized: ETH/KRW at 0');
    
    return true;
  } catch (error) {
    console.error('시장 초기화 실패:', error);
    return false;
  }
};

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 처리
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    requested: `${req.method} ${req.url}`,
    available: [
      'GET /',
      'GET /health',
      'GET /api/coins',
      'GET /trades',
      'GET /api/v1/wallet/deposits'
    ]
  });
});

// 서버 시작
const PORT = process.env.PORT || 3035;

const startServer = async () => {
  try {
    // 1. 시장 데이터 초기화
    initializeMarkets();
    
    // 2. 데이터베이스 초기화 (임시 비활성화)
    await initializeDatabase();
    
    // 3. 블록체인 리스너 초기화
    await initializeBlockchainListener();
    
    // 4. 서버 시작
    server.listen(PORT, () => {
      console.log('🚀 ================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: active`);
      console.log(`⛓️  Blockchain: listening`);
      console.log(`💾 Database: disabled (dev mode)`);
      console.log('🚀 ================================');
    });
    
  } catch (error) {
    console.error('💥 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 서버 시작
startServer();

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 서버 종료 중...');
  const blockchainListener = require('./services/blockchainListener');
  blockchainListener.stop();
  server.close(() => {
    console.log('🛑 서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});

module.exports = app;