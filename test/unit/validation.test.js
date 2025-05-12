// test/unit/validation.test.js

import { validateQuantity, validatePrice } from '../../src/utils/validation.js';

describe('Validation Utility Tests', () => {
  describe('validateQuantity', () => {
    test('유효한 수량 검증 성공', () => {
      expect(() => validateQuantity('BTC/USDT', 0.0001)).not.toThrow();
      expect(() => validateQuantity('ETH/USDT', 0.001)).not.toThrow();
    });

    test('지원하지 않는 거래쌍 에러', () => {
      expect(() => validateQuantity('INVALID/PAIR', 1)).toThrow('지원하지 않는 거래쌍입니다');
    });

    test('최소 수량 미만 에러', () => {
      expect(() => validateQuantity('BTC/USDT', 0.00001)).toThrow('최소 주문 수량은 0.0001입니다');
    });

    test('최대 수량 초과 에러', () => {
      expect(() => validateQuantity('BTC/USDT', 2000)).toThrow('최대 주문 수량은 1000입니다');
    });

    test('step size 불일치 에러', () => {
      expect(() => validateQuantity('BTC/USDT', 0.00015)).toThrow('주문 수량은 0.0001의 배수여야 합니다');
    });

    test('유효하지 않은 수량 타입 에러', () => {
      expect(() => validateQuantity('BTC/USDT', 'invalid')).toThrow('유효하지 않은 수량입니다');
      expect(() => validateQuantity('BTC/USDT', NaN)).toThrow('유효하지 않은 수량입니다');
    });
  });

  describe('validatePrice', () => {
    test('유효한 가격 검증 성공', () => {
      expect(() => validatePrice('BTC/USDT', 0.01)).not.toThrow();
      expect(() => validatePrice('ETH/USDT', 0.01)).not.toThrow();
    });

    test('지원하지 않는 거래쌍 에러', () => {
      expect(() => validatePrice('INVALID/PAIR', 1)).toThrow('지원하지 않는 거래쌍입니다');
    });

    test('최소 가격 미만 에러', () => {
      expect(() => validatePrice('BTC/USDT', 0.001)).toThrow('최소 주문 가격은 0.01입니다');
    });

    test('최대 가격 초과 에러', () => {
      expect(() => validatePrice('BTC/USDT', 2000000)).toThrow('최대 주문 가격은 1000000입니다');
    });

    test('tick size 불일치 에러', () => {
      expect(() => validatePrice('BTC/USDT', 0.015)).toThrow('주문 가격은 0.01의 배수여야 합니다');
    });

    test('유효하지 않은 가격 타입 에러', () => {
      expect(() => validatePrice('BTC/USDT', 'invalid')).toThrow('유효하지 않은 가격입니다');
      expect(() => validatePrice('BTC/USDT', NaN)).toThrow('유효하지 않은 가격입니다');
    });
  });
}); 