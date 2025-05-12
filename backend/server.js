// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
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
  console.log('GET /api/admin/coins 요청 받음'); // 요청 수신 로그 추가
  // 실제로는 데이터베이스에서 코인 목록을 조회해야 합니다.
  // 여기서는 샘플 데이터를 반환합니다.
  const sampleCoins = [
    { id: 1, symbol: 'BTC', name: 'Bitcoin', market_cap: '1000B USD', current_price: '50000 USD', status: 'active' },
    { id: 2, symbol: 'ETH', name: 'Ethereum', market_cap: '500B USD', current_price: '3000 USD', status: 'active' },
    { id: 3, symbol: 'SOL', name: 'Solana', market_cap: '80B USD', current_price: '150 USD', status: 'inactive' },
  ];
  res.json(sampleCoins); // JSON 형태로 코인 목록 응답
});

// --- 관리자 거래쌍 목록 API (새로 추가된 부분) ---
app.get('/api/admin/pairs', (req, res) => {
  console.log('GET /api/admin/pairs 요청 받음'); // 요청 수신 로그 추가
  // 실제로는 데이터베이스에서 거래쌍 목록을 조회해야 합니다.
  // 여기서는 샘플 데이터를 반환합니다.
  const samplePairs = [
    { id: 1, base_currency: 'BTC', quote_currency: 'KRW', symbol: 'BTC/KRW', status: 'active', min_trade_amount: 0.0001 },
    { id: 2, base_currency: 'ETH', quote_currency: 'KRW', symbol: 'ETH/KRW', status: 'active', min_trade_amount: 0.001 },
    { id: 3, base_currency: 'SOL', quote_currency: 'KRW', symbol: 'SOL/KRW', status: 'inactive', min_trade_amount: 0.1 },
    { id: 4, base_currency: 'ETH', quote_currency: 'BTC', symbol: 'ETH/BTC', status: 'active', min_trade_amount: 0.001 },
  ];
  res.json(samplePairs); // JSON 형태로 거래쌍 목록 응답
});


// 여기에 다른 /api/admin/ 관련 라우트들을 추가할 수 있습니다.
// 예: app.get('/api/admin/coins/:id', ...);
// 예: app.post('/api/admin/coins', ...);
// 예: app.put('/api/admin/coins/:id', ...);
// 예: app.get('/api/admin/pairs/:id', ...); 등등

// 서버 시작
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
