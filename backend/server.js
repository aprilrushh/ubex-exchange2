// backend/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const websocketService = require('./services/websocketService');
const authMiddleware = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const walletRoutes = require('./routes/walletRoutes');

console.log('[BE Server] typeof websocketService:', typeof websocketService);
if (websocketService) {
  console.log('[BE Server] websocketService.initWebSocket exists:', typeof websocketService.initWebSocket === 'function');
} else {
  console.log('[BE Server] websocketService is null or undefined');
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3035; // 포트를 3035로 변경
const JWT_SECRET = 'mySuperSecretKeyForUbexExchange2025!'; // 중앙 설정 권장

app.set('port', PORT);
app.use(cors());
app.use(express.json());

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/orders', tradeRoutes);
app.use('/api/wallet', walletRoutes);

// 임시 포트폴리오 및 관리자 API (라우트 파일로 분리 권장)
app.get('/api/portfolio/summary', authMiddleware, (req, res) => {
  const userId = req.user.id;
  res.json({ krw: 1000000 + userId, totalValue: 1500000 + userId });
});
app.get('/api/portfolio/assets', authMiddleware, (req, res) => {
  const userId = req.user.id;
  res.json([ { id: 1, symbol: 'BTC', amount: 0.1 * userId }, { id: 2, symbol: 'ETH', amount: 2 * userId } ]);
});
app.get('/api/admin/coins', (req, res) => { res.json([]); });
app.get('/api/admin/pairs', (req, res) => { res.json([]); });

console.log(`[${PORT}] WebSocket 초기화 시도...`);
if (websocketService && typeof websocketService.initWebSocket === 'function') {
  try {
    websocketService.initWebSocket(server);
    console.log(`[${PORT}] websocketService.initWebSocket 호출 성공`);
  } catch (error) {
    console.error(`[${PORT}] websocketService.initWebSocket 호출 중 오류:`, error);
  }
} else {
  console.error(`[${PORT}] backend/services/websocketService 또는 initWebSocket 함수를 찾을 수 없습니다.`);
}

server.listen(PORT, () => {
  console.log(`Backend HTTP and WebSocket server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error(`[${PORT}] 서버 시작 오류:`, err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`[${PORT}] 포트 ${PORT}가 이미 사용 중입니다.`);
  }
});

