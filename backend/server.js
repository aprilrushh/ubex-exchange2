// 파일: ubex-exchange/server.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
// Allow overriding the port via environment variable for flexibility
const PORT = process.env.PORT || 3035;

// CORS 설정
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000'];
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Accept',
    'Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Origin',
    'Pragma'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24시간
}));

// OPTIONS 요청 처리
app.options('*', cors());

// Body parser
app.use(express.json());

// DB 초기화와 모델 동기화 (models/index.js 에서 Sequelize init)
const db = require('./models');
db.sequelize.authenticate()
  .then(() => db.sequelize.sync())
  .then(() => console.log('[DB] Connected and synced'))
  .catch(err => console.error('[DB] Error:', err));

// ─── 블록체인 리스너 일단 비활성화 ───
// const { startListening } = require('./services/blockchainListener');
// startListening();
// ─────────────────────────────────────

// 라우트 연결
const walletRoutes = require('./routes/walletRoutes');
const authRoutes = require('./routes/authRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const marketRoutes = require('./routes/marketRoutes');
const adminCoinRoutes = require('./routes/adminCoinRoutes');
const adminPairRoutes = require('./routes/adminPairRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminTransactionRoutes = require('./routes/adminTransactionRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminAuth = require('./middlewares/adminAuth');
const websocketService = require('./services/websocketService');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/orders', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.use('/api/admin', adminAuthRoutes); // login
app.use('/api/admin', adminAuth); // protect routes below
app.use('/api/admin/coins', adminCoinRoutes);
app.use('/api/admin/pairs', adminPairRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/transactions', adminTransactionRoutes);
app.use('/api/admin/stats', adminStatsRoutes);

// WebSocket 초기화
websocketService.initWebSocket(server);

// 서버 시작
server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
