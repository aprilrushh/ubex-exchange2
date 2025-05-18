// backend/server.js
const express = require('express');
const cors = require('cors');
const http = require('http'); // http 모듈 추가
const websocketService = require('./services/websocketService'); // WebSocket 서비스 불러오기

const app = express();
const server = http.createServer(app); // Express 앱으로 HTTP 서버 생성
const PORT = 3001; // 백엔드 서버 포트

app.use(cors()); // 모든 출처에서의 요청을 허용 (개발 중)
app.use(express.json()); // JSON 요청 본문을 파싱하기 위함

// --- 기존 포트폴리오 샘플 API ---
app.get('/api/portfolio/summary/:userId', (req, res) => {
  console.log(`GET /api/portfolio/summary/${req.params.userId} 요청 받음`);
  res.json({
    krw: 1000000,
    totalValue: 1500000,
    available: 900000,
    profit: 500000,
    profitRate: 50.0,
  });
});

app.get('/api/portfolio/assets/:userId', (req, res) => {
  console.log(`GET /api/portfolio/assets/${req.params.userId} 요청 받음`);
  res.json([
    { id: 1, symbol: 'BTC', name: '비트코인', amount: 0.1, value: 900000, profit: 200000, profitRate: 28.6 },
    { id: 2, symbol: 'ETH', name: '이더리움', amount: 2, value: 600000, profit: 300000, profitRate: 100.0 },
  ]);
});

// --- 관리자 코인 목록 API ---
app.get('/api/admin/coins', (req, res) => {
  console.log('GET /api/admin/coins 요청 받음');
  const sampleCoins = [
    { id: 1, symbol: 'BTC', name: 'Bitcoin', market_cap: '1000B USD', current_price: '50000 USD', status: 'active' },
    { id: 2, symbol: 'ETH', name: 'Ethereum', market_cap: '500B USD', current_price: '3000 USD', status: 'active' },
    { id: 3, symbol: 'SOL', name: 'Solana', market_cap: '80B USD', current_price: '150 USD', status: 'inactive' },
  ];
  res.json(sampleCoins);
});

// --- 관리자 거래쌍 목록 API ---
app.get('/api/admin/pairs', (req, res) => {
  console.log('GET /api/admin/pairs 요청 받음');
  const samplePairs = [
    { id: 1, base_currency: 'BTC', quote_currency: 'KRW', symbol: 'BTC/KRW', status: 'active', min_trade_amount: 0.0001 },
    { id: 2, base_currency: 'ETH', quote_currency: 'KRW', symbol: 'ETH/KRW', status: 'active', min_trade_amount: 0.001 },
    { id: 3, base_currency: 'SOL', quote_currency: 'KRW', symbol: 'SOL/KRW', status: 'inactive', min_trade_amount: 0.1 },
    { id: 4, base_currency: 'ETH', quote_currency: 'BTC', symbol: 'ETH/BTC', status: 'active', min_trade_amount: 0.001 },
  ];
  res.json(samplePairs);
});

// 여기에 다른 API 라우트들을 추가할 수 있습니다.

// WebSocket 서비스 초기화 (HTTP 서버 인스턴스 전달)
websocketService.initWebSocket(server);

// 서버 시작 (app.listen 대신 server.listen 사용)
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
