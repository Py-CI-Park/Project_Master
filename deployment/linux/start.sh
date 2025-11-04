#!/bin/bash
# 프로젝트 관리 시스템 - Linux 실행 스크립트
# 백엔드 API 서버와 프론트엔드 서버를 동시에 실행합니다.

set -e  # 오류 발생 시 스크립트 중단

echo "================================================================"
echo "프로젝트 관리 시스템 - 서버 실행"
echo "================================================================"
echo

# 스크립트 디렉토리 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_BUILD_DIR="$PROJECT_ROOT/deployment/frontend-build"

echo "[정보] 백엔드 디렉토리: $BACKEND_DIR"
echo "[정보] 프론트엔드 빌드 디렉토리: $FRONTEND_BUILD_DIR"
echo

# 백엔드 가상 환경 확인
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "[오류] 백엔드 가상 환경이 없습니다."
    echo "먼저 설치 스크립트를 실행해주세요: ./deployment/linux/install.sh"
    exit 1
fi

# 로그 디렉토리 생성
mkdir -p "$PROJECT_ROOT/logs"

echo "[1/2] 백엔드 API 서버 시작 중..."
cd "$BACKEND_DIR"
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/logs/backend.pid"
echo "[완료] 백엔드 API 서버가 http://localhost:8000 에서 실행 중입니다. (PID: $BACKEND_PID)"
echo

# Python http.server 확인
if ! command -v python3 &> /dev/null; then
    echo "[오류] Python3가 설치되어 있지 않습니다."
    echo "프론트엔드 서버를 시작할 수 없습니다."
    exit 1
fi

echo "[2/2] 프론트엔드 서버 시작 중..."
cd "$FRONTEND_BUILD_DIR"
nohup python3 -m http.server 5173 > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_ROOT/logs/frontend.pid"
echo "[완료] 프론트엔드 서버가 http://localhost:5173 에서 실행 중입니다. (PID: $FRONTEND_PID)"
echo

echo "================================================================"
echo "서버 실행 완료!"
echo "================================================================"
echo
echo "백엔드 API: http://localhost:8000"
echo "프론트엔드: http://localhost:5173"
echo "API 문서: http://localhost:8000/docs"
echo
echo "로그 파일:"
echo "  - 백엔드: $PROJECT_ROOT/logs/backend.log"
echo "  - 프론트엔드: $PROJECT_ROOT/logs/frontend.log"
echo
echo "서버를 중지하려면 다음 명령을 실행하세요:"
echo "  ./deployment/linux/stop.sh"
echo
