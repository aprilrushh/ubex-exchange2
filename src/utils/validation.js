/**
 * 거래쌍별 설정 정보
 * 실제 구현에서는 데이터베이스나 설정 파일에서 관리
 */
const MARKET_CONFIGS = {
  'BTC/USDT': {
    minQuantity: 0.0001,
    maxQuantity: 1000,
    stepSize: 0.0001,
    minPrice: 0.01,
    maxPrice: 1000000,
    tickSize: 0.01
  },
  'ETH/USDT': {
    minQuantity: 0.001,
    maxQuantity: 10000,
    stepSize: 0.001,
    minPrice: 0.01,
    maxPrice: 100000,
    tickSize: 0.01
  }
  // 추가 거래쌍 설정...
};

/**
 * 주문 수량 유효성 검사
 * @param {string} symbol - 거래쌍 심볼 (예: 'BTC/USDT')
 * @param {number} quantity - 주문 수량
 * @throws {Error} 유효성 검사 실패 시 에러 발생
 */
export const validateQuantity = (symbol, quantity) => {
  const config = MARKET_CONFIGS[symbol];
  if (!config) {
    throw new Error(`지원하지 않는 거래쌍입니다: ${symbol}`);
  }

  if (typeof quantity !== 'number' || isNaN(quantity)) {
    throw new Error('유효하지 않은 수량입니다.');
  }

  if (quantity < config.minQuantity) {
    throw new Error(`최소 주문 수량은 ${config.minQuantity}입니다.`);
  }

  if (quantity > config.maxQuantity) {
    throw new Error(`최대 주문 수량은 ${config.maxQuantity}입니다.`);
  }

  // step size 검증
  const remainder = (quantity % config.stepSize);
  if (remainder !== 0) {
    throw new Error(`주문 수량은 ${config.stepSize}의 배수여야 합니다.`);
  }
};

/**
 * 주문 가격 유효성 검사
 * @param {string} symbol - 거래쌍 심볼 (예: 'BTC/USDT')
 * @param {number} price - 주문 가격
 * @throws {Error} 유효성 검사 실패 시 에러 발생
 */
export const validatePrice = (symbol, price) => {
  const config = MARKET_CONFIGS[symbol];
  if (!config) {
    throw new Error(`지원하지 않는 거래쌍입니다: ${symbol}`);
  }

  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error('유효하지 않은 가격입니다.');
  }

  if (price < config.minPrice) {
    throw new Error(`최소 주문 가격은 ${config.minPrice}입니다.`);
  }

  if (price > config.maxPrice) {
    throw new Error(`최대 주문 가격은 ${config.maxPrice}입니다.`);
  }

  // tick size 검증
  const remainder = (price % config.tickSize);
  if (remainder !== 0) {
    throw new Error(`주문 가격은 ${config.tickSize}의 배수여야 합니다.`);
  }
}; 