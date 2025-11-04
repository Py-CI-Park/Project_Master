#!/bin/bash
# 프로젝트 관리 시스템 - Linux 설치 스크립트
# 폐쇄망 환경에서 Python 패키지 및 프론트엔드 빌드 파일을 설치합니다.

set -e  # 오류 발생 시 스크립트 중단

echo "================================================================"
echo "프로젝트 관리 시스템 - Linux 설치"
echo "================================================================"
echo

# 스크립트 디렉토리 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "[1/5] Python 설치 확인..."
if ! command -v python3 &> /dev/null; then
    echo "[오류] Python3가 설치되어 있지 않습니다."
    echo "Python 3.10 이상을 설치한 후 다시 실행해주세요."
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "[완료] Python $PYTHON_VERSION 설치 확인 완료"
echo

echo "[2/5] 백엔드 디렉토리로 이동..."
cd "$PROJECT_ROOT/backend" || {
    echo "[오류] 백엔드 디렉토리를 찾을 수 없습니다."
    exit 1
}
echo "[완료] 디렉토리 이동 완료: $(pwd)"
echo

echo "[3/5] Python 가상 환경 생성..."
if [ -d "venv" ]; then
    echo "[정보] 기존 가상 환경이 있습니다. 삭제하고 다시 생성하시겠습니까? (y/N)"
    read -r RECREATE
    if [ "$RECREATE" = "y" ] || [ "$RECREATE" = "Y" ]; then
        echo "[정보] 기존 가상 환경 삭제 중..."
        rm -rf venv
    else
        echo "[정보] 기존 가상 환경을 유지합니다."
    fi
fi

if [ ! -d "venv" ]; then
    python3 -m venv venv || {
        echo "[오류] 가상 환경 생성에 실패했습니다."
        exit 1
    }
    echo "[완료] 가상 환경 생성 완료"
else
    echo "[정보] 기존 가상 환경 사용"
fi
echo

echo "[4/5] 의존성 패키지 설치 (폐쇄망 모드)..."
source venv/bin/activate
pip install --no-index --find-links="$DEPLOYMENT_DIR/packages/python-wheels" -r requirements.txt || {
    echo "[오류] 패키지 설치에 실패했습니다."
    echo "패키지 파일이 deployment/packages/python-wheels 디렉토리에 있는지 확인해주세요."
    exit 1
}
echo "[완료] 의존성 패키지 설치 완료"
echo

echo "[5/5] 데이터베이스 초기화..."
python "$DEPLOYMENT_DIR/database/init_db.py" || {
    echo "[경고] 데이터베이스 초기화에 실패했습니다."
    echo "나중에 수동으로 초기화할 수 있습니다:"
    echo "   python deployment/database/init_db.py"
}
echo "[완료] 데이터베이스 초기화 완료"
echo

echo "================================================================"
echo "설치 완료!"
echo "================================================================"
echo
echo "다음 명령으로 서버를 실행할 수 있습니다:"
echo "   ./deployment/linux/start.sh"
echo
