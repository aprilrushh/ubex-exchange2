// src/services/api.js

export const fetchCoinList = async () => {
  console.warn('[services/api.js] fetchCoinList: 실제 API 연동이 필요합니다. 현재는 빈 배열을 반환합니다.');
  return Promise.resolve([]);
};

export const fetchPrice = async (symbol) => {
  console.warn(`[services/api.js] fetchPrice(${symbol}): 실제 API 연동이 필요합니다. 현재는 빈 객체를 반환합니다.`);
  return Promise.resolve({});
};

// 캔들 데이터 가져오기 (SimpleChart 또는 CryptoChart에서 사용될 수 있음)
export const fetchCandleData = async (symbol, timeframe) => {
    console.warn(`[services/api.js] fetchCandleData(${symbol}, ${timeframe}): 실제 API 연동 필요. 현재는 빈 배열 반환.`);
    // 이 함수는 SimpleChart.js 또는 CryptoChart.js의 getCandleData 내부에서 호출될 수 있습니다.
    // MarketContext.js의 getSamplePriceData를 참고하여 유사한 샘플 데이터 구조를 반환할 수 있습니다.
    return Promise.resolve([]);
};

// 실시간 가격 데이터 (이 함수는 CryptoChart.js의 getRealtimePrice에서 사용될 수 있음)
export const fetchRealtimePrice = async (symbol) => {
    console.warn(`[services/api.js] fetchRealtimePrice(${symbol}): 실제 API 연동 필요. 현재는 임시 데이터 반환.`);
    // MarketContext.js의 getSamplePriceData와 유사한 구조로 반환
    const basePrice = Math.random() * 50000;
    const change = (Math.random() - 0.5) * 1000;
    return Promise.resolve({
        price: basePrice + change,
        change: change,
        changePercent: (change / basePrice) * 100
    });
};
