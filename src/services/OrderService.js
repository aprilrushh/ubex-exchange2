import { validateQuantity, validatePrice } from '../utils/validation.js';
import { EventEmitter } from 'events';

class OrderService extends EventEmitter {
  constructor(balanceService) {
    super();
    this.balanceService = balanceService;
    this.orders = new Map(); // 주문 저장소 (실제 구현에서는 DB 사용)
  }

  /**
   * 지정가 주문 생성
   * @param {string} userId - 사용자 ID
   * @param {string} symbol - 거래쌍 심볼 (예: 'BTC/USDT')
   * @param {number} quantity - 주문 수량
   * @param {number} price - 주문 가격
   * @returns {Promise<OrderResult>} 주문 결과
   */
  async placeLimitOrder(userId, symbol, quantity, price) {
    try {
      // 1. 유효성 검사
      validateQuantity(symbol, quantity);
      validatePrice(symbol, price);

      // 2. 잔고 검사
      const [baseCurrency, quoteCurrency] = symbol.split('/');
      const requiredBalance = quantity * price;
      
      const balance = await this.balanceService.getBalance(userId, quoteCurrency);
      if (balance.available < requiredBalance) {
        throw new Error(`잔고가 부족합니다. 필요: ${requiredBalance} ${quoteCurrency}, 보유: ${balance.available} ${quoteCurrency}`);
      }

      // 3. 주문 생성
      const orderId = `LIMIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const order = {
        id: orderId,
        userId,
        symbol,
        type: 'LIMIT',
        side: quantity > 0 ? 'BUY' : 'SELL',
        quantity: Math.abs(quantity),
        price,
        status: 'NEW',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 4. 잔고 동결
      await this.balanceService.lockBalance(userId, quoteCurrency, requiredBalance);

      // 5. 주문 저장
      this.orders.set(orderId, order);

      // 6. 매칭 엔진에 주문 전달
      this.emit('newOrder', order);

      return {
        orderId,
        status: 'NEW',
        message: '주문이 성공적으로 생성되었습니다.'
      };
    } catch (error) {
      throw new Error(`지정가 주문 실패: ${error.message}`);
    }
  }

  /**
   * 시장가 주문 생성
   * @param {string} userId - 사용자 ID
   * @param {string} symbol - 거래쌍 심볼 (예: 'BTC/USDT')
   * @param {number} quantity - 주문 수량
   * @returns {Promise<OrderResult>} 주문 결과
   */
  async placeMarketOrder(userId, symbol, quantity) {
    try {
      // 1. 유효성 검사
      validateQuantity(symbol, quantity);

      // 2. 현재 시장가 조회 (실제 구현에서는 시장 데이터 서비스 사용)
      const currentPrice = await this.getCurrentPrice(symbol);
      if (!currentPrice) {
        throw new Error('현재 시장가를 조회할 수 없습니다.');
      }

      // 3. 잔고 검사
      const [baseCurrency, quoteCurrency] = symbol.split('/');
      const requiredBalance = Math.abs(quantity) * currentPrice;
      
      const balance = await this.balanceService.getBalance(userId, quoteCurrency);
      if (balance.available < requiredBalance) {
        throw new Error(`잔고가 부족합니다. 필요: ${requiredBalance} ${quoteCurrency}, 보유: ${balance.available} ${quoteCurrency}`);
      }

      // 4. 주문 생성
      const orderId = `MARKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const order = {
        id: orderId,
        userId,
        symbol,
        type: 'MARKET',
        side: quantity > 0 ? 'BUY' : 'SELL',
        quantity: Math.abs(quantity),
        price: currentPrice,
        status: 'NEW',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 5. 잔고 동결
      await this.balanceService.lockBalance(userId, quoteCurrency, requiredBalance);

      // 6. 주문 저장
      this.orders.set(orderId, order);

      // 7. 매칭 엔진에 주문 전달
      this.emit('newOrder', order);

      return {
        orderId,
        status: 'NEW',
        message: '시장가 주문이 성공적으로 생성되었습니다.'
      };
    } catch (error) {
      throw new Error(`시장가 주문 실패: ${error.message}`);
    }
  }

  /**
   * 현재 시장가 조회 (실제 구현에서는 시장 데이터 서비스 사용)
   * @param {string} symbol - 거래쌍 심볼
   * @returns {Promise<number>} 현재 시장가
   */
  async getCurrentPrice(symbol) {
    // 실제 구현에서는 시장 데이터 서비스를 통해 현재가 조회
    // 여기서는 더미 데이터 반환
    const prices = {
      'BTC/USDT': 50000,
      'ETH/USDT': 3000
    };
    return prices[symbol] || null;
  }

  /**
   * 주문 상태 조회
   * @param {string} orderId - 주문 ID
   * @returns {Promise<Order>} 주문 정보
   */
  async getOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.');
    }
    return order;
  }
}

export default OrderService; 