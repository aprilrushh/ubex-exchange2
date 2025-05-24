// 파일: ubex-exchange/server.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);
// Allow overriding the port via environment variable for flexibility
const PORT = process.env.PORT || 3035;
const logger = require('./backend/services/logger');

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000',  // React 개발 서버 포트를 3000으로 수정
  credentials: true
}));

// Body parser
app.use(express.json());
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

// ─── 블록체인 리스너 일단 비활성화 ───
// const { startListening } = require('./backend/services/blockchainListener');
// startListening();
// ─────────────────────────────────────

// 라우트 연결
const walletRoutes = require('./backend/routes/walletRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const tradeRoutes = require('./backend/routes/tradeRoutes');
const marketRoutes = require('./backend/routes/marketRoutes');
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
app.use('/api/markets', marketRoutes);
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

// 서버 시작
server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
