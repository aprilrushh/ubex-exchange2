// public/js/chart-websocket-test.js
document.addEventListener('DOMContentLoaded', function() {
  const socket = io();
  const chartContainer = document.getElementById('chart-container');
  let chart, candleSeries;
  
  // 차트 생성
  function createChart() {
    // 차트 및 캔들스틱 시리즈 생성
    chart = LightweightCharts.createChart(chartContainer, {
      width: chartContainer.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#333',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
      },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
      timeScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
    });
    
    // 한국식 스타일: 상승-빨간색, 하락-파란색
    candleSeries = chart.addCandlestickSeries({
      upColor: '#d60000',
      downColor: '#0051c7',
      borderUpColor: '#d60000',
      borderDownColor: '#0051c7',
      wickUpColor: '#d60000',
      wickDownColor: '#0051c7',
    });
    
    return { chart, candleSeries };
  }
  
  // 초기 데이터 요청
  function requestInitialData(symbol = 'BTC/USDT', interval = '1m') {
    socket.emit('getCandles', { symbol, interval });
  }
  
  // 웹소켓 이벤트 리스너 설정
  function setupSocketListeners() {
    // 초기 캔들스틱 데이터 수신
    socket.on('candles', function(data) {
      candleSeries.setData(data);
      chart.timeScale().fitContent();
    });
    
    // 실시간 캔들스틱 업데이트
    socket.on('candlestick', function(data) {
      candleSeries.update(data);
    });
  }
  
  // 차트 크기 조정 처리
  function handleResize() {
    if (chart) {
      chart.applyOptions({ width: chartContainer.clientWidth });
    }
  }
  
  // 초기화 및 이벤트 설정
  function init() {
    createChart();
    setupSocketListeners();
    requestInitialData();
    
    window.addEventListener('resize', handleResize);
    
    // 타임프레임 변경 이벤트 처리
    document.querySelectorAll('.timeframe-button').forEach(button => {
      button.addEventListener('click', function() {
        const interval = this.getAttribute('data-interval');
        requestInitialData('BTC/USDT', interval);
        
        // 활성 버튼 스타일 변경
        document.querySelectorAll('.timeframe-button').forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
  }
  
  // 페이지 로드 시 초기화
  init();
});
