// 최소 Express 서버
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Express 앱 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 요청 로깅
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 기본 API 라우트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 인증 테스트 API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  
  // 간단한 인증 로직
  if (username && password) {
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: '123', username },
      token: 'sample-token-123'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Register attempt:', { username, password });
  
  // 간단한 등록 로직
  if (username && password) {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: '123', username },
      token: 'sample-token-123'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
});

// 간단한 테스트 HTML 페이지 제공
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>UBEX Minimal</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        button { padding: 10px; margin: 5px; cursor: pointer; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>UBEX Exchange Minimal Test</h1>
      
      <h2>Login Test</h2>
      <div>
        <input id="username" placeholder="Username" value="test" />
        <input id="password" type="password" placeholder="Password" value="password123" />
        <button id="loginBtn">Login</button>
        <button id="registerBtn">Register</button>
      </div>
      <pre id="result">Results will appear here...</pre>
      
      <script>
        document.getElementById('loginBtn').addEventListener('click', async () => {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').textContent = 'Error: ' + error.message;
          }
        });
        
        document.getElementById('registerBtn').addEventListener('click', async () => {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            document.getElementById('result').textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('result').textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// 서버 시작
const PORT = 3005; // 다른 포트 사용
app.listen(PORT, () => {
  console.log(`UBEX Minimal server running on port ${PORT}`);
});
// 마켓 정보 API (간단한 버전)
app.get('/api/markets', (req, res) => {
  // 더미 데이터로 응답
  res.json({
    success: true,
    markets: [
      { symbol: 'BTC/KRW', lastPrice: 31245000, change24h: '2.5', volume24h: 324500 },
      { symbol: 'ETH/KRW', lastPrice: 2103000, change24h: '1.3', volume24h: 156700 },
      { symbol: 'XRP/KRW', lastPrice: 530, change24h: '-0.8', volume24h: 87600 }
    ]
  });
});