// backend/server.js
require('dotenv').config();
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
const PORT = process.env.PORT || 3035;

app.set('port', PORT);
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());

// DB 초기화와 모델 동기화
const db = require('./models');
db.sequelize.authenticate()
  .then(() => {
    console.log('[DB] Connected successfully.');
    return db.sequelize.sync({ alter: true }); // 개발 환경에서는 alter: true로 설정
  })
  .then(() => {
    console.log('[DB] Models synchronized.');
  })
  .catch(err => {
    console.error('[DB] Error:', err);
    process.exit(1); // DB 연결 실패 시 서버 종료
  });

// JWT 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// API 라우트 설정
app.use('/api/v1', authenticateToken, walletRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

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

// 포트 충돌 처리 개선
const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Backend HTTP and WebSocket server is running on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[${port}] 포트 ${port}가 이미 사용 중입니다. 다른 포트를 시도합니다...`);
      startServer(port + 1); // 다음 포트 시도
    } else {
      console.error(`[${port}] 서버 시작 오류:`, err.message);
    }
  });
};

startServer(PORT);

