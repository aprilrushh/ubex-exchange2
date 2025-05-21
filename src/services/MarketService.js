import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchTickerList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickers`);
    if (!response.ok) throw new Error(`API 오류: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('시세 리스트 불러오기 실패:', error);
    throw error;
  }
};

export const connectWebSocket = (symbols, onMessage) => {
  const ws = new WebSocket('ws://localhost:3001/ws/ticker');
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', symbols }));
  };
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage && onMessage(data);
  };
  ws.onerror = (err) => {
    console.error('WebSocket 오류:', err);
  };
  return ws;
}; 

// 코인 목록 조회
export async function fetchCoinList() {
  try {
    // 관리자 혹은 공개 API 엔드포인트에서 코인 목록을 조회합니다.
    const response = await fetch(`${API_BASE_URL}/admin/coins`);
    if (!response.ok) {
      throw new Error('Failed to fetch coin list');
    }
    return await response.json();
  } catch (error) {
    console.error('코인 목록 조회 실패:', error);
    // 실제 API가 없을 경우 샘플 데이터 반환
    return getSampleCoinData();
  }
}

// 코인 가격 조회
export async function fetchPrice(symbol) {
  try {
    const response = await fetch(`${API_BASE_URL}/market/price/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }
    return response.json();
  } catch (error) {
    console.error('가격 조회 실패:', error);
    // 실제 API가 없을 경우 랜덤 가격 반환
    return {
      symbol,
      price: Math.random() * 1000,
      timestamp: Date.now(),
    };
  }
}

// 차트 데이터 조회
export async function fetchChartData(symbol, timeframe = '1d') {
  try {
    const response = await fetch(`${API_BASE_URL}/market/chart/${symbol}?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }
    return response.json();
  } catch (error) {
    console.error('차트 데이터 조회 실패:', error);
    // 실제 API가 없을 경우 샘플 차트 데이터 반환
    return generateSampleChartData();
  }
}

// 호가 데이터 조회
export async function fetchOrderBook(symbol) {
  try {
    const response = await fetch(`${API_BASE_URL}/market/orderbook/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order book');
    }
    return response.json();
  } catch (error) {
    console.error('호가 데이터 조회 실패:', error);
    // 실제 API가 없을 경우 샘플 호가 데이터 반환
    return getSampleOrderBook();
  }
}

// 거래량 데이터 조회
export async function fetchVolume(symbol) {
  try {
    const response = await fetch(`${API_BASE_URL}/market/volume/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch volume');
    }
    return response.json();
  } catch (error) {
    console.error('거래량 데이터 조회 실패:', error);
    // 실제 API가 없을 경우 랜덤 거래량 반환
    return {
      symbol,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
    };
  }
}

// 샘플 코인 데이터 생성
function getSampleCoinData() {
  return [
    {
      symbol: 'BTC',
      name: '비트코인',
      price: 144200000,
      change: 0.33,
      volume: 200979,
    },
    {
      symbol: 'ETH',
      name: '이더리움',
      price: 2577000,
      change: -0.15,
      volume: 69997,
    },
    {
      symbol: 'XRP',
      name: '리플',
      price: 3011,
      change: -1.5,
      volume: 20556,
    },
    {
      symbol: 'LAYER',
      name: '슬레이어',
      price: 2629,
      change: 5.62,
      volume: 53213,
    },
    {
      symbol: 'KAITO',
      name: '카이토',
      price: 1904,
      change: 38.67,
      volume: 20497,
    },
    {
      symbol: 'STPT',
      name: '에스티피티',
      price: 111.6,
      change: 21.16,
      volume: 14263,
    },
    {
      symbol: 'MOVE',
      name: '무브먼트',
      price: 227.3,
      change: 0.26,
      volume: 10364,
    },
    {
      symbol: 'USDT',
      name: '테더',
      price: 1415,
      change: -0.32,
      volume: 79739,
    },
  ];
}

// 샘플 호가 데이터 생성
function getSampleOrderBook() {
  return {
    asks: [
      { price: 144205000, quantity: 0.005 },
      { price: 144210000, quantity: 0.008 },
      { price: 144215000, quantity: 0.012 },
      { price: 144220000, quantity: 0.003 },
      { price: 144225000, quantity: 0.015 }
    ],
    bids: [
      { price: 144200000, quantity: 0.007 },
      { price: 144195000, quantity: 0.010 },
      { price: 144190000, quantity: 0.005 },
      { price: 144185000, quantity: 0.020 },
      { price: 144180000, quantity: 0.008 }
    ]
  };
}

// 샘플 차트 데이터 생성
function generateSampleChartData() {
  const data = [];
  const now = new Date();
  let price = 144200000;
  
  for (let i = 0; i < 100; i++) {
    const time = new Date(now - (100 - i) * 24 * 60 * 60 * 1000);
    price = price * (1 + (Math.random() - 0.5) * 0.02);
    data.push({
      time: time.toISOString().split('T')[0],
      open: price,
      high: price * (1 + Math.random() * 0.01),
      low: price * (1 - Math.random() * 0.01),
      close: price * (1 + (Math.random() - 0.5) * 0.01),
      volume: Math.floor(Math.random() * 1000)
    });
  }
  return data;
} 