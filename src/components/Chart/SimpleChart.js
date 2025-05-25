// src/components/Chart/SimpleChart.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import IndicatorSelector from './Indicators/IndicatorSelector';
import TimeframeSelector from './TimeframeSelector';
import './SimpleChart.css';

const SimpleChart = ({
  symbol = 'BTC/USDT',
  onTimeframeChange
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

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
  const [isLoading, setIsLoading] = useState(true);

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

    // 초기 더미 데이터 설정
    const dummyData = generateDummyData();
    const candleData = dummyData.map(candle => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));

    const volumeData = dummyData.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? 'rgba(214, 0, 0, 0.5)' : 'rgba(0, 81, 199, 0.5)'
    }));

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();
    setIsLoading(false);

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

  // 차트 초기화
  useEffect(() => {
    const cleanup = initChart();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initChart]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  const handleIndicatorChange = (newIndicators) => {
    setIndicators(newIndicators);
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <TimeframeSelector
          timeframe={timeframe}
          onChange={handleTimeframeChange}
        />
        <IndicatorSelector
          indicators={indicators}
          onChange={handleIndicatorChange}
        />
      </div>
      <div ref={chartContainerRef} className="chart" />
      {isLoading && <div className="chart-loading">로딩 중...</div>}
    </div>
  );
};

export default SimpleChart;
