// backend/controllers/tradeController.js

// 임시 주문 저장소 (서버 재시작 시 초기화됨)
let orders = [];
let nextOrderId = 1;

// 새 주문 생성 로직
exports.createOrder = async (req, res) => {
  const userId = req.user.id; // authMiddleware에서 설정된 사용자 ID
  const { symbol, type, side, price, quantity } = req.body;
  const currentPort = req.app.get('port') || process.env.PORT || 3035;

  if (!symbol || !type || !side || !quantity) {
    return res.status(400).json({ message: '필수 주문 정보가 누락되었습니다.' });
  }
  if ((type.toLowerCase() === 'limit' || type === '지정가') && (price === undefined || price === null || price === '')) {
    return res.status(400).json({ message: '지정가 주문에는 가격이 필요합니다.' });
  }

  const newOrder = {
    id: nextOrderId++,
    userId: parseInt(userId, 10), // userId를 숫자로 확실히 변환하여 저장
    symbol: symbol,
    type: type,
    side: side,
    price: (type.toLowerCase() === 'limit' || type === '지정가') ? parseFloat(price) : null,
    quantity: parseFloat(quantity),
    status: 'pending',
    createdAt: new Date(),
  };

  orders.push(newOrder);
  console.log(`[Port:${currentPort}] 새 주문 접수 (사용자 ID: ${userId}):`, newOrder);
  console.log(`[Port:${currentPort}] 현재 전체 주문 목록:`, orders); // 전체 주문 목록 로깅
  res.status(201).json({ message: '주문이 성공적으로 접수되었습니다.', order: newOrder });
};

// 현재 사용자의 주문 목록 조회 로직
exports.getUserOrders = async (req, res) => {
  const userId = parseInt(req.user.id, 10); // 토큰에서 가져온 userId도 숫자로 변환
  const currentPort = req.app.get('port') || process.env.PORT || 3035;

  console.log(`[Port:${currentPort}] getUserOrders 호출됨. 조회 요청 사용자 ID: ${userId} (타입: ${typeof userId})`);
  console.log(`[Port:${currentPort}] 필터링 전 전체 주문 목록 (${orders.length}건):`, JSON.stringify(orders, null, 2)); // 전체 주문 목록과 각 주문의 userId 타입 확인

  // userId 타입을 일치시켜 필터링
  const userSpecificOrders = orders.filter(order => {
    // console.log(`[Port:${currentPort}] 비교: order.userId (${order.userId}, 타입: ${typeof order.userId}) === userId (${userId}, 타입: ${typeof userId})`);
    return order.userId === userId;
  });
  
  console.log(`[Port:${currentPort}] 사용자 ID ${userId}의 주문 목록 조회 완료. ${userSpecificOrders.length}건 발견.`);
  console.log(`[Port:${currentPort}] 반환될 주문 목록:`, userSpecificOrders);
  res.status(200).json(userSpecificOrders);
};
