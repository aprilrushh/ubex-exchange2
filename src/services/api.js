// src/services/api.js

const API_BASE_URL = '/api';

// 코인(마켓) 목록 조회
export const fetchCoinList = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/markets`, {
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `API 오류: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('[services/api.js] fetchCoinList error:', error);
    throw error;
  }
};

// 특정 심볼 가격 조회 (기본 거래소: binance)
export const fetchPrice = async (symbol, exchange = 'binance') => {
  try {
    const res = await fetch(`${API_BASE_URL}/markets/${exchange}/${symbol}`, {
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `API 오류: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[services/api.js] fetchPrice(${symbol}) error:`, error);
    throw error;
  }
};

// 캔들 데이터 가져오기 (SimpleChart 또는 CryptoChart에서 사용될 수 있음)
export const fetchCandleData = async (symbol, timeframe) => {
    try {
        const res = await fetch(`${API_BASE_URL}/markets/${symbol}/candles?interval=${timeframe}`, {
            credentials: 'include'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || `API 오류: ${res.status}`);
        }
        return data;
    } catch (error) {
        console.error(`[services/api.js] fetchCandleData(${symbol}, ${timeframe}) error:`, error);
        throw error;
    }
};

// 실시간 가격 데이터 (이 함수는 CryptoChart.js의 getRealtimePrice에서 사용될 수 있음)
export const fetchRealtimePrice = async (symbol) => {
    try {
        const res = await fetch(`${API_BASE_URL}/markets/binance/${symbol}`, {
            credentials: 'include'
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.message || `API 오류: ${res.status}`);
        }
        return data;
    } catch (error) {
        console.error(`[services/api.js] fetchRealtimePrice(${symbol}) error:`, error);
        throw error;
    }
};
