#!/bin/bash
# 프로젝트 관리 시스템 - Linux 서버 종료 스크립트

echo "================================================================"
echo "프로젝트 관리 시스템 - 서버 종료"
echo "================================================================"
echo

# 스크립트 디렉토리 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

BACKEND_PID_FILE="$PROJECT_ROOT/logs/backend.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/logs/frontend.pid"

# 백엔드 서버 종료
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    echo "[정보] 백엔드 서버 종료 중... (PID: $BACKEND_PID)"
    kill "$BACKEND_PID" 2>/dev/null && echo "[완료] 백엔드 서버가 종료되었습니다." || echo "[정보] 백엔드 서버가 이미 종료되었습니다."
    rm -f "$BACKEND_PID_FILE"
else
    echo "[정보] 백엔드 PID 파일이 없습니다."
fi

# 프론트엔드 서버 종료
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    echo "[정보] 프론트엔드 서버 종료 중... (PID: $FRONTEND_PID)"
    kill "$FRONTEND_PID" 2>/dev/null && echo "[완료] 프론트엔드 서버가 종료되었습니다." || echo "[정보] 프론트엔드 서버가 이미 종료되었습니다."
    rm -f "$FRONTEND_PID_FILE"
else
    echo "[정보] 프론트엔드 PID 파일이 없습니다."
fi

echo
echo "================================================================"
echo "서버 종료 완료!"
echo "================================================================"
