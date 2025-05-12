// test/unit/orderService.test.js

import OrderService from '../../src/services/OrderService.js';

describe('OrderService Tests', () => {
  let orderService;
  let mockBalanceService;

  beforeEach(() => {
    // Mock BalanceService
    mockBalanceService = {
      getBalance: jest.fn(),
      lockBalance: jest.fn()
    };

    orderService = new OrderService(mockBalanceService);
  });

  describe('placeLimitOrder', () => {
    const validOrder = {
      userId: 'user123',
      symbol: 'BTC/USDT',
      quantity: 0.1,
      price: 50000
    };

    beforeEach(() => {
      mockBalanceService.getBalance.mockResolvedValue({
        available: 10000,
        locked: 0
      });
    });

    test('유효한 지정가 주문 생성 성공', async () => {
      const result = await orderService.placeLimitOrder(
        validOrder.userId,
        validOrder.symbol,
        validOrder.quantity,
        validOrder.price
      );

      expect(result).toHaveProperty('orderId');
      expect(result.status).toBe('NEW');
      expect(result.message).toBe('주문이 성공적으로 생성되었습니다.');
      expect(mockBalanceService.lockBalance).toHaveBeenCalledWith(
        validOrder.userId,
        'USDT',
        validOrder.quantity * validOrder.price
      );
    });

    test('잔고 부족 시 에러 발생', async () => {
      mockBalanceService.getBalance.mockResolvedValue({
        available: 1000,
        locked: 0
      });

      await expect(orderService.placeLimitOrder(
        validOrder.userId,
        validOrder.symbol,
        validOrder.quantity,
        validOrder.price
      )).rejects.toThrow('잔고가 부족합니다');
    });

    test('잘못된 거래쌍으로 주문 시 에러 발생', async () => {
      await expect(orderService.placeLimitOrder(
        validOrder.userId,
        'INVALID/PAIR',
        validOrder.quantity,
        validOrder.price
      )).rejects.toThrow('지원하지 않는 거래쌍입니다');
    });
  });

  describe('placeMarketOrder', () => {
    const validOrder = {
      userId: 'user123',
      symbol: 'BTC/USDT',
      quantity: 0.1
    };

    beforeEach(() => {
      mockBalanceService.getBalance.mockResolvedValue({
        available: 10000,
        locked: 0
      });
    });

    test('유효한 시장가 주문 생성 성공', async () => {
      const result = await orderService.placeMarketOrder(
        validOrder.userId,
        validOrder.symbol,
        validOrder.quantity
      );

      expect(result).toHaveProperty('orderId');
      expect(result.status).toBe('NEW');
      expect(result.message).toBe('시장가 주문이 성공적으로 생성되었습니다.');
      expect(mockBalanceService.lockBalance).toHaveBeenCalled();
    });

    test('잔고 부족 시 에러 발생', async () => {
      mockBalanceService.getBalance.mockResolvedValue({
        available: 1000,
        locked: 0
      });

      await expect(orderService.placeMarketOrder(
        validOrder.userId,
        validOrder.symbol,
        validOrder.quantity
      )).rejects.toThrow('잔고가 부족합니다');
    });

    test('잘못된 거래쌍으로 주문 시 에러 발생', async () => {
      await expect(orderService.placeMarketOrder(
        validOrder.userId,
        'INVALID/PAIR',
        validOrder.quantity
      )).rejects.toThrow('지원하지 않는 거래쌍입니다');
    });
  });

  describe('getOrder', () => {
    test('존재하는 주문 조회 성공', async () => {
      const orderId = 'LIMIT_1234567890_abc123';
      const mockOrder = {
        id: orderId,
        userId: 'user123',
        symbol: 'BTC/USDT',
        type: 'LIMIT',
        quantity: 0.1,
        price: 50000,
        status: 'NEW'
      };

      orderService.orders.set(orderId, mockOrder);

      const result = await orderService.getOrder(orderId);
      expect(result).toEqual(mockOrder);
    });

    test('존재하지 않는 주문 조회 시 에러 발생', async () => {
      await expect(orderService.getOrder('NONEXISTENT_ORDER')).rejects.toThrow('주문을 찾을 수 없습니다');
    });
  });
}); 