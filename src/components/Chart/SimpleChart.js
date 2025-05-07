import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './SimpleChart.css';

const SimpleChart = ({ symbol, indicators = { ma5: false, ma10: false, ma20: false, ma60: false, ma120: false }, timeframe = '1d' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef({
    candlestick: null,
    volume: null,
    ma5: null,
    ma10: null,
    ma20: null,
    ma60: null,
    ma120: null,
  });
  const [chartData, setChartData] = useState(null);
  
  // 이동평균선 계산 함수
  const calculateMA = (data, period) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // 이동평균 계산에 필요한 데이터가 부족한 경우
        result.push({ time: data[i].time, value: null });
      } else {
        // 이동평균 계산
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close;
        }
        result.push({ time: data[i].time, value: sum / period });
      }
    }
    return result;
  };
  
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // 차트 생성
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
      },
    });
    
    chartRef.current = chart;
    
    // 캔들스틱 시리즈 생성
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#d60000',
      downColor: '#0051c7',
      borderDownColor: '#0051c7',
      borderUpColor: '#d60000',
      wickDownColor: '#0051c7',
      wickUpColor: '#d60000',
    });
    
    seriesRef.current.candlestick = candlestickSeries;
    
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
    
    seriesRef.current.volume = volumeSeries;
    
    // 샘플 데이터 생성 (실제로는 API에서 데이터 가져와야 함)
    const generateCandlestickData = () => {
      const data = [];
      const volumeData = [];
      
      // 타임프레임에 따라 데이터 간격 조정
      let timeStep = 86400; // 1일 (초 단위)
      if (timeframe === '1m') timeStep = 60;
      else if (timeframe === '5m') timeStep = 300;
      else if (timeframe === '15m') timeStep = 900;
      else if (timeframe === '1h') timeStep = 3600;
      else if (timeframe === '4h') timeStep = 14400;
      else if (timeframe === '1w') timeStep = 604800;
      
      // 데이터 개수도 타임프레임에 따라 조정
      let dataCount = 30; // 기본 30일
      if (timeframe === '1m' || timeframe === '5m') dataCount = 100;
      else if (timeframe === '15m' || timeframe === '1h') dataCount = 60;
      else if (timeframe === '1w') dataCount = 20;
      
      const baseDate = new Date(Date.now() - dataCount * timeStep * 1000).getTime() / 1000;
      let basePrice = 2500;
      let lastClose = basePrice;
      
      for (let i = 0; i < dataCount; i++) {
        const time = baseDate + timeStep * i;
        const volatility = 0.1 * (timeframe === '1m' ? 0.2 : timeframe === '1w' ? 1.5 : 1);
        const changePercent = (Math.random() * 2 - 1) * volatility;
        const open = lastClose;
        const close = Math.max(0, open * (1 + changePercent));
        const high = Math.max(open, close) * (1 + Math.random() * 0.03);
        const low = Math.min(open, close) * (1 - Math.random() * 0.03);
        const volume = Math.floor(Math.random() * 1000000) + 100000;
        
        lastClose = close;
        
        data.push({
          time,
          open,
          high,
          low,
          close
        });
        
        volumeData.push({
          time,
          value: volume,
          color: close >= open ? 'rgba(214, 0, 0, 0.5)' : 'rgba(0, 81, 199, 0.5)'
        });
      }
      
      return { data, volumeData };
    };

    // 선택한 심볼과 타임프레임에 대한 차트 데이터 가져오기
    const fetchChartData = async () => {
      try {
        // 실제 앱에서는 API에서 데이터를 가져와야 함
        // const response = await fetch(`/api/chart/${symbol}/${timeframe}/candles`);
        // const data = await response.json();
        // return data;
        
        // 지금은 생성된 샘플 데이터 사용
        return generateCandlestickData();
      } catch (error) {
        console.error('차트 데이터 가져오기 오류:', error);
        return generateCandlestickData();
      }
    };

    // 데이터로 차트 설정
    const setupChart = async () => {
      const { data, volumeData } = await fetchChartData();
      
      candlestickSeries.setData(data);
      volumeSeries.setData(volumeData);
      
      // 차트 데이터 저장
      setChartData({ candles: data, volume: volumeData });
      
      // 차트 내용에 맞게 뷰 조정
      chart.timeScale().fitContent();
    };
    
    setupChart();
    
    // 윈도우 크기 조정 처리
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, timeframe]);
  
  // 이동평균선 표시/숨김 처리
  useEffect(() => {
    if (!chartRef.current || !chartData) return;
    
    // 이동평균선 설정
    const maSettings = [
      { name: 'ma5', period: 5, color: '#2196F3', width: 1 },
      { name: 'ma10', period: 10, color: '#FF9800', width: 1 },
      { name: 'ma20', period: 20, color: '#E91E63', width: 1 },
      { name: 'ma60', period: 60, color: '#8BC34A', width: 2 },
      { name: 'ma120', period: 120, color: '#9C27B0', width: 2 }
    ];
    
    maSettings.forEach(({ name, period, color, width }) => {
      if (indicators[name]) {
        // 이동평균선 표시
        if (!seriesRef.current[name]) {
          seriesRef.current[name] = chartRef.current.addLineSeries({
            color,
            lineWidth: width,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
            autoscaleInfoProvider: () => ({
              priceRange: {
                minValue: 0,
                maxValue: 0,
              },
              margins: {
                above: 0,
                below: 0,
              },
            })
          });
        }
        
        const maData = calculateMA(chartData.candles, period);
        seriesRef.current[name].setData(maData);
      } else {
        // 이동평균선 숨김
        if (seriesRef.current[name]) {
          chartRef.current.removeSeries(seriesRef.current[name]);
          seriesRef.current[name] = null;
        }
      }
    });
    
  }, [indicators, chartData]);
  
  return (
    <div className="chart-container">
      <div ref={chartContainerRef} className="chart" />
    </div>
  );
};

export default SimpleChart;