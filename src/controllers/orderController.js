import OrderService from '../services/OrderService.js';

class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  /**
   * 지정가 주문 생성 엔드포인트
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   */
  async placeLimitOrder(req, res) {
    try {
      const { userId, symbol, quantity, price } = req.body;

      // 필수 파라미터 검증
      if (!userId || !symbol || !quantity || !price) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터가 누락되었습니다. (userId, symbol, quantity, price)'
        });
      }

      // 주문 생성
      const result = await this.orderService.placeLimitOrder(
        userId,
        symbol,
        parseFloat(quantity),
        parseFloat(price)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('지정가 주문 실패:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 시장가 주문 생성 엔드포인트
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   */
  async placeMarketOrder(req, res) {
    try {
      const { userId, symbol, quantity } = req.body;

      // 필수 파라미터 검증
      if (!userId || !symbol || !quantity) {
        return res.status(400).json({
          success: false,
          message: '필수 파라미터가 누락되었습니다. (userId, symbol, quantity)'
        });
      }

      // 주문 생성
      const result = await this.orderService.placeMarketOrder(
        userId,
        symbol,
        parseFloat(quantity)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('시장가 주문 실패:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 주문 상태 조회 엔드포인트
   * @param {Object} req - Express 요청 객체
   * @param {Object} res - Express 응답 객체
   */
  async getOrder(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: '주문 ID가 필요합니다.'
        });
      }

      const order = await this.orderService.getOrder(orderId);
      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('주문 조회 실패:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default OrderController; 