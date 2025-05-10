// backend/services/marketDataService.js
const createMarketDataService = (exchangeService) => {
  // 내부 캐시 데이터 (실제 구현에서는 Redis 등 사용 권장)
  const cache = {
    prices: {},
    orderBooks: {},
    candlesticks: {}
  };

  // 실시간 가격 데이터 조회
  const getRealtimePrice = async (symbol) => {
    try {
      // 캐시된 데이터가 있으면 반환, 없으면 업데이트
      if (!cache.prices[symbol] || Date.now() - cache.prices[symbol].timestamp > 5000) {
        // 실제 구현에서는 외부 API 또는 내부 거래 엔진에서 데이터 가져옴
        const price = {
          symbol,
          price: generateRandomPrice(symbol),
          change: generateRandomChange(),
          volume: generateRandomVolume(),
          timestamp: Date.now()
        };
        cache.prices[symbol] = price;
      }
      return cache.prices[symbol];
    } catch (error) {
      console.error(`Error fetching realtime price for ${symbol}:`, error);
      throw error;
    }
  };
  
  // 캔들스틱 데이터 조회
  const getCandlestickData = async (symbol, interval, startTime, endTime) => {
    try {
      const cacheKey = `${symbol}-${interval}-${startTime}-${endTime}`;
      if (!cache.candlesticks[cacheKey]) {
        // 실제 구현에서는 DB나 거래 엔진에서 가져옴
        const candlesticks = generateCandlesticks(symbol, interval, startTime, endTime);
        cache.candlesticks[cacheKey] = {
          data: candlesticks,
          timestamp: Date.now()
        };
      }
      return cache.candlesticks[cacheKey].data;
    } catch (error) {
      console.error(`Error fetching candlestick data for ${symbol}:`, error);
      throw error;
    }
  };
  
  // 오더북 데이터 조회
  const getOrderBookDepth = async (symbol, depth = 50) => {
    try {
      if (!cache.orderBooks[symbol] || Date.now() - cache.orderBooks[symbol].timestamp > 2000) {
        // 실제 구현에서는 거래 엔진에서 오더북 데이터 가져옴
        const orderBook = {
          symbol,
          bids: generateOrderBookEntries(depth, true),
          asks: generateOrderBookEntries(depth, false),
          timestamp: Date.now()
        };
        cache.orderBooks[symbol] = orderBook;
      }
      return cache.orderBooks[symbol];
    } catch (error) {
      console.error(`Error fetching order book for ${symbol}:`, error);
      throw error;
    }
  };
  
  // 마켓 요약 정보 조회
  const getMarketSummary = async () => {
    try {
      const markets = ['BTC/KRW', 'ETH/KRW', 'XRP/KRW', 'ADA/KRW', 'SOL/KRW'];
      const summaries = await Promise.all(
        markets.map(async (symbol) => {
          const price = await getRealtimePrice(symbol);
          return {
            symbol,
            lastPrice: price.price,
            change24h: price.change,
            volume24h: price.volume,
            high24h: price.price * (1 + Math.random() * 0.05),
            low24h: price.price * (1 - Math.random() * 0.05)
          };
        })
      );
      return summaries;
    } catch (error) {
      console.error('Error fetching market summary:', error);
      throw error;
    }
  };
  
  // WebSocket 이벤트 구독 메커니즘
  const subscribeToMarketEvents = (socket, symbols) => {
    console.log(`Client subscribed to symbols: ${symbols.join(', ')}`);
    
    // 각 심볼에 대한 룸 구독
    symbols.forEach(symbol => {
      socket.join(`market-${symbol}`);
    });
    
    // 데이터 업데이트를 시뮬레이션하는 인터벌 설정
    const intervalId = setInterval(async () => {
      for (const symbol of symbols) {
        try {
          // 데이터 업데이트
          const price = await getRealtimePrice(symbol);
          const orderBook = await getOrderBookDepth(symbol, 10);
          
          // 클라이언트에 전송
          socket.emit('price-update', price);
          socket.emit('orderbook-update', orderBook);
        } catch (error) {
          console.error(`Error updating market data for ${symbol}:`, error);
        }
      }
    }, 1000); // 1초마다 업데이트
    
    // 소켓 연결 종료 시 정리
    socket.on('disconnect', () => {
      clearInterval(intervalId);
      console.log('Client unsubscribed from market events');
    });
    
    return () => clearInterval(intervalId); // 구독 취소 함수 반환
  };
  
  // 헬퍼 함수: 캔들스틱 데이터 생성
  const generateCandlesticks = (symbol, interval, startTime, endTime) => {
    const candlesticks = [];
    let currentTime = new Date(startTime).getTime();
    const endTimeMs = new Date(endTime).getTime();
    
    // 구간별 시간 간격 (ms)
    const intervalMs = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    }[interval] || 60 * 1000;
    
    let basePrice = 10000 + Math.random() * 40000; // KRW 기준 가격
    if (symbol.startsWith('BTC')) basePrice = 30000000 + Math.random() * 5000000;
    if (symbol.startsWith('ETH')) basePrice = 2000000 + Math.random() * 500000;
    
    while (currentTime < endTimeMs) {
      const volatility = 0.02; // 2% 변동성
      const changePercent = (Math.random() * 2 - 1) * volatility;
      
      const open = basePrice;
      const close = basePrice * (1 + changePercent);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 100) + 10;
      
      candlesticks.push({
        time: currentTime,
        open,
        high,
        low,
        close,
        volume
      });
      
      basePrice = close; // 다음 캔들의 기준가격으로 사용
      currentTime += intervalMs;
    }
    
    return candlesticks;
  };
  
  // 헬퍼 함수: 랜덤 가격 생성
  const generateRandomPrice = (symbol) => {
    // 심볼에 따른 기본 가격 범위 설정
    let basePrice = 10000;
    if (symbol.startsWith('BTC')) basePrice = 30000000;
    if (symbol.startsWith('ETH')) basePrice = 2000000;
    if (symbol.startsWith('XRP')) basePrice = 500;
    if (symbol.startsWith('ADA')) basePrice = 400;
    if (symbol.startsWith('SOL')) basePrice = 50000;
    
    // 랜덤 변동 추가
    return basePrice + (Math.random() * 0.1 - 0.05) * basePrice;
  };
  
  // 헬퍼 함수: 랜덤 변동율 생성
  con
