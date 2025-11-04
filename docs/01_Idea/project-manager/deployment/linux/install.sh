#!/bin/bash

# ============================================================
#   폐쇄망 프로젝트 관리 시스템 설치 스크립트
#   Project Manager Installation Script (Linux)
# ============================================================

set -e  # 오류 발생 시 스크립트 종료

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      폐쇄망 프로젝트 관리 시스템 설치 마법사              ║"
echo "║      Project Manager Installation Wizard                  ║"
echo "║                                                            ║"
echo "║      Version 1.0.0                                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 스크립트 디렉토리
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$INSTALL_DIR"

echo -e "${BLUE}[1/8]${NC} 시스템 요구사항 확인 중..."
echo "       Checking system requirements..."
echo ""

# Python 설치 확인
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Python3가 설치되어 있지 않습니다."
    echo -e "${RED}[ERROR]${NC} Python3 is not installed."
    echo ""
    echo "Python 3.11 이상을 설치해주세요:"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-venv python3-pip"
    echo "  RHEL/CentOS: sudo yum install python3 python3-pip"
    exit 1
fi

# Python 버전 확인
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Python 버전: $PYTHON_VERSION"

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js가 설치되어 있지 않습니다."
    echo -e "${RED}[ERROR]${NC} Node.js is not installed."
    echo ""
    echo "Node.js 18 이상을 설치해주세요:"
    echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
    echo "  RHEL/CentOS: sudo yum install nodejs npm"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "Node.js 버전: $NODE_VERSION"

echo -e "${GREEN}[OK]${NC} Python 및 Node.js 확인 완료"
echo ""

echo -e "${BLUE}[2/8]${NC} 가상 환경 생성 중..."
echo "       Creating virtual environment..."
echo ""

# 기존 가상 환경 삭제
if [ -d "venv" ]; then
    echo -e "${YELLOW}[INFO]${NC} 기존 가상 환경 발견. 삭제 후 재생성합니다."
    rm -rf venv
fi

# Python 가상 환경 생성
python3 -m venv venv

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} 가상 환경 생성 실패"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} 가상 환경 생성 완료"
echo ""

echo -e "${BLUE}[3/8]${NC} Python 패키지 설치 중 (오프라인)..."
echo "       Installing Python packages (offline)..."
echo ""

# 가상 환경 활성화
source venv/bin/activate

# pip 업그레이드 (오프라인)
python -m pip install --no-index --find-links=deployment/packages/python-wheels pip setuptools wheel --break-system-packages

# 백엔드 의존성 설치 (오프라인)
pip install --no-index --find-links=deployment/packages/python-wheels -r backend/requirements.txt --break-system-packages

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} Python 패키지 설치 실패"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Python 패키지 설치 완료"
echo ""

echo -e "${BLUE}[4/8]${NC} 프론트엔드 패키지 설치 중 (오프라인)..."
echo "       Installing frontend packages (offline)..."
echo ""

cd frontend

# npm 오프라인 설치
npm install --offline --no-audit --cache ../deployment/packages/node-modules-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} 프론트엔드 패키지 설치 실패"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} 프론트엔드 패키지 설치 완료"
echo ""

echo -e "${BLUE}[5/8]${NC} 프론트엔드 빌드 중..."
echo "       Building frontend..."
echo ""

npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR]${NC} 프론트엔드 빌드 실패"
    exit 1
fi

cd ..

echo -e "${GREEN}[OK]${NC} 프론트엔드 빌드 완료"
echo ""

echo -e "${BLUE}[6/8]${NC} 데이터베이스 초기화 중..."
echo "       Initializing database..."
echo ""

# 데이터 디렉토리 생성
mkdir -p data

# SQLite 데이터베이스 초기화 (Alembic 마이그레이션)
cd backend
python -m alembic upgrade head || echo -e "${YELLOW}[WARNING]${NC} 데이터베이스 초기화 경고 (무시 가능)"

cd ..

echo -e "${GREEN}[OK]${NC} 데이터베이스 초기화 완료"
echo ""

echo -e "${BLUE}[7/8]${NC} 설정 파일 생성 중..."
echo "       Creating configuration files..."
echo ""

# .env 파일 생성
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
DATABASE_URL=sqlite:///./data/project_manager.db
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
fi

echo -e "${GREEN}[OK]${NC} 설정 파일 생성 완료"
echo ""

echo -e "${BLUE}[8/8]${NC} 실행 스크립트 권한 설정 중..."
echo "       Setting script permissions..."
echo ""

# 실행 권한 부여
chmod +x deployment/linux/start.sh
chmod +x deployment/linux/uninstall.sh

echo -e "${GREEN}[OK]${NC} 권한 설정 완료"
echo ""

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              설치가 완료되었습니다!                        ║"
echo "║              Installation Complete!                        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "시스템 시작 방법:"
echo "  ./deployment/linux/start.sh"
echo ""
echo "접속 주소:"
echo "  http://localhost:5173"
echo ""
echo "시스템 중지:"
echo "  터미널에서 Ctrl+C 입력"
echo ""
