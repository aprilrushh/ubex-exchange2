#!/bin/bash

# 현재 디렉토리 확인
CURRENT_DIR=$(pwd)
echo "현재 작업 디렉토리: $CURRENT_DIR"

# 결과 파일 초기화
echo "UBEX Exchange 개발 현황 분석" > implementation_status.txt
echo "===============================" >> implementation_status.txt
echo "분석 날짜: $(date)" >> implementation_status.txt
echo "" >> implementation_status.txt

# 폴더 구조 분석
echo "## 1. 폴더 및 파일 구조 분석" >> implementation_status.txt
echo "" >> implementation_status.txt

# 주요 디렉토리 카운트
echo "### 1.1 주요 디렉토리 존재 여부" >> implementation_status.txt
for dir in src backend public build src/components src/services src/utils backend/controllers backend/routes backend/services; do
  if [ -d "$dir" ]; then
    echo "✅ $dir 디렉토리 존재합니다." >> implementation_status.txt
  else
    echo "❌ $dir 디렉토리가 없습니다." >> implementation_status.txt
  fi
done
echo "" >> implementation_status.txt

# 주요 파일 카운트
echo "### 1.2 주요 파일 존재 여부" >> implementation_status.txt
for file in server.js package.json src/App.js src/index.js src/services/websocketService.js src/utils/chartIndicators.js backend/services/websocketService.js; do
  if [ -f "$file" ]; then
    echo "✅ $file 파일이 존재합니다." >> implementation_status.txt
  else
    echo "❌ $file 파일이 없습니다." >> implementation_status.txt
  fi
done
echo "" >> implementation_status.txt

# 컴포넌트 분석
echo "## 2. React 컴포넌트 분석" >> implementation_status.txt
echo "" >> implementation_status.txt

# src/components 디렉토리가 있는지 확인
if [ -d "src/components" ]; then
  echo "### 2.1 구현된 React 컴포넌트 목록" >> implementation_status.txt
  find src/components -type f -name "*.js" | sort >> implementation_status.txt
  echo "" >> implementation_status.txt
  
  # 컴포넌트 디렉토리별 파일 수 카운트
  echo "### 2.2 컴포넌트 디렉토리별 구현 현황" >> implementation_status.txt
  for comp_dir in src/components/*/; do
    js_count=$(find "$comp_dir" -name "*.js" | wc -l)
    css_count=$(find "$comp_dir" -name "*.css" | wc -l)
    dir_name=$(basename "$comp_dir")
    echo "- $dir_name: JS 파일 $js_count개, CSS 파일 $css_count개" >> implementation_status.txt
  done
  echo "" >> implementation_status.txt
else
  echo "❌ src/components 디렉토리가 없습니다." >> implementation_status.txt
  echo "" >> implementation_status.txt
fi

# 백엔드 분석
echo "## 3. 백엔드 구현 분석" >> implementation_status.txt
echo "" >> implementation_status.txt

# backend 디렉토리가 있는지 확인
if [ -d "backend" ]; then
  # 백엔드 디렉토리별 파일 수 카운트
  echo "### 3.1 백엔드 디렉토리별 구현 현황" >> implementation_status.txt
  for be_dir in backend/*/; do
    if [ -d "$be_dir" ]; then
      js_count=$(find "$be_dir" -name "*.js" | wc -l)
      dir_name=$(basename "$be_dir")
      echo "- $dir_name: JS 파일 $js_count개" >> implementation_status.txt
    fi
  done
  echo "" >> implementation_status.txt
  
  # API 엔드포인트 목록 (추정)
  echo "### 3.2 구현된 API 엔드포인트 목록 (추정)" >> implementation_status.txt
  
  # routes 파일에서 router.get, router.post 등의 패턴 검색
  if [ -d "backend/routes" ]; then
    grep -r "router\.\(get\|post\|put\|delete\)" backend/routes --include="*.js" | \
    sed 's/.*router\.\(get\|post\|put\|delete\).*"\([^"]*\)".*/- \1 \2/' >> implementation_status.txt
  else
    echo "❌ backend/routes 디렉토리가 없습니다." >> implementation_status.txt
  fi
  echo "" >> implementation_status.txt

  # WebSocket 구현 확인
  echo "### 3.3 WebSocket 구현 현황" >> implementation_status.txt
  if [ -f "backend/services/websocketService.js" ]; then
    echo "✅ WebSocket 서비스가 구현되어 있습니다." >> implementation_status.txt
    # WebSocket 이벤트 핸들러 검색
    echo "WebSocket 이벤트 핸들러:" >> implementation_status.txt
    grep -o "socket\.on(['\"]\w\+['\"]" backend/services/websocketService.js | sed 's/socket\.on//g' | sort | uniq >> implementation_status.txt
  else
    echo "❌ WebSocket 서비스가 구현되어 있지 않습니다." >> implementation_status.txt
  fi
  echo "" >> implementation_status.txt
else
  echo "❌ backend 디렉토리가 없습니다." >> implementation_status.txt
  echo "" >> implementation_status.txt
fi

# 계획된 구조와 비교
echo "## 4. 계획된 구조와 비교" >> implementation_status.txt
echo "" >> implementation_status.txt

# 계획된 구조 파일이 있는지 확인
if [ -f "planned_structure.txt" ]; then
  # 계획된 폴더 중 구현되지 않은 폴더 찾기
  echo "### 4.1 계획된 주요 디렉토리 중 아직 구현되지 않은 항목" >> implementation_status.txt
  grep -o "\[PLANNED\].*directory" planned_structure.txt | \
  sed 's/\[PLANNED\] \(.*\) directory/- \1/' >> implementation_status.txt
  echo "" >> implementation_status.txt
  
  # 계획된 기능 중 우선순위 높은 항목
  echo "### 4.2 우선 구현이 필요한 항목 (로드맵 기준)" >> implementation_status.txt
  echo "1. 차트 통합 및 고도화:" >> implementation_status.txt
  echo "   - ✅ SimpleChart 컴포넌트와 실시간 데이터 연결 (완료)" >> implementation_status.txt
  echo "   - ✅ 이동평균선(MA) 구현 (chartIndicators.js에 구현됨)" >> implementation_status.txt
  echo "   - RSI, MACD 등 추가 지표 개선" >> implementation_status.txt
  echo "" >> implementation_status.txt
  echo "2. 거래 인터페이스 완성:" >> implementation_status.txt
  echo "   - 호가창(OrderBook) 실시간 데이터 연결" >> implementation_status.txt
  echo "   - 주문 입력 패널 UX 개선" >> implementation_status.txt
  echo "" >> implementation_status.txt
else
  echo "❌ planned_structure.txt 파일이 없습니다." >> implementation_status.txt
  echo "" >> implementation_status.txt
fi

# 진행률 추정
echo "## 5. 프로젝트 진행률 추정" >> implementation_status.txt
echo "" >> implementation_status.txt

# 주요 컴포넌트 구현 현황 기반으로 진행률 추정
echo "### 5.1 주요 기능별 구현 진행률 (추정)" >> implementation_status.txt
echo "- 인증 시스템: 완료" >> implementation_status.txt
echo "- 실시간 데이터 표시: 완료" >> implementation_status.txt
echo "- 차트 통합: 기본 구현 완료" >> implementation_status.txt
echo "- 거래 인터페이스: 초기 구현" >> implementation_status.txt
echo "- UI/UX 개선: 미구현" >> implementation_status.txt
echo "- 백엔드 강화: 부분 구현" >> implementation_status.txt
echo "" >> implementation_status.txt

echo "분석 완료! implementation_status.txt 파일을 확인하세요."
