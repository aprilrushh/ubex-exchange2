// src/components/Chart/SimpleChart.js
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import TimeframeSelector from './TimeframeSelector';
import IndicatorSelector from './Indicators/IndicatorSelector';
import './SimpleChart.css';

const SimpleChart = ({ symbol = 'BTC/USDT', indicators, timeframe }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const seriesRefs = useRef({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTimeframe, setCurrentTimeframe] = useState(timeframe || '1d');
  const [currentIndicators, setCurrentIndicators] = useState({
    ma5: false,
    ma10: false,
    ma20: true,
    ma60: false,
    ma120: false,
    rsi: false,
    macd: false
  });
  const [chartData, setChartData] = useState([]);

  // 이동평균선 계산 함수
  const calculateSMA = (data, period) => {
    if (!data || !Array.isArray(data) || data.length < period) {
      return [];
    }

    const smaData = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      let validCount = 0;
      
      for (let j = 0; j < period; j++) {
        const candle = data[i - j];
        if (candle && typeof candle.close === 'number' && !isNaN(candle.close)) {
          sum += candle.close;
          validCount++;
        }
      }
      
      if (validCount === period) {
        smaData.push({
          time: data[i].time,
          value: sum / period
        });
      }
    }
    return smaData;
  };

  // 지표 시리즈 제거 함수
  const removeAllIndicators = () => {
    Object.keys(seriesRefs.current).forEach(key => {
      if (seriesRefs.current[key]) {
        try {
          // 시리즈가 유효한지 확인
          if (chartRef.current && seriesRefs.current[key] && typeof seriesRefs.current[key].remove === 'function') {
            chartRef.current.removeSeries(seriesRefs.current[key]);
          }
        } catch (e) {
          // 에러 무시 (이미 제거된 시리즈일 가능성)
        }
        delete seriesRefs.current[key];
      }
    });
  };

  // 지표 시리즈 업데이트 함수
  const updateIndicators = (indicators, data) => {
    if (!chartRef.current || !data || data.length === 0) {
      return;
    }

    try {
      // 기존 지표 제거
      removeAllIndicators();

      // 지표 설정
      const indicatorsConfig = [
        { key: 'ma5', period: 5, color: '#ff5722', width: 1 },
        { key: 'ma10', period: 10, color: '#2196f3', width: 1 },
        { key: 'ma20', period: 20, color: '#4caf50', width: 2 },
        { key: 'ma60', period: 60, color: '#9c27b0', width: 1 },
        { key: 'ma120', period: 120, color: '#795548', width: 1 },
      ];

      // 지표 추가
      indicatorsConfig.forEach(config => {
        if (indicators[config.key]) {
          const smaData = calculateSMA(data, config.period);
          if (smaData.length > 0) {
            seriesRefs.current[config.key] = chartRef.current.addLineSeries({
              color: config.color,
              lineWidth: config.width,
              title: config.key.toUpperCase(),
              priceLineVisible: false,
              lastValueVisible: true,
            });
            seriesRefs.current[config.key].setData(smaData);
          }
        }
      });

    } catch (error) {
      console.warn('지표 업데이트 중 경고:', error.message);
    }
  };

  const initChart = () => {
    if (!chartContainerRef.current) return;

    try {
      // 기존 차트 제거
      if (chartRef.current) {
        removeAllIndicators();
        chartRef.current.remove();
        chartRef.current = null;
        candlestickSeriesRef.current = null;
      }

      // 새 차트 생성
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

      // 캔들스틱 시리즈 추가
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#d60000',
        downColor: '#0051c7',
        borderDownColor: '#0051c7',
        borderUpColor: '#d60000',
        wickDownColor: '#0051c7',
        wickUpColor: '#d60000',
      });

      // 차트 참조 저장
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      // 샘플 데이터 생성
      const data = generateSampleData();
      candlestickSeries.setData(data);
      setChartData(data);
      
      // 차트 맞춤
      chart.timeScale().fitContent();
      
      // 지표 업데이트 - 처음에는 약간 지연
      setTimeout(() => {
        updateIndicators(currentIndicators, data);
      }, 100);
      
      setLoading(false);
      setError(null);
      
    } catch (error) {
      console.error('차트 초기화 오류:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // 샘플 데이터 생성 함수
  const generateSampleData = () => {
    const data = [];
    const basePrice = 50000;
    let lastClose = basePrice;
    
    for (let i = 0; i < 200; i++) {
      const timestamp = Math.floor(Date.now() / 1000) - (200 - i) * 86400;
      const change = (Math.random() - 0.5) * lastClose * 0.05;
      const open = lastClose;
      const close = Math.max(open + change, 100);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      data.push({
        time: timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
      
      lastClose = close;
    }
    
    return data;
  };

  // 차트 초기화
  useEffect(() => {
    const timer = setTimeout(() => {
      initChart();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        removeAllIndicators();
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, currentTimeframe]);

  // 지표 변경 감지
  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      // 지표 변경 시 약간의 지연을 두고 업데이트
      const timer = setTimeout(() => {
        updateIndicators(currentIndicators, chartData);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndicators]);

  // Window resize 처리
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        try {
          chartRef.current.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
          });
        } catch (e) {
          console.warn('리사이즈 중 경고:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTimeframeChange = (newTimeframe) => {
    setCurrentTimeframe(newTimeframe);
  };

  const handleIndicatorChange = (newIndicators) => {
    setCurrentIndicators(newIndicators);
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>차트 분석</h2>
        <div className="chart-controls">
          <TimeframeSelector
            activeTimeframe={currentTimeframe}
            onTimeframeChange={handleTimeframeChange}
          />
          <IndicatorSelector
            indicators={currentIndicators}
            onIndicatorChange={handleIndicatorChange}
          />
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          에러 발생: {error}
        </div>
      )}
      
      {loading && (
        <div className="loading-message">
          로딩 중...
        </div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="chart" 
        style={{ width: '100%', height: '400px', display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default SimpleChart;