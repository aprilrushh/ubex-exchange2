#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== UBEX Exchange 프로젝트 구조 분석 ===${NC}"
echo -e "분석 날짜: $(date)\n"

# 1. 현재 프로젝트 구조 출력
echo -e "${YELLOW}1. 현재 프로젝트 구조${NC}"
echo "----------------------------------------"
if command -v tree &> /dev/null; then
    tree -I 'node_modules|build|dist|coverage' -L 3
else
    find . -type d -not -path '*/node_modules/*' -not -path '*/build/*' -not -path '*/dist/*' -not -path './.*' | head -20
fi
echo ""

# 2. 이미 구현된 주요 파일 확인
echo -e "${YELLOW}2. 이미 구현된 주요 파일 확인${NC}"
echo "----------------------------------------"
files_to_check=(
    "server.js"
    "backend/services/websocketService.js"
    "src/components/Chart/SimpleChart.js"
    "src/components/Chart/SimpleChart.css"
    "src/services/websocketService.js"
    "src/utils/chartIndicators.js"
    "src/components/TradingView/TradingView.js"
    "src/components/OrderBook/OrderBook.js"
    "src/components/TradingPanel/TradingPanel.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file${NC}"
    fi
done
echo ""

# 3. 컴포넌트 분석
echo -e "${YELLOW}3. 구현된 React 컴포넌트 분석${NC}"
echo "----------------------------------------"
if [ -d "src/components" ]; then
    component_dirs=($(find src/components -type d -maxdepth 1 | sed '1d' | sort))
    for dir in "${component_dirs[@]}"; do
        js_count=$(find "$dir" -name "*.js" | wc -l)
        css_count=$(find "$dir" -name "*.css" | wc -l)
        dir_name=$(basename "$dir")
        if [ $js_count -gt 0 ] || [ $css_count -gt 0 ]; then
            echo -e "${GREEN}✓ $dir_name: JS $js_count개, CSS $css_count개${NC}"
        else
            echo -e "${RED}✗ $dir_name: 파일 없음${NC}"
        fi
    done
else
    echo -e "${RED}src/components 디렉토리 없음${NC}"
fi
echo ""

# 4. 다음 우선순위 작업 제안
echo -e "${YELLOW}4. 다음 우선순위 작업 (계획 기반)${NC}"
echo "----------------------------------------"
echo -e "${BLUE}A. 차트 기능 완성 (높은 우선순위)${NC}"
echo "   - src/components/Chart/Indicators/IndicatorSelector.js 생성"
echo "   - src/components/Chart/TimeframeSelector.js 생성"
echo "   - SimpleChart.js에 WebSocket 연결 추가"
echo ""

echo -e "${BLUE}B. 거래 인터페이스 개선${NC}"
echo "   - OrderBook.js에 실시간 데이터 연결"
echo "   - src/components/TradingPanel/OrderTypes/LimitOrder.js 생성"
echo "   - src/components/TradingPanel/OrderTypes/MarketOrder.js 생성"
echo ""

echo -e "${BLUE}C. UI/UX 개선${NC}"
echo "   - src/context/ThemeContext.js 생성"
echo "   - src/components/Common/ThemeToggle.js 생성"
echo "   - 반응형 디자인 적용"
echo ""

# 5. 즉시 생성 가능한 파일 제안
echo -e "${YELLOW}5. 즉시 생성 가능한 파일${NC}"
echo "----------------------------------------"
echo "다음 명령어로 필요한 폴더 구조를 생성할 수 있습니다:"
echo ""
echo -e "${GREEN}mkdir -p src/components/Chart/Indicators${NC}"
echo -e "${GREEN}mkdir -p src/components/TradingPanel/OrderTypes${NC}"
echo -e "${GREEN}mkdir -p src/components/Common${NC}"
echo -e "${GREEN}mkdir -p src/context${NC}"
echo ""

# 6. 테스트 페이지 확인
echo -e "${YELLOW}6. 테스트 페이지 상태${NC}"
echo "----------------------------------------"
test_pages=(
    "public/test-login.html"
    "public/test-realtime.html"
    "public/test-chart-websocket.html"
)

for page in "${test_pages[@]}"; do
    if [ -f "$page" ]; then
        echo -e "${GREEN}✓ $page${NC}"
    else
        echo -e "${RED}✗ $page (생성 권장)${NC}"
    fi
done
echo ""

# 7. 다음 구현 추천
echo -e "${YELLOW}7. 다음 구현 추천 순서${NC}"
echo "----------------------------------------"
echo "1. IndicatorSelector 컴포넌트 (차트 지표 선택 UI)"
echo "2. WebSocket과 SimpleChart 연결 완성"
echo "3. 이동평균선 표시 기능"
echo "4. 타임프레임 선택 기능"
echo ""

# 8. 개발 환경 체크
echo -e "${YELLOW}8. 개발 환경 체크${NC}"
echo "----------------------------------------"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json 존재${NC}"
    if grep -q "lightweight-charts" package.json; then
        echo -e "${GREEN}✓ lightweight-charts 설치됨${NC}"
    else
        echo -e "${RED}✗ lightweight-charts 미설치 (npm install lightweight-charts 필요)${NC}"
    fi
    if grep -q "socket.io" package.json; then
        echo -e "${GREEN}✓ socket.io 설치됨${NC}"
    else
        echo -e "${RED}✗ socket.io 미설치 (npm install socket.io-client 필요)${NC}"
    fi
else
    echo -e "${RED}✗ package.json 없음${NC}"
fi

echo ""
echo -e "${BLUE}=== 분석 완료 ===${NC}"
echo "이 스크립트는 현재 프로젝트 상태를 기반으로 다음 작업을 제안합니다."
echo "문서화된 계획과 비교하여 우선순위를 조정할 수 있습니다."
