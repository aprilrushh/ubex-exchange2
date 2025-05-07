const API_BASE_URL = 'http://localhost:3001/api';

export const fetchCoinList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/coins`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('코인 목록 불러오기 실패:', error);
    throw error;
  }
};

export const fetchPrice = async (symbol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/price/${symbol}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`${symbol} 가격 불러오기 실패:`, error);
    throw error;
  }
};

export const fetchOrderBook = async (symbol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orderbook/${symbol}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`${symbol} 오더북 불러오기 실패:`, error);
    throw error;
  }
};

export const fetchTradeHistory = async (symbol) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trades/${symbol}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`${symbol} 체결 내역 불러오기 실패:`, error);
    throw error;
  }
};

export const fetchChartData = async (symbol, timeframe = 'day') => {
  try {
    const response = await fetch(`${API_BASE_URL}/chart/${symbol}?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`${symbol} 차트 데이터 불러오기 실패:`, error);
    throw error;
  }
};

export const placeOrder = async (type, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`주문 요청 실패:`, error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

export const fetchBalance = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/${userId}`);
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('잔고 정보 불러오기 실패:', error);
    throw error;
  }
};
