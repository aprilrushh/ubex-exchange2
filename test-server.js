// test-server.js
const express = require('express');
const http = require('http');
const cors = require('cors');

// 가장 기본적인 Express 앱 생성
const app = express();
const server = http.createServer(app);

// 기본 CORS 및 JSON 설정
app.use(cors());
app.use(express.json());

// 기본 라우트 추가
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// 서버 시작
const PORT = 3002; // 다른 포트 사용
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
