// backend/services/websocketService.js
const socketIo = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    console.log('[BE WS] WebSocketService constructor called');
    this.generateFakeMarketData = () => {
      const pairs = ['BTC/KRW', 'ETH/KRW'];
      const data = {};
      pairs.forEach(pair => {
        const price = pair === 'BTC/KRW' ? 50000000 + Math.random() * 100000 : 3000000 + Math.random() * 10000;
        const change = Math.random() * 10000 - 5000;
        const volume = Math.random() * 10;
        data[`ticker_${pair}`] = { symbol: pair, lastPrice: price.toFixed(0), change: change.toFixed(0), changeRate: ((change / (price - change)) * 100).toFixed(2), volume: volume.toFixed(4) };
        data[`trade_${pair}`] = { symbol: pair, price: price.toFixed(0), amount: (Math.random() * 0.1).toFixed(4), timestamp: Date.now(), type: Math.random() > 0.5 ? 'buy' : 'sell' };
        const bids = []; const asks = [];
        for (let i = 0; i < 5; i++) {
          bids.push({ price: (price - (i + 1) * 1000).toFixed(0), amount: (Math.random() * 1).toFixed(4) });
          asks.push({ price: (price + (i + 1) * 1000).toFixed(0), amount: (Math.random() * 1).toFixed(4) });
        }
        data[`orderbook_${pair}`] = { bids, asks };
        data[`chart_${pair}`] = { timestamp: Math.floor(Date.now() / 60000) * 60000, open: price - Math.random() * 5000, high: price + Math.random() * 5000, low: price - Math.random() * 5000, close: price, volume: volume };
      });
      return data;
    };
  }

  initWebSocket(httpServerInstance) {
    if (this.io) {
      console.log('[BE WS] WebSocket 서버가 이미 초기화되었습니다.');
      return this.io;
    }
    console.log('[BE WS] initWebSocket 메소드 실행됨');
    try {
      this.io = socketIo(httpServerInstance, {
        cors: {
          origin: "http://localhost:3002", // 프론트엔드 포트
          methods: ["GET", "POST"],
        },
        transports: ['websocket', 'polling']
      });

      console.log('[BE WS] Socket.IO 서버 초기화 완료. 클라이언트 연결 대기 중...');

      this.io.on('connection', (socket) => {
        console.log(`[BE WS] 새 클라이언트 연결 성공: ${socket.id}`);
        socket.on('disconnect', (reason) => {
          console.log(`[BE WS] 클라이언트 연결 해제: ${socket.id}, 이유: ${reason}`);
        });
        socket.on('subscribe', (channel) => {
          console.log(`[BE WS] 클라이언트 ${socket.id}가 ${channel} 구독 요청`);
          socket.join(channel);
        });
        socket.on('unsubscribe', (channel) => {
          console.log(`[BE WS] 클라이언트 ${socket.id}가 ${channel} 구독 해지 요청`);
          socket.leave(channel);
        });
        socket.on('error', (error) => {
            console.error(`[BE WS] 소켓 오류 (ID: ${socket.id}):`, error);
        });
      });

      this.io.engine.on("connection_error", (err) => {
        console.error(`[BE WS] Socket.IO 엔진 연결 오류: 코드=${err.code}, 메시지=${err.message}`);
      });

      setInterval(() => {
        if (this.io) {
          const marketData = this.generateFakeMarketData();
          this.io.emit('marketDataUpdate', marketData);
        }
      }, 2000);
      return this.io;
    } catch (error) {
      console.error('[BE WS] Socket.IO 서버 초기화 중 오류:', error);
      this.io = null;
      throw error;
    }
  }
}

// 클래스의 인스턴스를 생성하여 export 합니다.
const instance = new WebSocketService();
module.exports = instance; // 이 부분이 중요합니다.
