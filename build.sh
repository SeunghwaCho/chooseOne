#!/bin/bash
# Choose One - 릴리즈 빌드 스크립트
# 실행에 필요한 파일만 release/ 폴더로 복사

set -e

RELEASE_DIR="release"

echo "=== Choose One 빌드 시작 ==="

# 1. TypeScript 컴파일
echo "[1/3] TypeScript 컴파일 중..."
npm run build

# 2. release 폴더 초기화
echo "[2/3] release 폴더 초기화..."
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

# 3. 실행 필수 파일만 복사
echo "[3/3] 파일 복사 중..."
cp index.html "$RELEASE_DIR/"
cp -r dist/ "$RELEASE_DIR/dist/"

echo ""
echo "=== 빌드 완료 ==="
echo "릴리즈 파일: ./$RELEASE_DIR/"
echo ""
echo "실행 방법:"
echo "  cd $RELEASE_DIR && python3 -m http.server 8001"
echo "  브라우저: http://localhost:8001"
