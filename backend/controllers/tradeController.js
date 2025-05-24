// backend/controllers/tradeController.js

const tradeEngine = require('../services/tradeEngineService');
const logger = require('../services/logger');

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

  try {
    const order = tradeEngine.placeOrder({
      symbol,
      type: type.toLowerCase(),
      side: side.toLowerCase(),
      price: (type.toLowerCase() === 'limit' || type === '지정가') ? parseFloat(price) : undefined,
      amount: parseFloat(quantity),
      userId: parseInt(userId, 10)
    });
    logger.info(`order placed user=${userId} id=${order.id}`);
    res.status(201).json({ message: '주문이 성공적으로 접수되었습니다.', order });
  } catch (err) {
    logger.error(`createOrder error ${err.message}`);
    res.status(500).json({ message: '주문 처리 중 오류가 발생했습니다.' });
  }
};

// 현재 사용자의 주문 목록 조회 로직
exports.getUserOrders = async (req, res) => {
  const userId = parseInt(req.user.id, 10); // 토큰에서 가져온 userId도 숫자로 변환
  const currentPort = req.app.get('port') || process.env.PORT || 3035;

  try {
    const userSpecificOrders = tradeEngine.getOrdersByUser(userId);
    logger.info(`orders queried user=${userId}`);
    res.status(200).json(userSpecificOrders);
  } catch (err) {
    logger.error(`getUserOrders error ${err.message}`);
    res.status(500).json({ message: '오류 발생' });
  }
};

// 특정 심볼의 최근 체결 내역 조회
exports.getTradeHistory = async (req, res) => {
  const symbol = req.query.symbol;

  if (!symbol) {
    return res.status(400).json({ message: 'symbol parameter is required' });
  }

  try {
    const trades = tradeEngine.getTradeHistory(symbol);
    res.status(200).json(trades);
  } catch (err) {
    logger.error(`getTradeHistory error ${err.message}`);
    res.status(500).json({ message: '오류 발생' });
  }
};
