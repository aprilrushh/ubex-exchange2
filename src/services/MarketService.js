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