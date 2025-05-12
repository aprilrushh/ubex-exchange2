# 우선적으로 생성해야 할 파일 목록 (업데이트됨)

## 차트 통합 관련 파일

✅ 이미 구현된 파일:
- `src/services/websocketService.js`: WebSocket 연결 및 구독 관리
- `src/components/Chart/SimpleChart.js`: 차트 컴포넌트
- `src/components/Chart/SimpleChart.css`: 차트 스타일
- `src/utils/chartIndicators.js`: 기술적 지표(MA, RSI, MACD) 계산 유틸리티

다음으로 구현해야 할 파일:

1. `src/components/Chart/Indicators/IndicatorSelector.js`
   - 기술적 지표 선택 UI
   - 지표 표시/숨김 토글

2. `src/components/Chart/TimeframeSelector.js`
   - 타임프레임 선택 UI
   - 타임프레임 변경 이벤트 처리

## 거래 인터페이스 관련 파일

1. `src/components/OrderBook/DepthChart.js`
   - 호가 데이터 시각화
   - 수량별 히트맵 표시

2. `src/components/TradingPanel/OrderTypes/LimitOrder.js`
   - 지정가 주문 입력 폼
   - 가격/수량 유효성 검사

3. `src/components/TradingPanel/OrderTypes/MarketOrder.js`
   - 시장가 주문 입력 폼
   - 수량 기반 주문 로직

## UI/UX 개선 관련 파일

1. `src/context/ThemeContext.js`
   - 테마 상태 관리
   - 다크/라이트 모드 토글 기능

2. `src/components/Common/ThemeToggle.js`
   - 테마 전환 UI 컴포넌트
   - 테마 전환 애니메이션

## 백엔드 강화 관련 파일

✅ 이미 구현된 파일:
- `backend/services/websocketService.js`: 서버측 WebSocket 처리

다음으로 구현해야 할 파일:

1. `backend/services/ExternalApiService.js`
   - 외부 거래소 API 연동
   - 데이터 정규화 및 캐싱

2. `backend/controllers/marketController.js`
   - 시장 데이터 API 엔드포인트
   - 데이터 필터링 및 변환 로직
