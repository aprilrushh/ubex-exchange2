// src/services/websocketService.js
import { io } from 'socket.io-client';

// 더미 차트 데이터 생성 함수
const generateDummyChartData = () => {
  const data = [];
  let price = 50000;
  const now = Date.now();
  
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (100 - i) * 60000; // 1분 간격
    price = price + (Math.random() - 0.5) * 1000; // 랜덤 가격 변동
    data.push({
      time: timestamp,
      open: price,
      high: price + Math.random() * 100,
      low: price - Math.random() * 100,
      close: price + (Math.random() - 0.5) * 50,
      volume: Math.random() * 10
    });
  }
  return data;
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.subscribers = new Map();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.usePolling = false;
  }

  connect() {
    if (this.socket?.connected) {
      console.log('[WS] Socket already connected');
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('[WS] Connection in progress');
      return this.socket;
    }

    this.isConnecting = true;

    try {
      const token = localStorage.getItem('token');
      const options = {
        transports: this.usePolling ? ['polling'] : ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
        forceNew: false,
        path: '/socket.io/',
        autoConnect: true,
        withCredentials: true,
        auth: {
          token: token
        }
      };

      if (!this.socket) {
        console.log('[WS] Creating new socket connection');
        this.socket = io('http://localhost:3035', options);
      } else {
        console.log('[WS] Reusing existing socket connection');
        this.socket.connect();
      }

      this.socket.on('connect', () => {
        console.log('[WS] Connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.usePolling = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WS] Connection error:', error);
        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WS] Max reconnection attempts reached');
          if (!this.usePolling) {
            console.log('[WS] Switching to polling transport');
            this.usePolling = true;
            this.reconnectAttempts = 0;
            this.disconnect();
            this.connect();
          } else {
            this.socket.disconnect();
          }
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WS] Disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('error', (error) => {
        console.error('[WS] Socket error:', error);
      });

      // 기존 구독자들에게 이벤트 전달
      this.socket.onAny((event, ...args) => {
        const subscribers = this.subscribers.get(event) || [];
        subscribers.forEach(callback => {
          try {
            callback(...args);
          } catch (error) {
            console.error(`[WS] Error in subscriber callback for ${event}:`, error);
          }
        });
      });

      return this.socket;
    } catch (error) {
      console.error('[WS] Connection error:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscribers.clear();
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  on(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    
    if (!this.socket?.connected) {
      this.connect();
    }
  }

  off(event, callback) {
    if (this.subscribers.has(event)) {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[WS] Socket not connected, cannot emit event:', event);
      this.connect();
    }
  }

  subscribe(channel, callback) {
    if (!this.socket?.connected) {
      this.connect();
    }
    
    this.on(channel, callback);
    this.emit('subscribe', { channel });
    
    return () => {
      this.off(channel, callback);
      this.emit('unsubscribe', { channel });
    };
  }

  unsubscribe(channel) {
    this.emit('unsubscribe', { channel });
  }
}

const websocketService = new WebSocketService();
export default websocketService;
