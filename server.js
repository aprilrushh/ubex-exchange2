// 파일: ubex-exchange/server.js

const express = require('express');
const cors = require('cors');
const app = express();
// Allow overriding the port via environment variable for flexibility
const PORT = process.env.PORT || 3035;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3002',  // React 개발 서버 포트를 3002로 수정
  credentials: true
}));

// Body parser
app.use(express.json());

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

app.use('/api/v1', walletRoutes);
app.use('/api/auth', authRoutes);  // /api/auth 경로로 수정
app.use('/auth', authRoutes);      // 기존 /auth 경로도 유지

// 서버 시작
app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
