const express = require('express');
const cors = require('cors');
const http = require('http');
const { initializeWebSocket } = require('./websocket/socketHandler');
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 🆕 라우터 import 추가
const walletRoutes = require('./routes/walletRoutes');
const marketRoutes = require('./routes/marketRoutes'); // 새로 추가
const tradeRoutes = require('./routes/tradeRoutes');   // 새로 추가

// 🆕 라우터 등록
app.use('/api/v1/wallet', walletRoutes);  // 기존
app.use('/api', marketRoutes);             // 새로 추가: /api/coins
app.use('/', tradeRoutes);                 // 새로 추가: /trades

// 기본 루트
app.get('/', (req, res) => {
  res.json({ 
    message: 'UBEX Exchange API Server',
    status: 'running',
    endpoints: [
      'GET /api/coins',
      'GET /api/coins/:symbol', 
      'GET /trades',
      'GET /orderbook/:symbol',
      'GET /ticker/:symbol',
      'GET /api/v1/wallet/deposit-address',
      'GET /api/v1/wallet/deposits'
    ]
  });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
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
      'GET /api/coins',
      'GET /trades',
      'GET /api/v1/wallet/deposits'
    ]
  });
});

// Express 앱을 HTTP 서버로 감싸기
const server = http.createServer(app);

// WebSocket 초기화
initializeWebSocket(server);

const PORT = process.env.PORT || 3035;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});

module.exports = app;
