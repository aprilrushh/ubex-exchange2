// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const socketIo = require('socket.io'); // WebSocket 지원을 위해 추가

// Express 앱 초기화
const app = express();
const server = http.createServer(app);

// Socket.IO 초기화
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 미들웨어 설정 - 라우트 정의 전에 설정해야 함
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket 변수 및 상태 관리
const subscribers = new Map();
const updateIntervals = new Map();

// WebSocket 이벤트 핸들러
io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);
  
  // 채널 구독 처리
  socket.on('subscribe', ({ channel }) => {
    console.log(`클라이언트 ${socket.id}가 채널 ${channel} 구독`);
    
    // 채널 구독자 목록에 추가
    if (!subscribers.has(channel)) {
      subscribers.set(channel, new Set());
    }
    subscribers.get(channel).add(socket.id);
    
    // 소켓을 채널에 조인
    socket.join(channel);
    
    // 최초 데이터 전송 (연결 직후)
    if (channel.startsWith('candlestick:')) {
      const [, symbol, timeframe] = channel.split(':');
      sendInitialCandlestickData(socket, symbol, timeframe);
      
      // 실시간 업데이트 시작
      if (!updateIntervals.has(channel)) {
        startCandlestickUpdates(channel);
      }
    }
  });
  
  // 채널 구독 해제 처리
  socket.on('unsubscribe', ({ channel }) => {
    console.log(`클라이언트 ${socket.id}가 채널 ${channel} 구독 해제`);
    
    // 채널 구독자 목록에서 제거
    if (subscribers.has(channel)) {
      subscribers.get(channel).delete(socket.id);
      
      // 구독자가 없으면 채널 목록에서 제거
      if (subscribers.get(channel).size === 0) {
        subscribers.delete(channel);
        
        // 실시간 업데이트 중지
        if (updateIntervals.has(channel)) {
          clearInterval(updateIntervals.get(channel));
          updateIntervals.delete(channel);
        }
      }
    }
    
    // 소켓을 채널에서 떠나게 함
    socket.leave(channel);
  });
  
  // 연결 해제 처리
  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
    
    // 모든 채널 구독자 목록에서 소켓 제거
    subscribers.forEach((socketIds, channel) => {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        
        // 구독자가 없으면 채널 목록에서 제거
        if (socketIds.size === 0) {
          subscribers.delete(channel);
          
          // 실시간 업데이트 중지
          if (updateIntervals.has(channel)) {
            clearInterval(updateIntervals.get(channel));
            updateIntervals.delete(channel);
          }
        }
      }
    });
  });
});

// 서비스 모듈 불러오기 - 2단계 (try/catch로 오류 처리)
try {
  const createExchangeService = require('./backend/services/ExchangeService');
  console.log('Exchange 서비스 로드 성공');
  
  // 다른 서비스들도 필요하다면 아래처럼 추가
  // const createWalletService = require('./backend/services/walletService');
  // const createMarketDataService = require('./backend/services/marketDataService');
  // const createBlockchainService = require('./backend/services/blockchainService');
  // const createSecurityService = require('./backend/services/securityService');
  
  // WebSocket 서비스 로드 시도
  try {
    const createWebSocketService = require('./backend/services/websocketService');
    console.log('WebSocket 서비스 로드 성공');
    // 서비스 초기화 (서비스 모듈에서 io 인스턴스를 사용할 수 있도록 전달)
    createWebSocketService(io);
  } catch (wsError) {
    console.log('WebSocket 서비스 로드 실패:', wsError.message);
    console.log('기본 WebSocket 기능을 사용합니다.');
  }
} catch (error) {
  console.error('서비스 모듈 로드 오류:', error.message);
  console.log('서비스 모듈 없이 기본 기능으로 계속합니다.');
}

// 로그인 API - 3단계 컨트롤러 사용 추가
app.post('/api/login', async (req, res) => {
  try {
    console.log('로그인 요청 수신:', req.body);
    console.log('헤더:', req.headers['content-type']);
    
    // req.body가 비어있는지 확인
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('요청 본문이 비어있습니다');
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 요청 본문'
      });
    }
    
    const { username, password } = req.body;
    console.log(`로그인 시도: 사용자명="${username}", 비밀번호="${password}"`);
    
    if (!username || !password) {
      console.log('사용자명 또는 비밀번호가 없습니다');
      return res.status(400).json({
        success: false,
        message: '사용자 이름과 비밀번호가 필요합니다'
      });
    }
    
    // 3단계: 컨트롤러 로드 시도
    try {
      console.log('컨트롤러 로드 시도 중...');
      const authController = require('./backend/controllers/authController');
      console.log('컨트롤러 로드 성공, login 메서드 호출');
      return authController.login(req, res);
    } catch (controllerError) {
      console.log('컨트롤러 로드 실패, 기본 인증 사용:', controllerError.message);
      
      // 기본 인증 로직 (이미 작동하는 코드)
      if (username === 'test' && password === 'test123') {
        console.log('로그인 성공 (fallback)');
        return res.json({
          success: true,
          message: '로그인 성공 (fallback)',
          userId: '123',
          username
        });
      } else {
        console.log('로그인 실패: 잘못된 인증 정보');
        return res.status(401).json({
          success: false,
          message: '잘못된 인증 정보'
        });
      }
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    return res.status(500).json({
      success: false,
      message: '로그인 중 오류 발생',
      error: error.message
    });
  }
});

// 회원가입 API - 3단계 컨트롤러 사용 추가
app.post('/api/register', async (req, res) => {
  try {
    console.log('회원가입 요청 수신:', req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 요청 본문'
      });
    }
    
    // 3단계: 컨트롤러 로드 시도
    try {
      console.log('컨트롤러 로드 시도 중...');
      const authController = require('./backend/controllers/authController');
      console.log('컨트롤러 로드 성공, register 메서드 호출');
      return authController.register(req, res);
    } catch (controllerError) {
      console.log('컨트롤러 로드 실패, 기본 회원가입 사용:', controllerError.message);
      
      // 기본 회원가입 로직
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '사용자 이름과 비밀번호가 필요합니다'
        });
      }
      
      // 간단한 회원가입 로직
      const userId = Date.now().toString();
      console.log('회원가입 성공 (fallback)');
      
      return res.json({
        success: true,
        message: '회원가입 성공 (fallback)',
        userId,
        username
      });
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류 발생',
      error: error.message
    });
  }
});

// 캔들스틱 차트 API 엔드포인트 추가
app.get('/api/candlestick/:symbol/:timeframe', (req, res) => {
  const { symbol, timeframe } = req.params;
  const candles = generateSampleCandlestickData(symbol, timeframe, 300);
  res.json(candles);
});

// 4단계: 라우트 설정
try {
  console.log('라우트 모듈 로드 시도 중...');
  const authRoutes = require('./backend/routes/authRoutes');
  console.log('authRoutes 모듈 로드 성공');
  
  // 라우트 추가
  app.use('/api/auth', authRoutes);
  console.log('인증 라우트 등록됨: /api/auth/*');
  
  // 다른 라우트도 필요하다면 추가
  // app.use('/api/wallet', walletRoutes);
  // app.use('/api/market', marketRoutes);
} catch (error) {
  console.error('라우트 모듈 로드 오류:', error.message);
  console.log('기본 API 엔드포인트로 계속 진행합니다.');
  
  // 기존 fallback 코드...
}

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});

// =========== WebSocket 헬퍼 함수 (웹소켓 서비스 모듈이 없을 때 사용) ===========

// 초기 캔들스틱 데이터 전송
function sendInitialCandlestickData(socket, symbol, timeframe) {
  try {
    // 샘플 데이터 생성
    const candlestickData = generateSampleCandlestickData(symbol, timeframe, 300);
    socket.emit(`candlestick:${symbol}:${timeframe}`, candlestickData[candlestickData.length - 1]);
  } catch (error) {
    console.error('초기 캔들스틱 데이터 전송 중 오류:', error.message);
  }
}

// 실시간 캔들스틱 업데이트 시작
function startCandlestickUpdates(channel) {
  try {
    // 업데이트 이미 실행 중이면 중복 실행 방지
    if (updateIntervals.has(channel)) {
      return;
    }
    
    const [, symbol, timeframe] = channel.split(':');
    
    // 업데이트 주기 설정 (timeframe에 따라 다르게 설정)
    let updateInterval;
    switch (timeframe) {
      case '1m': updateInterval = 1000; break; // 1초 (실제로는 분 단위)
      case '5m': updateInterval = 5000; break;
      case '15m': updateInterval = 15000; break;
      case '30m': updateInterval = 30000; break;
      case '1h': updateInterval = 60000; break;
      case '4h': updateInterval = 60000; break; // 데모용으로 1분마다 업데이트
      case '1d': updateInterval = 60000; break; // 데모용으로 1분마다 업데이트
      default: updateInterval = 5000;
    }
    
    // 마지막 캔들 데이터 저장
    let lastCandle = null;
    
    // 샘플 데이터 생성
    const initialData = generateSampleCandlestickData(symbol, timeframe, 1);
    lastCandle = { ...initialData[0] };
    
    // 주기적으로 업데이트
    const intervalId = setInterval(() => {
      try {
        // 구독자가 없으면 업데이트 중지
        if (!subscribers.has(channel) || subscribers.get(channel).size === 0) {
          clearInterval(intervalId);
          updateIntervals.delete(channel);
          return;
        }
        
        // 새로운 캔들 또는 업데이트된 캔들 생성
        const now = new Date();
        const currentMinute = Math.floor(now.getTime() / 60000) * 60;
        const currentTime = Math.floor(currentMinute / 1000);
        
        if (lastCandle && lastCandle.time === currentTime) {
          // 현재 진행 중인 캔들 업데이트
          const changePercent = (Math.random() * 0.006) - 0.003; // -0.3% ~ +0.3%
          const close = lastCandle.close * (1 + changePercent);
          const high = Math.max(lastCandle.high, close);
          const low = Math.min(lastCandle.low, close);
          const volume = lastCandle.volume + Math.random() * 5;
          
          lastCandle = {
            ...lastCandle,
            close,
            high,
            low,
            volume
          };
        } else {
          // 새 캔들 생성
          const open = lastCandle ? lastCandle.close : getBasePrice(symbol);
          const changePercent = (Math.random() * 0.01) - 0.005; // -0.5% ~ +0.5%
          const close = open * (1 + changePercent);
          const high = Math.max(open, close) * (1 + Math.random() * 0.003);
          const low = Math.min(open, close) * (1 - Math.random() * 0.003);
          const volume = Math.random() * 20 + 5;
          
          lastCandle = {
            time: currentTime,
            open,
            high,
            low,
            close,
            volume
          };
        }
        
        // 구독자에게 업데이트된 데이터 전송
        io.to(channel).emit(channel, lastCandle);
      } catch (error) {
        console.error('캔들스틱 업데이트 중 오류:', error.message);
      }
    }, updateInterval);
    
    // 간격 ID 저장
    updateIntervals.set(channel, intervalId);
  } catch (error) {
    console.error('캔들스틱 업데이트 시작 중 오류:', error.message);
  }
}

// 샘플 캔들스틱 데이터 생성
function generateSampleCandlestickData(symbol, timeframe, count) {
  try {
    const candles = [];
    const basePrice = getBasePrice(symbol);
    
    const now = new Date();
    let currentTime;
    
    // timeframe에 따른 시간 간격 설정
    let timeInterval;
    switch (timeframe) {
      case '1m': timeInterval = 60; break;
      case '5m': timeInterval = 300; break;
      case '15m': timeInterval = 900; break;
      case '30m': timeInterval = 1800; break;
      case '1h': timeInterval = 3600; break;
      case '4h': timeInterval = 14400; break;
      case '1d': timeInterval = 86400; break;
      default: timeInterval = 3600; // 기본값 1시간
    }
    
    // 현재 시간을 timeframe에 맞춰 조정
    currentTime = Math.floor(now.getTime() / (timeInterval * 1000)) * timeInterval;
    
    for (let i = count - 1; i >= 0; i--) {
      const time = currentTime - (i * timeInterval);
      const volatility = 0.01; // 변동성 조정
      const changePercent = (Math.random() * 2 - 1) * volatility;
      
      const open = i === count - 1 ? basePrice : candles[count - i - 2].close;
      const close = Math.max(open * (1 + changePercent), open * 0.9);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.floor(Math.random() * 100) + 10;
      
      candles.push({
        time: Math.floor(time / 1000),
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    return candles;
  } catch (error) {
    console.error('샘플 캔들스틱 데이터 생성 중 오류:', error.message);
    return [];
  }
}

// 심볼별 기본 가격 설정
function getBasePrice(symbol) {
  try {
    switch (symbol) {
      case 'BTC/USDT': return 50000 + Math.random() * 5000;
      case 'ETH/USDT': return 2000 + Math.random() * 200;
      case 'XRP/USDT': return 0.5 + Math.random() * 0.05;
      case 'SOL/USDT': return 100 + Math.random() * 10;
      case 'ADA/USDT': return 0.3 + Math.random() * 0.03;
      default: return 100 + Math.random() * 10;
    }
  } catch (error) {
    console.error('기본 가격 설정 중 오류:', error.message);
    return 100;
  }
}
