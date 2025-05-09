// backend/engines/TradeEngine.js

/**
 * 거래소 거래 엔진
 * - 주문장(오더북) 관리
 * - 주문 매칭 및 처리
 * - 체결 내역 관리
 */
class TradeEngine {
  constructor() {
    // 모든 마켓(페어)의 주문장 관리
    this.orderBooks = {};
    // 모든 마켓(페어)의 최근 체결 내역
    this.tradeHistory = {};
    // 모든 마켓(페어)의 현재 시세
    this.tickers = {};
    // 이벤트 리스너
    this.listeners = {
      'order_created': [],
      'order_cancelled': [],
      'order_filled': [],
      'trade_executed': [],
      'ticker_updated': []
    };
  }

  /**
   * 마켓(페어) 초기화
   * @param {string} symbol - 마켓 심볼 (예: BTC/KRW)
   * @param {number} initialPrice - 초기 가격
   */
  initializeMarket(symbol, initialPrice) {
    if (!this.orderBooks[symbol]) {
      this.orderBooks[symbol] = {
        asks: [], // 매도 주문 배열 (낮은 가격순 정렬)
        bids: []  // 매수 주문 배열 (높은 가격순 정렬)
      };
      
      this.tradeHistory[symbol] = [];
      
      this.tickers[symbol] = {
        symbol,
        price: initialPrice,
        open: initialPrice,   // 시작가
        high: initialPrice,   // 고가
        low: initialPrice,    // 저가
        volume: 0,            // 거래량
        change: 0,            // 변동률
        changeAmount: 0,      // 변동액
        timestamp: Date.now()
      };
      
      console.log(`Market initialized: ${symbol} at ${initialPrice}`);
    }
  }

  /**
   * 주문 접수
   * @param {Object} order - 주문 정보
   * @returns {string} - 주문 ID
   */
  placeOrder(order) {
    const { 
      symbol, 
      type, // 'limit', 'market'
      side, // 'buy', 'sell'
      price, 
      amount, 
      userId 
    } = order;
    
    // 마켓이 존재하는지 확인
    if (!this.orderBooks[symbol]) {
      throw new Error(`Market not found: ${symbol}`);
    }
    
    // 주문 ID 생성
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 주문 객체 생성
    const newOrder = {
      id: orderId,
      symbol,
      type,
      side,
      price: type === 'limit' ? price : null,
      amount,
      filled: 0,         // 체결된 수량
      remaining: amount, // 남은 수량
      status: 'open',    // 'open', 'filled', 'cancelled'
      userId,
      timestamp: Date.now()
    };
    
    // 지정가 주문 처리
    if (type === 'limit') {
      if (side === 'buy') {
        // 매수 주문을 오더북에 추가하기 전에 매칭 시도
        this._matchBuyOrder(newOrder);
        
        // 완전히 체결되지 않은 경우 오더북에 추가
        if (newOrder.remaining > 0) {
          this._addToOrderBook(newOrder);
        }
      } else if (side === 'sell') {
        // 매도 주문을 오더북에 추가하기 전에 매칭 시도
        this._matchSellOrder(newOrder);
        
        // 완전히 체결되지 않은 경우 오더북에 추가
        if (newOrder.remaining > 0) {
          this._addToOrderBook(newOrder);
        }
      }
    } 
    // 시장가 주문 처리
    else if (type === 'market') {
      if (side === 'buy') {
        // 시장가 매수는 호가창의 매도 주문과 즉시 매칭
        this._matchMarketBuyOrder(newOrder);
      } else if (side === 'sell') {
        // 시장가 매도는 호가창의 매수 주문과 즉시 매칭
        this._matchMarketSellOrder(newOrder);
      }
    }
    
    // 주문 생성 이벤트 발생
    this._emitEvent('order_created', newOrder);
    
    return orderId;
  }

  /**
   * 주문 취소
   * @param {string} orderId - 취소할 주문 ID
   * @param {string} userId - 사용자 ID
   * @returns {boolean} - 취소 성공 여부
   */
  cancelOrder(orderId, userId) {
    let found = false;
    
    // 모든 마켓의 오더북 검색
    Object.keys(this.orderBooks).forEach(symbol => {
      const orderBook = this.orderBooks[symbol];
      
      // 매수 주문에서 검색
      for (let i = 0; i < orderBook.bids.length; i++) {
        if (orderBook.bids[i].id === orderId && orderBook.bids[i].userId === userId) {
          const cancelledOrder = orderBook.bids[i];
          cancelledOrder.status = 'cancelled';
          
          // 주문 취소 이벤트 발생
          this._emitEvent('order_cancelled', cancelledOrder);
          
          // 주문장에서 제거
          orderBook.bids.splice(i, 1);
          found = true;
          break;
        }
      }
      
      // 매도 주문에서 검색
      if (!found) {
        for (let i = 0; i < orderBook.asks.length; i++) {
          if (orderBook.asks[i].id === orderId && orderBook.asks[i].userId === userId) {
            const cancelledOrder = orderBook.asks[i];
            cancelledOrder.status = 'cancelled';
            
            // 주문 취소 이벤트 발생
            this._emitEvent('order_cancelled', cancelledOrder);
            
            // 주문장에서 제거
            orderBook.asks.splice(i, 1);
            found = true;
            break;
          }
        }
      }
    });
    
    return found;
  }

  /**
   * 오더북 상태 조회
   * @param {string} symbol - 마켓 심볼
   * @returns {Object} - 오더북 정보
   */
  getOrderBook(symbol) {
    if (!this.orderBooks[symbol]) {
      throw new Error(`Market not found: ${symbol}`);
    }
    
    // 깊은 복사를 통해 내부 상태 보호
    return {
      symbol,
      asks: [...this.orderBooks[symbol].asks],
      bids: [...this.orderBooks[symbol].bids],
      timestamp: Date.now()
    };
  }

  /**
   * 특정 마켓의 최근 체결 내역 조회
   * @param {string} symbol - 마켓 심볼
   * @returns {Array} - 체결 내역 배열
   */
  getTradeHistory(symbol) {
    if (!this.tradeHistory[symbol]) {
      return [];
    }
    
    return [...this.tradeHistory[symbol]];
  }

  /**
   * 모든 마켓의 시세 정보 조회
   * @returns {Object} - 시세 정보
   */
  getAllTickers() {
    const result = {};
    Object.keys(this.tickers).forEach(symbol => {
      result[symbol] = { ...this.tickers[symbol] };
    });
    return result;
  }

  /**
   * 특정 마켓의 시세 정보 조회
   * @param {string} symbol - 마켓 심볼
   * @returns {Object} - 시세 정보
   */
  getTicker(symbol) {
    if (!this.tickers[symbol]) {
      throw new Error(`Market not found: ${symbol}`);
    }
    
    return { ...this.tickers[symbol] };
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 유형
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 유형
   * @param {Function} callback - 콜백 함수
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // 내부 메서드: 주문장에 주문 추가
  _addToOrderBook(order) {
    const { symbol, side, price } = order;
    
    if (side === 'buy') {
      // 매수 주문은 가격 내림차순으로 정렬
      this.orderBooks[symbol].bids.push(order);
      this.orderBooks[symbol].bids.sort((a, b) => b.price - a.price);
    } else if (side === 'sell') {
      // 매도 주문은 가격 오름차순으로 정렬
      this.orderBooks[symbol].asks.push(order);
      this.orderBooks[symbol].asks.sort((a, b) => a.price - b.price);
    }
  }

  // 내부 메서드: 매수 주문 매칭
  _matchBuyOrder(buyOrder) {
    const { symbol, price, remaining } = buyOrder;
    const asks = this.orderBooks[symbol].asks;
    
    let remainingAmount = remaining;
    
    // 매칭 가능한 매도 주문이 있고, 가격 조건이 맞는 동안 반복
    while (remainingAmount > 0 && asks.length > 0 && asks[0].price <= price) {
      const sellOrder = asks[0];
      
      // 체결 수량 계산
      const matchAmount = Math.min(remainingAmount, sellOrder.remaining);
      const matchPrice = sellOrder.price; // 매도 주문의 가격으로 체결
      
      // 주문 업데이트
      remainingAmount -= matchAmount;
      buyOrder.filled += matchAmount;
      buyOrder.remaining = remainingAmount;
      
      sellOrder.filled += matchAmount;
      sellOrder.remaining -= matchAmount;
      
      // 체결 이벤트 생성
      this._createTrade(symbol, matchAmount, matchPrice, buyOrder.id, sellOrder.id, buyOrder.userId, sellOrder.userId);
      
      // 매도 주문이 완전히 체결되었으면 주문장에서 제거
      if (sellOrder.remaining === 0) {
        sellOrder.status = 'filled';
        this._emitEvent('order_filled', sellOrder);
        asks.shift();
      }
    }
    
    // 매수 주문 상태 업데이트
    if (remainingAmount === 0) {
      buyOrder.status = 'filled';
      this._emitEvent('order_filled', buyOrder);
    }
  }

  // 내부 메서드: 매도 주문 매칭
  _matchSellOrder(sellOrder) {
    const { symbol, price, remaining } = sellOrder;
    const bids = this.orderBooks[symbol].bids;
    
    let remainingAmount = remaining;
    
    // 매칭 가능한 매수 주문이 있고, 가격 조건이 맞는 동안 반복
    while (remainingAmount > 0 && bids.length > 0 && bids[0].price >= price) {
      const buyOrder = bids[0];
      
      // 체결 수량 계산
      const matchAmount = Math.min(remainingAmount, buyOrder.remaining);
      const matchPrice = buyOrder.price; // 매수 주문의 가격으로 체결
      
      // 주문 업데이트
      remainingAmount -= matchAmount;
      sellOrder.filled += matchAmount;
      sellOrder.remaining = remainingAmount;
      
      buyOrder.filled += matchAmount;
      buyOrder.remaining -= matchAmount;
      
      // 체결 이벤트 생성
      this._createTrade(symbol, matchAmount, matchPrice, buyOrder.id, sellOrder.id, buyOrder.userId, sellOrder.userId);
      
      // 매수 주문이 완전히 체결되었으면 주문장에서 제거
      if (buyOrder.remaining === 0) {
        buyOrder.status = 'filled';
        this._emitEvent('order_filled', buyOrder);
        bids.shift();
      }
    }
    
    // 매도 주문 상태 업데이트
    if (remainingAmount === 0) {
      sellOrder.status = 'filled';
      this._emitEvent('order_filled', sellOrder);
    }
  }

  // 내부 메서드: 시장가 매수 주문 매칭
  _matchMarketBuyOrder(buyOrder) {
    const { symbol, remaining } = buyOrder;
    const asks = this.orderBooks[symbol].asks;
    
    let remainingAmount = remaining;
    
    // 매칭 가능한 매도 주문이 있는 동안 반복
    while (remainingAmount > 0 && asks.length > 0) {
      const sellOrder = asks[0];
      
      // 체결 수량 계산
      const matchAmount = Math.min(remainingAmount, sellOrder.remaining);
      const matchPrice = sellOrder.price; // 매도 주문의 가격으로 체결
      
      // 주문 업데이트
      remainingAmount -= matchAmount;
      buyOrder.filled += matchAmount;
      buyOrder.remaining = remainingAmount;
      
      sellOrder.filled += matchAmount;
      sellOrder.remaining -= matchAmount;
      
      // 체결 이벤트 생성
      this._createTrade(symbol, matchAmount, matchPrice, buyOrder.id, sellOrder.id, buyOrder.userId, sellOrder.userId);
      
      // 매도 주문이 완전히 체결되었으면 주문장에서 제거
      if (sellOrder.remaining === 0) {
        sellOrder.status = 'filled';
        this._emitEvent('order_filled', sellOrder);
        asks.shift();
      }
    }
    
    // 시장가 주문은 체결되지 않은 수량이 있어도 주문장에 추가되지 않음
    buyOrder.status = remainingAmount > 0 ? 'partially_filled' : 'filled';
    this._emitEvent('order_filled', buyOrder);
  }

  // 내부 메서드: 시장가 매도 주문 매칭
  _matchMarketSellOrder(sellOrder) {
    const { symbol, remaining } = sellOrder;
    const bids = this.orderBooks[symbol].bids;
    
    let remainingAmount = remaining;
    
    // 매칭 가능한 매수 주문이 있는 동안 반복
    while (remainingAmount > 0 && bids.length > 0) {
      const buyOrder = bids[0];
      
      // 체결 수량 계산
      const matchAmount = Math.min(remainingAmount, buyOrder.remaining);
      const matchPrice = buyOrder.price; // 매수 주문의 가격으로 체결
      
      // 주문 업데이트
      remainingAmount -= matchAmount;
      sellOrder.filled += matchAmount;
      sellOrder.remaining = remainingAmount;
      
      buyOrder.filled += matchAmount;
      buyOrder.remaining -= matchAmount;
      
      // 체결 이벤트 생성
      this._createTrade(symbol, matchAmount, matchPrice, buyOrder.id, sellOrder.id, buyOrder.userId, sellOrder.userId);
      
      // 매수 주문이 완전히 체결되었으면 주문장에서 제거
      if (buyOrder.remaining === 0) {
        buyOrder.status = 'filled';
        this._emitEvent('order_filled', buyOrder);
        bids.shift();
      }
    }
    
    // 시장가 주문은 체결되지 않은 수량이 있어도 주문장에 추가되지 않음
    sellOrder.status = remainingAmount > 0 ? 'partially_filled' : 'filled';
    this._emitEvent('order_filled', sellOrder);
  }

  // 내부 메서드: 체결 내역 생성
  _createTrade(symbol, amount, price, buyOrderId, sellOrderId, buyUserId, sellUserId) {
    const trade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      amount,
      price,
      buyOrderId,
      sellOrderId,
      buyUserId,
      sellUserId,
      timestamp: Date.now()
    };
    
    // 체결 내역 추가
    this.tradeHistory[symbol].unshift(trade);
    if (this.tradeHistory[symbol].length > 100) {
      this.tradeHistory[symbol] = this.tradeHistory[symbol].slice(0, 100);
    }
    
    // 시세 정보 업데이트
    this._updateTicker(symbol, price, amount);
    
    // 체결 이벤트 발생
    this._emitEvent('trade_executed', trade);
    
    return trade;
  }

  // 내부 메서드: 시세 정보 업데이트
  _updateTicker(symbol, price, volume) {
    const ticker = this.tickers[symbol];
    
    // 기존 시세 정보가 없으면 생성
    if (!ticker) return;
    
    // 시세 정보 업데이트
    ticker.price = price;
    ticker.volume += volume;
    
    // 고가/저가 업데이트
    if (price > ticker.high) ticker.high = price;
    if (price < ticker.low) ticker.low = price;
    
    // 변동률/변동액 계산
    ticker.changeAmount = price - ticker.open;
    ticker.change = ((price / ticker.open) - 1) * 100;
    ticker.timestamp = Date.now();
    
    // 시세 업데이트 이벤트 발생
    this._emitEvent('ticker_updated', { ...ticker });
  }

  // 내부 메서드: 이벤트 발생
  _emitEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

module.exports = TradeEngine;
