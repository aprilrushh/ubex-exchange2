// backend/services/websocketService.js
const createWebSocketService = (server, marketDataService) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*', // 실제 운영 환경에서는 특정 도메인으로 제한하세요
      methods: ['GET', 'POST']
    }
  });
  
  // 활성 연결 관리
  const activeConnections = new Map();
  // 구독 관리 (사용자별 구독 목록)
  const subscriptions = new Map();
  
// 초기화 및 연결 리스너 설정
const initialize = () => {
  io.on('connection', handleNewConnection);   
  console.log('WebSocket server initialized');
  
  // 시뮬레이션 데이터 설정 (개발 환경용)
  if (process.env.NODE_ENV !== 'production') {
    setupSimulationData();
  }
  
  return io;
};

// 시뮬레이션 데이터 설정 함수
const setupSimulationData = () => {
  console.log('실시간 시뮬레이션 데이터 설정 중...');
  
  // 가격 데이터 (시뮬레이션용)
  const priceData = {
    'BTC/USDT': 75000,
    'ETH/USDT': 4000,
    'SOL/USDT': 120,
    'LAYER/KRW': 2600
  };
  
  // 시뮬레이션용 거래 내역 생성 함수
  const generateTrade = (symbol) => {
    const price = priceData[symbol];
    const amount = parseFloat((Math.random() * 2).toFixed(4));
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const timestamp = new Date().toISOString();
    
    return { symbol, price, amount, type, timestamp };
  };
  
  // 매 초마다 가격 업데이트 (시뮬레이션)
  setInterval(() => {
    Object.keys(priceData).forEach(symbol => {
      // 0.5% 내외로 가격 변동
      const changePercent = (Math.random() - 0.48) * 1; 
      const change = priceData[symbol] * changePercent / 100;
      priceData[symbol] += change;
      
      // 가격 데이터 소수점 2자리까지 반올림
      priceData[symbol] = parseFloat(priceData[symbol].toFixed(2));
      
      // 모든 클라이언트에 가격 업데이트 전송
      try {
        broadcastMarketData(symbol, { 
          price: priceData[symbol],
          change: change,
          timestamp: new Date().toISOString()
        });
        console.log(`${symbol} 가격 업데이트: ${priceData[symbol].toFixed(2)}`);
      } catch (err) {
        console.error(`시장 데이터 브로드캐스트 오류:`, err.message);
      }
    });
  }, 2000); // 2초마다 업데이트
  
  // 매 2초마다 가상 거래 생성 (시뮬레이션)
  setInterval(() => {
    const symbols = Object.keys(priceData);
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const trade = generateTrade(randomSymbol);
    
    // 모든 클라이언트에 거래 데이터 전송
    try {
      broadcastTradeData(randomSymbol, trade);
      console.log(`${randomSymbol} 새 거래: ${trade.amount} @ ${trade.price.toFixed(2)}`);
    } catch (err) {
      console.error(`거래 데이터 브로드캐스트 오류:`, err.message);
    }
  }, 2000);
  
  console.log('시뮬레이션 데이터 설정 완료');
};
  
  // 새 클라이언트 연결 처리
  const handleNewConnection = (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // 연결 정보 저장
    activeConnections.set(socket.id, {
      id: socket.id,
      connectedAt: Date.now(),
      userId: null // 인증 후 설정됨
    });
    
    // 클라이언트 인증
    socket.on('authenticate', (data) => handleAuthentication(socket, data));
    
    // 마켓 데이터 구독
    socket.on('subscribe-market', (data) => handleMarketSubscription(socket, data));
    
    // 오더북 구독
    socket.on('subscribe-orderbook', (data) => handleOrderbookSubscription(socket, data));
    
    // 개인 채널 구독 (인증 필요)
    socket.on('subscribe-user', (data) => handleUserSubscription(socket, data));
    
    // 구독 취소
    socket.on('unsubscribe', (data) => handleUnsubscribe(socket, data));
    
    // 연결 종료
    socket.on('disconnect', () => handleDisconnect(socket));
  };
  
  // 클라이언트 인증 처리
  const handleAuthentication = (socket, { token, userId }) => {
    try {
      // 실제 구현에서는 토큰 유효성 검증
      const isValidToken = token && token.length > 10;
      
      if (isValidToken) {
        // 연결 정보 업데이트
        const connection = activeConnections.get(socket.id);
        activeConnections.set(socket.id, {
          ...connection,
          userId,
          authenticatedAt: Date.now()
        });
        
        // 인증 성공 알림
        socket.emit('auth-success', { userId });
        console.log(`User ${userId} authenticated on socket ${socket.id}`);
        
        // 사용자별 룸 참여
        socket.join(`user-${userId}`);
      } else {
        // 인증 실패 알림
        socket.emit('auth-failed', { error: 'Invalid token' });
        console.log(`Authentication failed for socket ${socket.id}`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('auth-failed', { error: 'Authentication error' });
    }
  };
  
  // 마켓 데이터 구독 처리
  const handleMarketSubscription = (socket, { symbols = [] }) => {
    try {
      if (!Array.isArray(symbols) || symbols.length === 0) {
        socket.emit('subscription-error', { 
          type: 'market', 
          error: 'Invalid symbols list' 
        });
        return;
      }
      
      console.log(`Socket ${socket.id} subscribing to markets: ${symbols.join(', ')}`);
      
      // 기존 구독 정보 가져오기
      const existingSubscriptions = subscriptions.get(socket.id) || {
        markets: new Set(),
        orderbooks: new Set(),
        user: false
      };
      
      // 새 심볼 추가
      symbols.forEach(symbol => {
        existingSubscriptions.markets.add(symbol);
        socket.join(`market-${symbol}`);
      });
      
      // 구독 정보 업데이트
      subscriptions.set(socket.id, existingSubscriptions);
      
      // 구독 확인 전송
      socket.emit('subscription-success', {
        type: 'market',
        symbols: Array.from(existingSubscriptions.markets)
      });
      
      // 최초 데이터 전송
      symbols.forEach(async (symbol) => {
        try {
          const marketData = await marketDataService.getRealtimePrice(symbol);
          socket.emit('market-update', { symbol, data: marketData });
        } catch (error) {
          console.error(`Error fetching initial market data for ${symbol}:`, error);
        }
      });
    } catch (error) {
      console.error('Market subscription error:', error);
      socket.emit('subscription-error', { 
        type: 'market', 
        error: 'Subscription error' 
      });
    }
  };
  
  // 오더북 구독 처리
  const handleOrderbookSubscription = (socket, { symbols = [] }) => {
    try {
      if (!Array.isArray(symbols) || symbols.length === 0) {
        socket.emit('subscription-error', { 
          type: 'orderbook', 
          error: 'Invalid symbols list' 
        });
        return;
      }
      
      console.log(`Socket ${socket.id} subscribing to orderbooks: ${symbols.join(', ')}`);
      
      // 기존 구독 정보 가져오기
      const existingSubscriptions = subscriptions.get(socket.id) || {
        markets: new Set(),
        orderbooks: new Set(),
        user: false
      };
      
      // 새 심볼 추가
      symbols.forEach(symbol => {
        existingSubscriptions.orderbooks.add(symbol);
        socket.join(`orderbook-${symbol}`);
      });
      
      // 구독 정보 업데이트
      subscriptions.set(socket.id, existingSubscriptions);
      
      // 구독 확인 전송
      socket.emit('subscription-success', {
        type: 'orderbook',
        symbols: Array.from(existingSubscriptions.orderbooks)
      });
      
      // 최초 데이터 전송
      symbols.forEach(async (symbol) => {
        try {
          const orderbookData = await marketDataService.getOrderBookDepth(symbol);
          socket.emit('orderbook-update', { symbol, data: orderbookData });
        } catch (error) {
          console.error(`Error fetching initial orderbook data for ${symbol}:`, error);
        }
      });
    } catch (error) {
      console.error('Orderbook subscription error:', error);
      socket.emit('subscription-error', { 
        type: 'orderbook', 
        error: 'Subscription error' 
      });
    }
  };
  
  // 사용자 채널 구독 처리 (인증 필요)
  const handleUserSubscription = (socket, { userId }) => {
    try {
      const connection = activeConnections.get(socket.id);
      
      // 인증 확인
      if (!connection || !connection.userId || connection.userId !== userId) {
        socket.emit('subscription-error', { 
          type: 'user', 
          error: 'Authentication required' 
        });
        return;
      }
      
      console.log(`Socket ${socket.id} subscribing to user channel for user ${userId}`);
      
      // 기존 구독 정보 가져오기
      const existingSubscriptions = subscriptions.get(socket.id) || {
        markets: new Set(),
        orderbooks: new Set(),
        user: false
      };
      
      // 사용자 채널 구독 설정
      existingSubscriptions.user = true;
      subscriptions.set(socket.id, existingSubscriptions);
      
      // 사용자별 룸 참여 (안전을 위해 다시 한번)
      socket.join(`user-${userId}`);
      
      // 구독 확인 전송
      socket.emit('subscription-success', {
        type: 'user',
        userId
      });
      
      // 사용자 초기 데이터 전송 (예: 주문 상태, 거래 내역 등)
      sendUserInitialData(socket, userId);
    } catch (error) {
      console.error('User subscription error:', error);
      socket.emit('subscription-error', { 
        type: 'user', 
        error: 'Subscription error' 
      });
    }
  };
  
  // 구독 취소 처리
  const handleUnsubscribe = (socket, { type, symbols = [] }) => {
    try {
      const existingSubscriptions = subscriptions.get(socket.id);
      if (!existingSubscriptions) return;
      
      if (type === 'market' && Array.isArray(symbols)) {
        symbols.forEach(symbol => {
          existingSubscriptions.markets.delete(symbol);
          socket.leave(`market-${symbol}`);
        });
      } else if (type === 'orderbook' && Array.isArray(symbols)) {
        symbols.forEach(symbol => {
          existingSubscriptions.orderbooks.delete(symbol);
          socket.leave(`orderbook-${symbol}`);
        });
      } else if (type === 'user') {
        existingSubscriptions.user = false;
        const connection = activeConnections.get(socket.id);
        if (connection && connection.userId) {
          socket.leave(`user-${connection.userId}`);
        }
      } else if (type === 'all') {
        // 모든 구독 취소
        const connection = activeConnections.get(socket.id);
        
        existingSubscriptions.markets.forEach(symbol => {
          socket.leave(`market-${symbol}`);
        });
        
        existingSubscriptions.orderbooks.forEach(symbol => {
          socket.leave(`orderbook-${symbol}`);
        });
        
        if (connection && connection.userId) {
          socket.leave(`user-${connection.userId}`);
        }
        
        existingSubscriptions.markets.clear();
        existingSubscriptions.orderbooks.clear();
        existingSubscriptions.user = false;
      }
      
      // 구독 정보 업데이트
      subscriptions.set(socket.id, existingSubscriptions);
      
      console.log(`Unsubscribed socket ${socket.id} from ${type} channels`);
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  };
  
  // 연결 종료 처리
  const handleDisconnect = (socket) => {
    try {
      console.log(`Client disconnected: ${socket.id}`);
      
      // 연결 및 구독 정보 정리
      activeConnections.delete(socket.id);
      subscriptions.delete(socket.id);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
  
  // 사용자 초기 데이터 전송
  const sendUserInitialData = (socket, userId) => {
    try {
      // 실제 구현에서는 사용자의 주문, 잔고, 알림 등을 조회하여 전송
      socket.emit('user-orders', {
        pendingOrders: [], // 대기 중인 주문
        completedOrders: [] // 최근 체결된 주문
      });
      
      socket.emit('user-balance', {
        balances: [] // 사용자 잔고 정보
      });
      
      socket.emit('user-notifications', {
        notifications: [] // 사용자 알림
      });
    } catch (error) {
      console.error(`Error sending initial user data for ${userId}:`, error);
    }
  };
  
  // 마켓 데이터 브로드캐스트
  const broadcastMarketData = (symbol, data) => {
    io.to(`market-${symbol}`).emit('market-update', { symbol, data });
  };
  
  // 오더북 데이터 브로드캐스트
  const broadcastOrderbookData = (symbol, data) => {
    io.to(`orderbook-${symbol}`).emit('orderbook-update', { symbol, data });
  };
  
  // 체결 내역 브로드캐스트
  const broadcastTradeData = (symbol, trade) => {
    io.to(`market-${symbol}`).emit('trade', { symbol, trade });
  };
  
  // 특정 사용자에게 알림 전송
  const sendUserNotification = (userId, type, data) => {
    io.to(`user-${userId}`).emit(type, data);
  };
  
  // 주문 상태 업데이트 전송
  const sendOrderUpdate = (userId, order) => {
    io.to(`user-${userId}`).emit('order-update', { order });
  };
  
  // 잔고 업데이트 전송
  const sendBalanceUpdate = (userId, balance) => {
    io.to(`user-${userId}`).emit('balance-update', { balance });
  };
  
  // 모든 연결된 클라이언트에 메시지 브로드캐스트
  const broadcastGlobal = (event, data) => {
    io.emit(event, data);
  };
  
  // 마켓 데이터 실시간 업데이트 시작
  const startMarketUpdates = () => {
    // 지원하는 마켓 목록
    const markets = ['BTC/KRW', 'ETH/KRW', 'XRP/KRW', 'ADA/KRW', 'SOL/KRW'];
    
    // 각 마켓별 업데이트 간격 (밀리초)
    const updateIntervals = {
      'BTC/KRW': 1000, // 1초
      'ETH/KRW': 1500, // 1.5초
      'XRP/KRW': 2000, // 2초
      'ADA/KRW': 3000, // 3초
      'SOL/KRW': 2500  // 2.5초
    };
    
    // 각 마켓별 업데이트 인터벌 설정
    const intervalIds = markets.map(symbol => {
      return setInterval(async () => {
        try {
          // 마켓 데이터 가져오기
          const marketData = await marketDataService.getRealtimePrice(symbol);
          
          // 연결된 클라이언트가 있는 경우에만 브로드캐스트
          const roomSize = io.sockets.adapter.rooms.get(`market-${symbol}`)?.size || 0;
          if (roomSize > 0) {
            broadcastMarketData(symbol, marketData);
          }
          
          // 랜덤하게 체결 생성 (테스트용)
          if (Math.random() < 0.3) { // 30% 확률로 체결 발생
            const trade = generateTrade(symbol, marketData.price);
            broadcastTradeData(symbol, trade);
          }
        } catch (error) {
          console.error(`Error updating market data for ${symbol}:`, error);
        }
      }, updateIntervals[symbol] || 2000);
    });
    
    // 오더북 업데이트 인터벌 설정
    const orderbookIntervalIds = markets.map(symbol => {
      return setInterval(async () => {
        try {
          // 오더북 데이터 가져오기
          const orderbookData = await marketDataService.getOrderBookDepth(symbol);
          
          // 연결된 클라이언트가 있는 경우에만 브로드캐스트
          const roomSize = io.sockets.adapter.rooms.get(`orderbook-${symbol}`)?.size || 0;
          if (roomSize > 0) {
            broadcastOrderbookData(symbol, orderbookData);
          }
        } catch (error) {
          console.error(`Error updating orderbook data for ${symbol}:`, error);
        }
      }, 3000); // 3초마다 업데이트
    });
    
    // 인터벌 정리 함수 반환
    return () => {
      intervalIds.forEach(id => clearInterval(id));
      orderbookIntervalIds.forEach(id => clearInterval(id));
    };
  };
  
  // 테스트용 체결 데이터 생성 함수
  const generateTrade = (symbol, basePrice) => {
    const volume = (Math.random() * 2 + 0.01).toFixed(8);
    const isBuy = Math.random() > 0.5;
    const price = isBuy 
      ? basePrice * (1 + Math.random() * 0.002) 
      : basePrice * (1 - Math.random() * 0.002);
    
    return {
      id: `trade_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      symbol,
      price: price.toFixed(2),
      volume,
      side: isBuy ? 'buy' : 'sell',
      timestamp: Date.now()
    };
  };
  
  // 연결 상태 통계 조회
  const getConnectionStats = () => {
    return {
      totalConnections: activeConnections.size,
      authenticatedConnections: Array.from(activeConnections.values()).filter(c => c.userId).length,
      marketSubscriptions: Array.from(subscriptions.values()).reduce((total, sub) => total + sub.markets.size, 0),
      orderbookSubscriptions: Array.from(subscriptions.values()).reduce((total, sub) => total + sub.orderbooks.size, 0),
      userSubscriptions: Array.from(subscriptions.values()).filter(sub => sub.user).length
    };
  };
  
  return {
    initialize,
    broadcastMarketData,
    broadcastOrderbookData,
    broadcastTradeData,
    sendUserNotification,
    sendOrderUpdate,
    sendBalanceUpdate,
    broadcastGlobal,
    startMarketUpdates,
    getConnectionStats,
    io // Socket.IO 인스턴스 반환
  };
};

module.exports = createWebSocketService;
