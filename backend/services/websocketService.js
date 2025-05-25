// backend/services/websocketService.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');
const createExchangeService = require('./ExchangeService');
const createMarketDataService = require('./marketDataService');

const INTERVAL_MS = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

class WebSocketService {
  constructor() {
    this.io = null;
    this.candlestickIntervals = {};
    const exchangeService = createExchangeService();
    this.marketDataService = createMarketDataService(exchangeService);
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
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

      console.log('[BE WS] Socket.IO 서버 초기화 완료. 클라이언트 연결 대기 중...');

      this.io.on('connection', (socket) => {
        console.log('[WS] Client connected:', socket.id);
        
        socket.on('subscribe', (data) => {
          console.log('[WS] Subscribe request:', data);
          socket.join(data.channel);
        });

        socket.on('unsubscribe', (data) => {
          console.log('[WS] Unsubscribe request:', data);
          socket.leave(data.channel);
        });

        socket.on('disconnect', () => {
          console.log('[WS] Client disconnected:', socket.id);
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

      // 블록 리스너 이벤트를 WebSocket 클라이언트에 전달하는 함수
      this.emitBlockEvent = (eventType, data) => {
        if (this.io) {
          this.io.to('blocks').emit('blockEvent', {
            type: eventType,
            data: data,
            timestamp: new Date().toISOString()
          });
        }
      };

      return this.io;
    } catch (error) {
      console.error('[BE WS] Socket.IO 서버 초기화 중 오류:', error);
      this.io = null;
      throw error;
    }
  }

  _parseCandlestickChannel(channel) {
    const match = /^candlestick:(.+):([^:]+)$/.exec(channel);
    if (!match) return null;
    return { symbol: match[1], interval: match[2] };
  }

  _startCandlestickUpdates(channel, symbol, interval) {
    const intervalMs = INTERVAL_MS[interval] || INTERVAL_MS['1m'];
    this.candlestickIntervals[channel] = setInterval(async () => {
      try {
        const endTime = Date.now();
        const startTime = endTime - intervalMs;
        const data = await this.marketDataService.getCandlestickData(
          symbol,
          interval,
          startTime,
          endTime
        );
        const candle = data[data.length - 1];
        this.io.to(channel).emit('candlestick', candle);
      } catch (err) {
        console.error('[BE WS] candlestick update error:', err);
      }
    }, intervalMs);
  }
}

// 클래스의 인스턴스를 생성하여 export 합니다.
const instance = new WebSocketService();
module.exports = instance; // 이 부분이 중요합니다.
