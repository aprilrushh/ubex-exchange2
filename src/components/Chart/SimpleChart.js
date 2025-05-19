// src/components/Chart/SimpleChart.js - 업데이트된 버전
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import IndicatorSelector from './Indicators/IndicatorSelector';
import TimeframeSelector from './TimeframeSelector';
import { calculateMA, calculateRSI, calculateMACD } from '../../utils/chartIndicators';
import webSocketService from '../../services/websocketService';
import './SimpleChart.css';

const SimpleChart = ({
  symbol = 'BTC/USDT',
  onTimeframeChange
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const wsRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const lineSeriesRefs = useRef({});

  // 상태 관리
  const [timeframe, setTimeframe] = useState('1h');
  const [indicators, setIndicators] = useState({
    ma5: false,
    ma10: false,
    ma20: true,
    ma60: false,
    ma120: false,
    rsi: false,
    macd: false
  });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // 차트 초기화
  const initChart = () => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#333',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.5)',
        },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#d60000',
      downColor: '#0051c7',
      borderDownColor: '#0051c7',
      borderUpColor: '#d60000',
      wickDownColor: '#0051c7',
      wickUpColor: '#d60000',
    });

    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  // 웹소켓 연결 및 이벤트 설정
  const connectWebSocket = () => {
    const socket = webSocketService.socket;
    if (!socket) {
      console.warn('WebSocket service unavailable');
      return;
    }

    wsRef.current = socket;

    const subscribe = () => {
      socket.emit('subscribe', { symbol, interval: timeframe });
    };

    const handleConnect = () => {
      console.log('WebSocket 연결됨');
      setConnectionStatus('connected');
      subscribe();
    };

    const handleDisconnect = () => {
      console.log('WebSocket 연결 끊김');
      setConnectionStatus('disconnected');
    };

    const handleError = (error) => {
      console.error('WebSocket 오류:', error);
      setConnectionStatus('error');
    };

    const handleCandles = (data) => {
      processInitialData(data);
    };

    const handleCandlestick = (data) => {
      updateCandle(data);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);
    socket.on('candles', handleCandles);
    socket.on('candlestick', handleCandlestick);

    wsRef.current.__handlers = {
      handleConnect,
      handleDisconnect,
      handleError,
      handleCandles,
      handleCandlestick,
    };
  };

  // 초기 데이터 처리
  const processInitialData = (data) => {
    if (!data || data.length === 0) return;

    const candleData = data.map(candle => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));

    const volumeData = data.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? 'rgba(214, 0, 0, 0.5)' : 'rgba(0, 81, 199, 0.5)'
    }));

    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData(candleData);
    }

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(volumeData);
    }

    setChartData(data);
    updateIndicators(data);
    setIsLoading(false);

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  // 실시간 캔들스틱 업데이트
  const updateCandle = (candle) => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    const candleData = {
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    };

    const volumeData = {
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? 'rgba(214, 0, 0, 0.5)' : 'rgba(0, 81, 199, 0.5)'
    };

    candleSeriesRef.current.update(candleData);
    volumeSeriesRef.current.update(volumeData);

    setChartData(prevData => {
      const newData = [...prevData];
      const lastIndex = newData.length - 1;

      if (lastIndex >= 0 && newData[lastIndex].time === candle.time) {
        newData[lastIndex] = candle;
      } else {
        newData.push(candle);
      }

      updateIndicators(newData);
      return newData;
    });
  };

  // 지표 업데이트
  const updateIndicators = (data) => {
    if (!data || data.length === 0 || !chartRef.current) return;

    const prices = data.map(d => d.close);

    Object.values(lineSeriesRefs.current).forEach(series => {
      if (series) {
        chartRef.current.removeSeries(series);
      }
    });
    lineSeriesRefs.current = {};

    ['ma5', 'ma10', 'ma20', 'ma60', 'ma120'].forEach(key => {
      if (indicators[key]) {
        const period = parseInt(key.slice(2));
        const ma = calculateMA(prices, period);

        const lineData = data.map((candle, i) => ({
          time: candle.time,
          value: ma[i] || null
        })).filter(point => point.value !== null);

        const color = getMAColor(key);
        const lineSeries = chartRef.current.addLineSeries({
          color: color,
          lineWidth: 2,
          title: `MA ${period}`
        });

        lineSeries.setData(lineData);
        lineSeriesRefs.current[key] = lineSeries;
      }
    });

    if (indicators.rsi) {
      const rsi = calculateRSI(prices, 14);
      // RSI는 별도 차트로 표시하거나 별도 처리 필요
    }

    if (indicators.macd) {
      const macd = calculateMACD(prices);
      // MACD도 별도 차트로 표시하거나 별도 처리 필요
    }
  };

  // 이동평균선 색상 반환
  const getMAColor = (key) => {
    const colors = {
      ma5: '#ff5722',
      ma10: '#2196f3',
      ma20: '#4caf50',
      ma60: '#9c27b0',
      ma120: '#795548'
    };
    return colors[key] || '#666';
  };

  // 타임프레임 변경 처리
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe.id);
    setIsLoading(true);

    if (wsRef.current) {
      wsRef.current.emit('changeInterval', { symbol, interval: newTimeframe.id });
    }

    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  // 지표 변경 처리
  const handleIndicatorChange = (newIndicators) => {
    setIndicators(newIndicators);
    updateIndicators(chartData);
  };

  // 심볼 변경 효과
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.emit('subscribe', { symbol, interval: timeframe });
    }
  }, [symbol]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initChart();
    connectWebSocket();

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
      if (wsRef.current) {
        const s = wsRef.current;
        const h = s.__handlers || {};
        s.off('connect', h.handleConnect);
        s.off('disconnect', h.handleDisconnect);
        s.off('connect_error', h.handleError);
        s.off('error', h.handleError);
        s.off('candles', h.handleCandles);
        s.off('candlestick', h.handleCandlestick);
      }
    };
  }, []);

  // 타임프레임 변경 시 웹소켓 구독 업데이트
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.emit('subscribe', { symbol, interval: timeframe });
    }
  }, [timeframe]);

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <TimeframeSelector
          onTimeframeChange={handleTimeframeChange}
          defaultTimeframe={timeframe}
        />
        <IndicatorSelector
          onIndicatorChange={handleIndicatorChange}
          activeIndicators={indicators}
        />
      </div>

      <div className="chart-header">
        <div className="chart-info">
          <span className="chart-symbol">{symbol}</span>
          <span className="chart-timeframe">{timeframe}</span>
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '● 연결됨' :
             connectionStatus === 'disconnected' ? '○ 연결 끊김' :
             '! 오류'}
          </span>
        </div>
      </div>

      <div ref={chartContainerRef} className="chart" />

      {isLoading && (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          데이터 로딩 중...
        </div>
      )}
    </div>
  );
};

export default SimpleChart;
