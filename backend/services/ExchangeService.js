// backend/services/ExchangeService.js
const createExchangeService = () => {
  // 거래 엔진 상태 데이터 (실제 구현에서는 데이터베이스 사용)
  const markets = new Map();
  const orders = new Map();
  const trades = new Map();
  
  // 지원되는 마켓 초기화
  const initializeMarkets = () => {
    const defaultMarkets = [
      { symbol: 'BTC/KRW', baseCurrency: 'BTC', quoteCurrency: 'KRW', minOrderSize: 0.0001, pricePrecision: 0, quantityPrecision: 8 },
      { symbol: 'ETH/KRW', baseCurrency: 'ETH', quoteCurrency: 'KRW', minOrderSize: 0.01, pricePrecision: 0, quantityPrecision: 8 },
      { symbol: 'XRP/KRW', baseCurrency: 'XRP', quoteCurrency: 'KRW', minOrderSize: 10, pricePrecision: 2, quantityPrecision: 2 },
      { symbol: 'ADA/KRW', baseCurrency: 'ADA', quoteCurrency: 'KRW', minOrderSize: 10, pricePrecision: 2, quantityPrecision: 2 },
      { symbol: 'SOL/KRW', baseCurrency: 'SOL', quoteCurrency: 'KRW', minOrderSize: 0.1, pricePrecision: 0, quantityPrecision: 4 },
    ];
    
    defaultMarkets.forEach(market => {
      markets.set(market.symbol, {
        ...market,
        lastPrice: getRandomPrice(market.symbol),
        dailyChange: (Math.random() * 10 - 5).toFixed(2), // -5% ~ +5%
        dailyVolume: Math.floor(Math.random() * 1000000) + 100000,
        createdAt: Date.now(),
      });
    });
  };
  
  // 주문 생성
  const createOrder = (userId, orderData) => {
    try {
      const { symbol, side, type, price, quantity } = orderData;
      
      // 마켓 존재 여부 확인
      if (!markets.has(symbol)) {
        throw new Error(`Market not found: ${symbol}`);
      }
      
      // 주문 기본 검증
      validateOrder(orderData);
      
      // 주문 ID 생성
      const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // 주문 객체 생성
      const order = {
        id: orderId,
        userId,
        symbol,
        side, // 'buy' 또는 'sell'
        type, // 'limit', 'market', 'stop_limit' 등
        price: type === 'market' ? null : parseFloat(price),
        quantity: parseFloat(quantity),
        filledQuantity: 0,
        status: 'open', // 'open', 'filled', 'partially_filled', 'canceled'
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // 주문 저장
      orders.set(orderId, order);
      
      // 주문 매칭 시도 (실제 구현에서는 별도 프로세스로 처리)
      processOrder(order);
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  // 주문 취소
  const cancelOrder = (userId, orderId) => {
    try {
      const order = orders.get(orderId);
      
      // 주문 존재 여부 확인
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      
      // 본인 주문인지 확인
      if (order.userId !== userId) {
        throw new Error('Unauthorized access to order');
      }
      
      // 이미 완료된 주문인지 확인
      if (order.status === 'filled' || order.status === 'canceled') {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }
      
      // 주문 상태 업데이트
      order.status = 'canceled';
      order.updatedAt = Date.now();
      orders.set(orderId, order);
      
      return order;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  };
  
  // 주문 목록 조회
  const getOrders = (userId, filters = {}) => {
    try {
      const userOrders = Array.from(orders.values()).filter(order => order.userId === userId);
      
      // 필터 적용
      let filteredOrders = userOrders;
      
      if (filters.symbol) {
        filteredOrders = filteredOrders.filter(order => order.symbol === filters.symbol);
      }
      
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      
      if (filters.side) {
        filteredOrders = filteredOrders.filter(order => order.side === filters.side);
      }
      
      // 최신 주문순으로 정렬
      filteredOrders.sort((a, b) => b.createdAt - a.createdAt);
      
      return filteredOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };
  
  // 거래 내역 조회
  const getTrades = (userId, symbol) => {
    try {
      let userTrades = Array.from(trades.values()).filter(trade => 
        trade.buyerId === userId || trade.sellerId === userId
      );
      
      if (symbol) {
        userTrades = userTrades.filter(trade => trade.symbol === symbol);
      }
      
      // 최신 거래순으로 정렬
      userTrades.sort((a, b) => b.timestamp - a.timestamp);
      
      return userTrades;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  };
  
  // 마켓 정보 조회
  const getMarketInfo = (symbol) => {
    try {
      if (!symbol) {
        return Array.from(markets.values());
      }
      
      const market = markets.get(symbol);
      if (!market) {
        throw new Error(`Market not found: ${symbol}`);
      }
      
      return market;
    } catch (error) {
      console.error('Error fetching market info:', error);
      throw error;
    }
  };
  
  // ===== 헬퍼 함수 =====
  
  // 주문 검증
  const validateOrder = (orderData) => {
    const { symbol, side, type, price, quantity } = orderData;
    const market = markets.get(symbol);
    
    // 가격 검증 (limit 주문인 경우)
    if (type === 'limit' && (!price || price <= 0)) {
      throw new Error('Invalid price for limit order');
    }
    
    // 수량 검증
    if (!quantity || quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    
    // 최소 주문 크기 검증
    if (quantity < market.minOrderSize) {
      throw new Error(`Quantity must be at least ${market.minOrderSize} ${market.baseCurrency}`);
    }
    
    // 가격 단위 검증 (실제 구현에서는 tick size 고려)
  };
  
  // 주문 처리 및 매칭 (간단한 예시)
  const processOrder = (order) => {
    try {
      // 실제 구현에서는 복잡한 매칭 엔진 로직 적용
      // 시뮬레이션을 위해 50% 확률로 부분 체결, 30% 확률로 전체 체결, 20% 확률로 미체결 상태로 유지
      const rand = Math.random();
      
      if (rand < 0.3) {
        // 전체 체결
        executeOrder(order, order.quantity);
      } else if (rand < 0.8) {
        // 부분 체결
        const filledAmount = order.quantity * (Math.random() * 0.8 + 0.1); // 10% ~ 90% 체결
        executeOrder(order, filledAmount);
      }
      // 그 외 미체결 상태로 유지
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };
  
  // 주문 체결 처리
  const executeOrder = (order, fillAmount) => {
    try {
      // 원래 주문 복제
      const updatedOrder = { ...order };
      
      // 체결 수량 업데이트
      updatedOrder.filledQuantity = Math.min(order.quantity, fillAmount);
      
      // 상태 업데이트
      if (updatedOrder.filledQuantity >= order.quantity) {
        updatedOrder.status = 'filled';
      } else if (updatedOrder.filledQuantity > 0) {
        updatedOrder.status = 'partially_filled';
      }
      
      updatedOrder.updatedAt = Date.now();
      
      // 주문 저장
      orders.set(order.id, updatedOrder);
      
      // 거래 기록 생성
      if (updatedOrder.filledQuantity > 0) {
        const tradeId = `TRADE_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        const counterpartyId = `USER_${Math.floor(Math.random() * 1000)}`;
        
        const trade = {
          id: tradeId,
          symbol: order.symbol,
          price: order.price || markets.get(order.symbol).lastPrice,
          quantity: updatedOrder.filledQuantity,
          side: order.side,
          buyerId: order.side === 'buy' ? order.userId : counterpartyId,
          sellerId: order.side === 'sell' ? order.userId : counterpartyId,
          buyOrderId: order.side === 'buy' ? order.id : null,
          sellOrderId: order.side === 'sell' ? order.id : null,
          timestamp: Date.now(),
        };
        
        trades.set(tradeId, trade);
        
        // 마켓 정보 업데이트
        updateMarketInfo(trade);
      }
    } catch (error) {
      console.error('Error executing order:', error);
    }
  };
  
  // 마켓 정보 업데이트
  const updateMarketInfo = (trade) => {
    try {
      const market = markets.get(trade.symbol);
      if (!market) return;
      
      market.lastPrice = trade.price;
      market.dailyVolume += trade.quantity * trade.price;
      markets.set(trade.symbol, market);
    } catch (error) {
      console.error('Error updating market info:', error);
    }
  };
  
  // 랜덤 가격 생성 (심볼별 기준가 설정)
  const getRandomPrice = (symbol) => {
    let basePrice = 10000;
    if (symbol.startsWith('BTC')) basePrice = 30000000;
    if (symbol.startsWith('ETH')) basePrice = 2000000;
    if (symbol.startsWith('XRP')) basePrice = 500;
    if (symbol.startsWith('ADA')) basePrice = 400;
    if (symbol.startsWith('SOL')) basePrice = 50000;
    
    return basePrice + (Math.random() * 0.1 - 0.05) * basePrice;
  };
  
  // 서비스 초기화
  initializeMarkets();
  
  // 공개 인터페이스
  return {
    createOrder,
    cancelOrder,
    getOrders,
    getTrades,
    getMarketInfo,
  };
};

module.exports = createExchangeService;
