// src/components/Chart/SimpleChart.js

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { connectWebSocket, subscribeToChannel, unsubscribeFromChannel } from '../../services/websocketService';
import { calculateMA } from '../../utils/chartIndicators';
import './SimpleChart.css';

const SimpleChart = ({ 
  symbol = 'BTC/USDT', 
  timeframe = '1h', 
  indicators = { 
    ma5: false, 
    ma10: false, 
    ma20: false, 
    ma60: false, 
    ma120: false 
  },
  height = 400,
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const indicatorSeriesRefs = useRef({
    ma5: null,
    ma10: null,
    ma20: null,
    ma60: null,
    ma120: null
  });
  
  const [candleData, setCandleData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // WebSocket 연결 및 데이터 구독
  useEffect(() => {
    // WebSocket 연결
    const socket = connectWebSocket();
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // 심볼과 타임프레임에 따라 채널 구독
      const channel = `candlestick:${symbol}:${timeframe}`;
      subscribeToChannel(socket, channel);
      
      // 실시간 데이터 수신 처리
      socket.on(channel, (newData) => {
        setCandleData(prevData => {
          // 새 캔들인지 기존 캔들 업데이트인지 확인
          const lastCandle = prevData[prevData.length - 1];
          if (lastCandle && lastCandle.time === newData.time) {
            // 기존 캔들 업데이트
            const updatedData = [...prevData];
            updatedData[updatedData.length - 1] = newData;
            return updatedData;
          } else {
            // 새 캔들 추가
            return [...prevData, newData];
          }
        });
        
        // 볼륨 데이터 업데이트
        setVolumeData(prevData => {
          const volumeDataPoint = {
            time: newData.time,
            value: newData.volume,
            color: newData.close >= newData.open 
              ? 'rgba(214, 0, 0, 0.5)' // 상승 - 빨간색 (한국식)
              : 'rgba(0, 81, 199, 0.5)' // 하락 - 파란색 (한국식)
          };
          
          const lastVolume = prevData[prevData.length - 1];
          if (lastVolume && lastVolume.time === newData.time) {
            // 기존 볼륨 업데이트
            const updatedData = [...prevData];
            updatedData[updatedData.length - 1] = volumeDataPoint;
            return updatedData;
          } else {
            // 새 볼륨 추가
            return [...prevData, volumeDataPoint];
          }
        });
      });
    });
    
    // 초기 캔들스틱 데이터 로드
    const fetchHistoricalData = async () => {
      try {
        // 실제 API 엔드포인트로 대체하세요
        const response = await fetch(`/api/candlestick/${symbol}/${timeframe}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCandleData(data);
          
          // 볼륨 데이터 생성
          const volumeData = data.map(candle => ({
            time: candle.time,
            value: candle.volume,
            color: candle.close >= candle.open 
              ? 'rgba(214, 0, 0, 0.5)' // 상승 - 빨간색 (한국식)
              : 'rgba(0, 81, 199, 0.5)' // 하락 - 파란색 (한국식)
          }));
          
          setVolumeData(volumeData);
        } else {
          // 데이터가 없으면 샘플 데이터 생성
          const { sampleCandles, sampleVolumes } = generateSampleData();
          setCandleData(sampleCandles);
          setVolumeData(sampleVolumes);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        // 오류 시 샘플 데이터 사용
        const { sampleCandles, sampleVolumes } = generateSampleData();
        setCandleData(sampleCandles);
        setVolumeData(sampleVolumes);
      }
    };
    
    fetchHistoricalData();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (socket && isConnected) {
        const channel = `candlestick:${symbol}:${timeframe}`;
        unsubscribeFromChannel(socket, channel);
        socket.disconnect();
      }
    };
  }, [symbol, timeframe]);
  
  // 샘플 데이터 생성 함수
  const generateSampleData = useCallback(() => {
    const sampleCandles = [];
    const sampleVolumes = [];
    const baseDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime() / 1000;
    let basePrice = 50000; // BTC 기준 시작 가격
    
    for (let i = 0; i < 300; i++) {
      const time = baseDate + (i * getTimeframeSeconds(timeframe));
      const volatility = 0.01;
      const changePercent = (Math.random() * 2 - 1) * volatility;
      
      const open = i === 0 ? basePrice : sampleCandles[i-1].close;
      const close = Math.max(100, open * (1 + changePercent));
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.floor(Math.random() * 100) + 10;
      
      sampleCandles.push({ time, open, high, low, close, volume });
      
      sampleVolumes.push({
        time,
        value: volume,
        color: close >= open 
          ? 'rgba(214, 0, 0, 0.5)' // 상승 - 빨간색 (한국식)
          : 'rgba(0, 81, 199, 0.5)' // 하락 - 파란색 (한국식)
      });
    }
    
    return { sampleCandles, sampleVolumes };
  }, [timeframe]);
  
  // 타임프레임에 따른 초 단위 시간 반환
  const getTimeframeSeconds = (timeframe) => {
    switch(timeframe) {
      case '1m': return 60;
      case '5m': return 5 * 60;
      case '15m': return 15 * 60;
      case '30m': return 30 * 60;
      case '1h': return 60 * 60;
      case '4h': return 4 * 60 * 60;
      case '1d': return 24 * 60 * 60;
      case '1w': return 7 * 24 * 60 * 60;
      default: return 60 * 60; // 기본값 1시간
    }
  };
  
  // 차트 생성 및 데이터 업데이트
  useEffect(() => {
    if (!chartContainerRef.current || candleData.length === 0) return;
    
    // 차트가 없으면 새로 생성
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
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
      
      // 캔들스틱 시리즈 생성
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#d60000',       // 상승 - 빨간색 (한국식)
        downColor: '#0051c7',     // 하락 - 파란색 (한국식)
        borderUpColor: '#d60000', // 상승 테두리 - 빨간색
        borderDownColor: '#0051c7', // 하락 테두리 - 파란색
        wickUpColor: '#d60000',   // 상승 wick - 빨간색
        wickDownColor: '#0051c7', // 하락 wick - 파란색
      });
      
      candlestickSeriesRef.current = candlestickSeries;
      
      // 볼륨 시리즈 생성
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
      
      // 윈도우 리사이즈 이벤트 핸들러
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    
    // 데이터 업데이트
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(candleData);
    }
    
    if (volumeSeriesRef.current && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData);
    }
    
    // 차트 범위 조정
    chartRef.current.timeScale().fitContent();
    
  }, [candleData, volumeData, height]);
  
  // 이동평균선 지표 관리
  useEffect(() => {
    if (!chartRef.current || candleData.length === 0) return;
    
    // 각 이동평균선 처리
    Object.entries(indicators).forEach(([key, isEnabled]) => {
      const period = parseInt(key.replace('ma', ''));
      
      // 이미 생성된 시리즈가 있고, 비활성화되었을 경우 제거
      if (indicatorSeriesRefs.current[key] && !isEnabled) {
        chartRef.current.removeSeries(indicatorSeriesRefs.current[key]);
        indicatorSeriesRefs.current[key] = null;
        return;
      }
      
      // 활성화되었고, 아직 시리즈가 없는 경우 생성
      if (isEnabled && !indicatorSeriesRefs.current[key]) {
        // 이동평균 데이터 계산
        const maData = calculateMA(candleData, period);
        
        // 색상 설정
        let lineColor;
        switch(period) {
          case 5: lineColor = '#FF5733'; break;   // 주황색
          case 10: lineColor = '#33FF57'; break;  // 녹색
          case 20: lineColor = '#3357FF'; break;  // 파란색
          case 60: lineColor = '#F033FF'; break;  // 보라색
          case 120: lineColor = '#FF33A8'; break; // 핑크색
          default: lineColor = '#787B86'; break;  // 회색
        }
        
        // 이동평균선 시리즈 생성
        const maSeries = chartRef.current.addLineSeries({
          color: lineColor,
          lineWidth: 2,
          title: `MA ${period}`,
        });
        
        maSeries.setData(maData);
        indicatorSeriesRefs.current[key] = maSeries;
      }
      
      // 이미 생성된 시리즈가 있고, 여전히 활성화된 경우 데이터 업데이트
      if (isEnabled && indicatorSeriesRefs.current[key]) {
        const maData = calculateMA(candleData, period);
        indicatorSeriesRefs.current[key].setData(maData);
      }
    });
    
  }, [candleData, indicators]);
  
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-symbol">{symbol}</div>
        <div className="chart-timeframe">{timeframe}</div>
      </div>
      <div ref={chartContainerRef} className="chart" />
    </div>
  );
};

export default SimpleChart;
