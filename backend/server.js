const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const config = require('./config/config');
const WebSocketService = require('./services/websocketService');
const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tradeRoutes = require('./routes/tradeRoutes');

const app = express();
const port = process.env.PORT || 3035;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 라우트 설정
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/trade', tradeRoutes);

// WebSocket 서비스 초기화
const wsService = new WebSocketService(app);

// 서버 시작
app.listen(port, async () => {
    console.log(`[Server] Listening on port ${port}`);
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('[DB] Connected and synced');
    } catch (error) {
        console.error('[DB] Connection error:', error);
    }
}); 