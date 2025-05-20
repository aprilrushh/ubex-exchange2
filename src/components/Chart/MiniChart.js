import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

/**
 * MiniChart 컴포넌트 - 업비트 스타일의 상단 미니 차트
 * 
 * @param {Object} props
 * @param {string} props.symbol - 코인 심볼 (예: "BTC/KRW")
 * @param {number} props.width - 차트 너비 (기본값: 100)
 * @param {number} props.height - 차트 높이 (기본값: 40)
 * @param {number} props.priceChangePercent - 가격 변동률 (예: 0.25, -1.5)
 * @param {Array} props.data - 차트 데이터 배열 (없으면 샘플 데이터 사용)
 */
const MiniChart = ({ 
  symbol, 
  width = 100, 
  height = 40, 
  priceChangePercent = 0, 
  data = null 
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState([]);

  // 상승/하락에 따른 색상 설정 (한국식: 상승-빨간색, 하락-파란색)
  const chartColor = priceChangePercent >= 0 ? '#d60000' : '#0051c7';

  useEffect(() => {
    // 차트 데이터 설정
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      generateSampleData();
    }
  }, [data, symbol]);

  // 샘플 데이터 생성 함수
  const generateSampleData = () => {
    const sampleData = [];
    const now = new Date();
    let price = 100;

    // 24시간 데이터 생성 (5분 간격)
    for (let i = 0; i < 288; i++) {
      const time = new Date(now - (288 - i) * 5 * 60 * 1000);
      
      // 마지막 가격의 ±0.5% 범위 내에서 랜덤 변동
      const change = (Math.random() - 0.5) * 0.01;
      price = price * (1 + change);
      
      if (i === 287) {
        // 마지막 데이터 포인트는 현재가로 맞춤 (priceChangePercent 반영)
        price = 100 * (1 + priceChangePercent / 100);
      }
      
      sampleData.push({
        time: time.getTime() / 1000,
        value: price,
      });
    }
    
    setChartData(sampleData);
  };

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // 이전 차트 정리
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // 차트 생성
    const chart = createChart(chartContainerRef.current, {
      width: width,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        horzLines: { visible: false },
        vertLines: { visible: false },
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
        barSpacing: 3,
      },
      crosshair: {
        horzLine: { visible: false },
        vertLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    // 라인 시리즈 추가
    const lineSeries = chart.addLineSeries({
      color: chartColor,
      lineWidth: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // 데이터 설정
    lineSeries.setData(chartData);

    // 마지막 데이터 포인트로 스크롤
    chart.timeScale().fitContent();

    // 차트 참조 저장
    chartRef.current = chart;

    // 컴포넌트 언마운트 시 차트 정리
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartData, chartColor, width, height]);

  return (
    <div className="mini-chart-container">
      <div ref={chartContainerRef} className="mini-chart" />
    </div>
  );
};

export default MiniChart;