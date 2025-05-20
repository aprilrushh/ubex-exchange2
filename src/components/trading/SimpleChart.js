import React, { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../../services/websocketService';

const SimpleChart = ({ symbol = 'BTC/USDT', timeframe = '1m' }) => {
  const [chartData, setChartData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const handleChartData = useCallback((data) => {
    if (data && Array.isArray(data)) {
      setChartData(data);
    }
  }, []);

  const handleOrderUpdate = useCallback((data) => {
    if (data && data.order) {
      console.log('[SimpleChart] Received order update:', data);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      const socket = websocketService.connect();
      if (!socket || typeof socket !== 'object') {
        console.error('[SimpleChart] WebSocket initialization failed:', socket);
        setError('WebSocket connection failed');
        return;
      }

      wsRef.current = socket;

      const handleConnect = () => {
        console.log('[SimpleChart] WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      const handleDisconnect = () => {
        console.log('[SimpleChart] WebSocket disconnected');
        setIsConnected(false);
      };

      const handleError = (error) => {
        console.error('[SimpleChart] WebSocket error:', error);
        setError(error.message);
        setIsConnected(false);
      };

      // 이벤트 리스너 등록
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('error', handleError);

      // 차트 데이터 구독
      websocketService.subscribe('chartData', handleChartData);
      websocketService.subscribe('orderUpdate', handleOrderUpdate);

      return () => {
        if (socket) {
          socket.off('connect', handleConnect);
          socket.off('disconnect', handleDisconnect);
          socket.off('error', handleError);
        }
      };
    } catch (error) {
      console.error('[SimpleChart] WebSocket connection error:', error);
      setError(error.message);
      return undefined;
    }
  }, [handleChartData, handleOrderUpdate]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return () => {
      if (cleanup) cleanup();
      if (wsRef.current) {
        websocketService.unsubscribe('chartData', handleChartData);
        websocketService.unsubscribe('orderUpdate', handleOrderUpdate);
        websocketService.disconnect();
      }
    };
  }, [connectWebSocket, handleChartData, handleOrderUpdate]);

  return (
    <div className="simple-chart">
      <h2>Price Chart - {symbol}</h2>
      <div className="chart-container">
        {error ? (
          <div className="error-message">
            Connection error: {error}
          </div>
        ) : !isConnected ? (
          <div>Connecting to WebSocket server...</div>
        ) : chartData.length > 0 ? (
          <div className="chart-data">
            {chartData.map((candle, index) => (
              <div key={index} className="candle">
                <div>Time: {new Date(candle.time).toLocaleString()}</div>
                <div>Open: {candle.open}</div>
                <div>High: {candle.high}</div>
                <div>Low: {candle.low}</div>
                <div>Close: {candle.close}</div>
                <div>Volume: {candle.volume}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>Loading chart data...</div>
        )}
      </div>
    </div>
  );
};

export default SimpleChart;
 