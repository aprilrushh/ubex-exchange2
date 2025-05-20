import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import ChartHeader from './ChartHeader';
import { calculateMA, calculateRSI, calculateMACD } from '../../utils/chartIndicators';
import webSocketService from '../../services/websocketService';
import './TradingChart.css';

const TradingChart = ({ symbol = 'BTC/USDT', onTimeframeChange }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const wsRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const lineSeriesRefs = useRef({});

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
        vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
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
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  const connectWebSocket = () => {
    const socket = webSocketService.connect();
    if (!socket || typeof socket !== 'object') {
      console.error('WebSocket initialization failed', socket);
      return;
    }
    wsRef.current = socket;

    const subscribe = () => {
      const channel = `candlestick:${symbol}:${timeframe}`;
      webSocketService.emit('subscribe', { channel });
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

    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('error', handleError);
    webSocketService.on('candles', handleCandles);
    webSocketService.on('candlestick', handleCandlestick);

    wsRef.current.__handlers = {
      handleConnect,
      handleDisconnect,
      handleError,
      handleCandles,
      handleCandlestick,
    };
  };

  const processInitialData = (data) => {
    if (!data || data.length === 0) return;

    const candleData = data.map(candle => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
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

  const updateCandle = (candle) => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    const candleData = {
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
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
          value: value,
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
        value: value,
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
        value: value,
      })));
      signalSeries.setData(signalLine.map((value, index) => ({
        time: data[index].time,
        value: value,
      })));
      histogramSeries.setData(histogram.map((value, index) => ({
        time: data[index].time,
        value: value,
        color: value >= 0 ? '#4CAF50' : '#F44336',
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
      ma120: '#FFEEAD',
    };
    return colors[key] || '#FF6B6B';
  };

  const handleTimeframeChange = (newTimeframe) => {
    if (wsRef.current) {
      webSocketService.unsubscribe({ symbol, interval: timeframe });
      webSocketService.subscribe({ symbol, interval: newTimeframe });
    }
    setTimeframe(newTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  const handleIndicatorChange = (newIndicators) => {
    setIndicators(newIndicators);
    updateIndicators(chartData);
  };

  useEffect(() => {
    initChart();
    connectWebSocket();

    return () => {
      if (wsRef.current?.__handlers) {
        const { handleConnect, handleDisconnect, handleError, handleCandles, handleCandlestick } = wsRef.current.__handlers;
        webSocketService.off('connect', handleConnect);
        webSocketService.off('disconnect', handleDisconnect);
        webSocketService.off('error', handleError);
        webSocketService.off('candles', handleCandles);
        webSocketService.off('candlestick', handleCandlestick);
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (wsRef.current?.__handlers) {
      const { handleConnect, handleDisconnect, handleError, handleCandles, handleCandlestick } = wsRef.current.__handlers;
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('error', handleError);
      webSocketService.off('candles', handleCandles);
      webSocketService.off('candlestick', handleCandlestick);
    }
    connectWebSocket();
  }, [symbol, timeframe]);

  return (
    <div className="trading-chart-container">
      <ChartHeader
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        indicators={indicators}
        onIndicatorChange={handleIndicatorChange}
      />
      <div className="chart-status">
        {connectionStatus === 'connected' ? '연결됨' : '연결 끊김'}
      </div>
      <div ref={chartContainerRef} className="chart" />
      {isLoading && <div className="chart-loading">로딩 중...</div>}
    </div>
  );
};

export default TradingChart;
