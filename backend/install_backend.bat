@echo off
chcp 65001 > nul
echo ========================================
echo  폐쇄망 프로젝트 관리 시스템 v2.0.0
echo  Backend 설치 스크립트
echo ========================================
echo.

:: 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [경고] 관리자 권한으로 실행하는 것을 권장합니다.
    echo.
)

:: 현재 디렉토리가 backend인지 확인
if not exist "app\main.py" (
    echo [오류] backend 폴더에서 실행해주세요.
    echo 현재 위치: %CD%
    pause
    exit /b 1
)

:: Python 설치 확인
echo [1/6] Python 설치 확인 중...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python 3.10 이상을 설치해주세요: https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version
echo ✓ Python 설치 확인 완료
echo.

:: 가상환경 생성
echo [2/6] 가상환경 생성 중...
if exist "venv" (
    echo 기존 가상환경 발견. 삭제하고 새로 생성합니다.
    rmdir /s /q venv
)

python -m venv venv
if %errorLevel% neq 0 (
    echo [오류] 가상환경 생성 실패
    pause
    exit /b 1
)
echo ✓ 가상환경 생성 완료
echo.

:: 가상환경 활성화
echo [3/6] 가상환경 활성화 중...
call venv\Scripts\activate.bat
if %errorLevel% neq 0 (
    echo [오류] 가상환경 활성화 실패
    pause
    exit /b 1
)
echo ✓ 가상환경 활성화 완료
echo.

:: pip 업그레이드
echo [4/6] pip 업그레이드 중...
python -m pip install --upgrade pip
echo ✓ pip 업그레이드 완료
echo.

:: requirements.txt 설치
echo [5/6] 의존성 패키지 설치 중...
echo 이 작업은 몇 분이 소요될 수 있습니다...
if not exist "requirements.txt" (
    echo [오류] requirements.txt 파일이 없습니다.
    pause
    exit /b 1
)

pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo [오류] 패키지 설치 실패
    pause
    exit /b 1
)
echo ✓ 의존성 패키지 설치 완료
echo.

:: bcrypt 버전 조정 (중요!)
echo [6/6] bcrypt 버전 조정 중...
echo ⚠️  중요: passlib 호환성을 위해 bcrypt 3.2.0 설치
pip uninstall -y bcrypt
pip install bcrypt==3.2.0
if %errorLevel% neq 0 (
    echo [경고] bcrypt 설치 실패. 수동으로 설치해주세요.
)

:: 추가 필수 패키지 설치
echo.
echo 추가 패키지 설치 중...
pip install python-socketio python-engineio email-validator
echo ✓ 추가 패키지 설치 완료
echo.

:: 설치 확인
echo ========================================
echo 설치 완료! 패키지 목록 확인:
echo ========================================
pip list | findstr /i "fastapi uvicorn sqlalchemy bcrypt passlib socketio"
echo.

echo ========================================
echo  Backend 설치가 완료되었습니다!
echo ========================================
echo.
echo 다음 단계:
echo   1. run_backend.bat 실행하여 서버 시작
echo   2. 브라우저에서 http://localhost:8000/docs 접속
echo.
echo 또는 수동 실행:
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
pause
