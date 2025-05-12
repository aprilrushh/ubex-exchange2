// src/services/websocketService.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.reconnectTimeout = null;
    this.currentSymbol = null;
    this.onMessageCallback = null;
  }

  /**
   * Binance WebSocket에 연결
   * @param {string} symbol - 거래쌍 심볼 (예: 'BTCUSDT')
   * @param {Function} onMessage - 메시지 수신 시 호출될 콜백 함수
   */
  connect(symbol, onMessage) {
    if (this.ws) {
      console.warn('이미 연결된 WebSocket이 있습니다. 먼저 disconnect()를 호출하세요.');
      return;
    }

    this.currentSymbol = symbol.toLowerCase();
    this.onMessageCallback = onMessage;

    const wsUrl = `wss://stream.binance.com:9443/ws/${this.currentSymbol}@ticker`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`WebSocket 연결 성공: ${this.currentSymbol}`);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const formattedData = {
          pair: data.s,
          price: parseFloat(data.c),
          timestamp: data.E
        };
        this.onMessageCallback(formattedData);
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket 연결 종료');
      this.ws = null;
      this.attemptReconnect();
    };
  }

  /**
   * 연결이 끊어진 경우 재연결 시도
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('최대 재연결 시도 횟수 초과');
      return;
    }

    this.reconnectAttempts++;
    console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.currentSymbol && this.onMessageCallback) {
        this.connect(this.currentSymbol, this.onMessageCallback);
      }
    }, this.reconnectDelay);
  }

  /**
   * WebSocket 연결 종료
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.currentSymbol = null;
    this.onMessageCallback = null;
    this.reconnectAttempts = 0;
  }
}

// 싱글톤 인스턴스 생성
const webSocketService = new WebSocketService();

export default webSocketService;