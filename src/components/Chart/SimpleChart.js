// src/components/Chart/SimpleChart.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
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

  const generateDummyData = () => {
    const data = [];
    let price = 50000;
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * 60000;
      price = price + (Math.random() - 0.5) * 1000;
      data.push({
        time: timestamp,
        open: price,
        high: price + Math.random() * 100,
        low: price - Math.random() * 100,
        close: price + (Math.random() - 0.5) * 50,
        volume: Math.random() * 10,
      });
    }
    return data;
  };

  // 차트 초기화
  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {
        console.warn('Chart removal error:', error);
      }
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
        mode: 1,
        vertLine: {
          width: 1,
          color: '#758696',
          style: 3,
          labelBackgroundColor: '#e1ecf2',
        },
        horzLine: {
          width: 1,
          color: '#758696',
          style: 3,
          labelBackgroundColor: '#e1ecf2',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
        mouseWheel: true,
        pinch: true,
        shiftMouseWheel: true,
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

    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    chartContainerRef.current.appendChild(tooltip);

    const handleCrosshairMove = (param) => {
      if (!param || !param.point || !param.time || !param.seriesPrices || !candleSeriesRef.current) {
        tooltip.style.display = 'none';
        return;
      }

      const data = param.seriesPrices.get(candleSeriesRef.current);
      if (!data) {
        tooltip.style.display = 'none';
        return;
      }

      const price = data.close !== undefined ? data.close : data;
      const dateStr = new Date(param.time).toLocaleString();

      tooltip.style.display = 'block';
      tooltip.innerHTML = `${dateStr}<br/>${price}`;
      tooltip.style.left = `${param.point.x + 15}px`;
      tooltip.style.top = `${param.point.y + 15}px`;
    };

    let crosshairSubscription;
    try {
      crosshairSubscription = chart.subscribeCrosshairMove(handleCrosshairMove);
    } catch (error) {
      console.warn('Failed to subscribe to crosshair move:', error);
    }

    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      try {
        if (crosshairSubscription) {
          chart.unsubscribeCrosshairMove(crosshairSubscription);
        }
      } catch (error) {
        console.warn('Failed to unsubscribe from crosshair move:', error);
      }
      window.removeEventListener('resize', handleResize);
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
      try {
        chart.remove();
      } catch (error) {
        console.warn('Failed to remove chart:', error);
      }
    };
  }, []);

  // 웹소켓 연결 및 이벤트 설정
  const connectWebSocket = useCallback(() => {
    const socket = webSocketService.connect();
    if (!socket || typeof socket !== 'object') {
      console.error('WebSocket initialization failed', socket);
      return;
    }
    wsRef.current = socket;

    const subscribe = () => {
      const channel = `candlestick:${symbol}:${timeframe}`;
      webSocketService.emit('subscribe', { channel });
      webSocketService.emit('getCandles', { symbol, interval: timeframe });
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
      const dummyData = generateDummyData();
      processInitialData(dummyData);
    };

    const handleConnectError = (error) => {
      console.error('WebSocket 연결 실패:', error);
      setConnectionStatus('error');
      const dummyData = generateDummyData();
      processInitialData(dummyData);
    };

    const handleCandles = (data) => {
      if (!data || data.length === 0) {
        const dummyData = generateDummyData();
        processInitialData(dummyData);
      } else {
        processInitialData(data);
      }
    };

    const handleCandlestick = (data) => {
      updateCandle(data);
    };

    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('error', handleError);
    webSocketService.on('connect_error', handleConnectError);
    webSocketService.on('candles', handleCandles);
    webSocketService.on('candlestick', handleCandlestick);

    wsRef.current.__handlers = {
      handleConnect,
      handleDisconnect,
      handleError,
      handleConnectError,
      handleCandles,
      handleCandlestick,
    };

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('error', handleError);
      webSocketService.off('connect_error', handleConnectError);
      webSocketService.off('candles', handleCandles);
      webSocketService.off('candlestick', handleCandlestick);
    };
  }, [symbol, timeframe]);

  // 초기 데이터 처리
  const processInitialData = useCallback((data) => {
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
  }, []);

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
        const period = parseInt(key.replace('ma', ''));
        const maData = calculateMA(prices, period);
        const series = chartRef.current.addLineSeries({
          color: getMAColor(key),
          lineWidth: 2,
        });
        series.setData(maData.map((value, index) => ({
          time: data[index].time,
          value: Number(value)
        })));
        lineSeriesRefs.current[key] = series;
      }
    });

    if (indicators.rsi) {
      const rsiData = calculateRSI(prices);
      const series = chartRef.current.addLineSeries({
        color: '#FF6B6B',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      series.setData(rsiData.map((value, index) => ({
        time: data[index].time,
        value: Number(value)
      })));
      lineSeriesRefs.current.rsi = series;
    }

    if (indicators.macd) {
      const { macdLine, signalLine, histogram } = calculateMACD(prices);
      const macdSeries = chartRef.current.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      const signalSeries = chartRef.current.addLineSeries({
        color: '#FF9800',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      const histogramSeries = chartRef.current.addHistogramSeries({
        color: '#4CAF50',
        priceScaleId: 'right',
      });

      macdSeries.setData(macdLine.map((value, index) => ({
        time: data[index].time,
        value: Number(value)
      })));
      signalSeries.setData(signalLine.map((value, index) => ({
        time: data[index].time,
        value: Number(value)
      })));
      histogramSeries.setData(histogram.map((value, index) => ({
        time: data[index].time,
        value: Number(value),
        color: value >= 0 ? '#4CAF50' : '#F44336'
      })));

      lineSeriesRefs.current.macd = macdSeries;
      lineSeriesRefs.current.signal = signalSeries;
      lineSeriesRefs.current.histogram = histogramSeries;
    }
  };

  const getMAColor = (key) => {
    const colors = {
      ma5: '#FF6B6B',
      ma10: '#4ECDC4',
      ma20: '#45B7D1',
      ma60: '#96CEB4',
      ma120: '#FFEEAD'
    };
    return colors[key] || '#FF6B6B';
  };

  const handleTimeframeChange = (timeframeInfo) => {
    const newTimeframe = typeof timeframeInfo === 'string'
      ? timeframeInfo
      : timeframeInfo?.id;

    if (wsRef.current && newTimeframe) {
      webSocketService.emit('unsubscribe', {
        channel: `candlestick:${symbol}:${timeframe}`,
      });
      webSocketService.emit('subscribe', {
        channel: `candlestick:${symbol}:${newTimeframe}`,
      });
      webSocketService.emit('getCandles', { symbol, interval: newTimeframe });
    }

    if (newTimeframe) {
      setTimeframe(newTimeframe);
      if (onTimeframeChange) {
        onTimeframeChange(newTimeframe);
      }
    }
  };

  const handleIndicatorChange = (newIndicators) => {
    setIndicators(newIndicators);
    updateIndicators(chartData);
  };

  useEffect(() => {
    const cleanup = initChart();
    
    try {
      const wsCleanup = connectWebSocket();
      return () => {
        cleanup?.();
        wsCleanup?.();
      };
    } catch (error) {
      console.error('WebSocket 연결 실패, 더미 데이터로 대체:', error);
      const dummyData = generateDummyData();
      processInitialData(dummyData);
      return cleanup;
    }
  }, [initChart, connectWebSocket, processInitialData]);

  useEffect(() => {
    const wsCleanup = connectWebSocket();
    return wsCleanup;
  }, [symbol, timeframe, connectWebSocket]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <TimeframeSelector
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
        />
        <IndicatorSelector
          indicators={indicators}
          onIndicatorChange={handleIndicatorChange}
        />
      </div>
      <div className="chart-status">
        {connectionStatus === 'connected' ? '연결됨' : '연결 끊김'}
      </div>
      <div ref={chartContainerRef} className="chart" />
      {isLoading && <div className="chart-loading">로딩 중...</div>}
    </div>
  );
};

export default SimpleChart;
