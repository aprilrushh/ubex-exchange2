#!/bin/bash

# 현재 위치가 Git 저장소인지 확인
if [ ! -d ".git" ]; then
  echo "현재 디렉토리는 Git 저장소가 아닙니다."
  echo "Git 초기화를 진행할까요? (y/n)"
  read response
  if [ "$response" = "y" ]; then
    git init
    echo "Git 저장소 초기화 완료"
  else
    echo "중단합니다."
    exit 1
  fi
fi

# 메인 브랜치 확인
MAIN_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "master")
echo "현재 메인 브랜치: $MAIN_BRANCH"

# 브랜치 생성 함수
create_branch() {
  local branch_name="$1"
  echo "브랜치 '$branch_name' 생성 중..."
  
  # 브랜치가 이미 있는지 확인
  if git show-ref --verify --quiet "refs/heads/$branch_name"; then
    echo "브랜치 '$branch_name'이(가) 이미 존재합니다."
  else
    git checkout -b "$branch_name" "$MAIN_BRANCH"
    echo "브랜치 '$branch_name' 생성 완료"
  fi
}

# 메인 브랜치로 이동
git checkout "$MAIN_BRANCH"

# 주요 기능별 브랜치 생성
create_branch "feature/chart-integration"
create_branch "feature/trading-interface"
create_branch "feature/ui-improvements"
create_branch "feature/backend-enhancements"

# 현재 브랜치 목록 출력
echo -e "\n현재 브랜치 목록:"
git branch

echo -e "\n작업 시작 방법:"
echo "1. 해당 기능 브랜치로 이동: git checkout feature/chart-integration"
echo "2. 작업 후 커밋: git add . && git commit -m \"구현 내용 설명\""
echo "3. 작업 완료 후 메인 브랜치 병합: git checkout $MAIN_BRANCH && git merge feature/chart-integration"
