const socketIo = require('socket.io');

const initializeWebSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // 🔧 임시: 인증 없이 연결 허용
  io.on('connection', (socket) => {
    console.log('🔌 WebSocket 연결됨:', socket.id);
    
    // 연결 성공 메시지
    socket.emit('connected', { 
      status: 'success', 
      message: 'WebSocket connected successfully',
      socketId: socket.id 
    });

    // 구독 처리
    socket.on('subscribe', (data) => {
      console.log('📡 구독 요청:', data);
      
      if (data.channel === 'trades') {
        socket.join(`trades_${data.symbol}`);
        console.log(`📊 거래 내역 채널 구독: ${data.symbol}`);
        
        // 가짜 거래 데이터 주기적 전송 (테스트용)
        const interval = setInterval(() => {
          const fakeTradeData = {
            symbol: data.symbol,
            price: (67500 + Math.random() * 1000).toFixed(2),
            quantity: (Math.random() * 2).toFixed(6),
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            timestamp: new Date().toISOString()
          };
          
          socket.to(`trades_${data.symbol}`).emit('trade', fakeTradeData);
          socket.emit('trade', fakeTradeData); // 자신에게도 전송
        }, 5000); // 5초마다
        
        // 연결 해제 시 인터벌 정리
        socket.on('disconnect', () => {
          clearInterval(interval);
          console.log('🔌 WebSocket 연결 해제:', socket.id);
        });
      }
    });

    // 구독 해제 처리
    socket.on('unsubscribe', (data) => {
      console.log('📡 구독 해제:', data);
      if (data.channel === 'trades') {
        socket.leave(`trades_${data.symbol}`);
      }
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('💥 WebSocket 에러:', error);
    });
  });

  return io;
};

module.exports = { initializeWebSocket }; 