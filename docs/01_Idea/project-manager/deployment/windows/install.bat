@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

REM ============================================================
REM   폐쇄망 프로젝트 관리 시스템 설치 스크립트
REM   Project Manager Installation Script (Windows)
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║      폐쇄망 프로젝트 관리 시스템 설치 마법사              ║
echo ║      Project Manager Installation Wizard                  ║
echo ║                                                            ║
echo ║      Version 1.0.0                                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] 이 스크립트는 관리자 권한이 필요합니다.
    echo [ERROR] Administrator privileges required.
    echo.
    pause
    exit /b 1
)

echo [1/8] 시스템 요구사항 확인 중...
echo       Checking system requirements...
echo.

REM Python 설치 확인
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Python이 설치되어 있지 않습니다.
    echo [WARNING] Python is not installed.
    echo.
    echo Python 3.11 이상을 설치해주세요.
    echo Please install Python 3.11 or higher.
    echo.
    echo 설치 파일 위치: deployment\packages\python-installer\
    echo Installer location: deployment\packages\python-installer\
    echo.
    pause
    exit /b 1
)

REM Node.js 설치 확인 (프론트엔드 빌드용)
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Node.js가 설치되어 있지 않습니다.
    echo [WARNING] Node.js is not installed.
    echo.
    echo Node.js 18 이상을 설치해주세요.
    echo Please install Node.js 18 or higher.
    echo.
    echo 설치 파일 위치: deployment\packages\node-installer\
    echo Installer location: deployment\packages\node-installer\
    echo.
    pause
    exit /b 1
)

echo [OK] Python 및 Node.js 확인 완료
echo.

REM 설치 디렉토리 설정
set "INSTALL_DIR=%~dp0.."
cd /d "%INSTALL_DIR%"

echo [2/8] 가상 환경 생성 중...
echo       Creating virtual environment...
echo.

REM Python 가상 환경 생성
if exist "venv" (
    echo [INFO] 기존 가상 환경 발견. 삭제 후 재생성합니다.
    rmdir /s /q venv
)

python -m venv venv
if %errorLevel% neq 0 (
    echo [ERROR] 가상 환경 생성 실패
    pause
    exit /b 1
)

echo [OK] 가상 환경 생성 완료
echo.

echo [3/8] Python 패키지 설치 중 (오프라인)...
echo       Installing Python packages (offline)...
echo.

REM 가상 환경 활성화
call venv\Scripts\activate.bat

REM pip 업그레이드 (오프라인)
python -m pip install --no-index --find-links=deployment\packages\python-wheels pip setuptools wheel --break-system-packages

REM 백엔드 의존성 설치 (오프라인)
pip install --no-index --find-links=deployment\packages\python-wheels -r backend\requirements.txt --break-system-packages

if %errorLevel% neq 0 (
    echo [ERROR] Python 패키지 설치 실패
    pause
    exit /b 1
)

echo [OK] Python 패키지 설치 완료
echo.

echo [4/8] 프론트엔드 패키지 설치 중 (오프라인)...
echo       Installing frontend packages (offline)...
echo.

cd frontend

REM npm 오프라인 설치
npm install --offline --no-audit --cache ..\deployment\packages\node-modules-cache

if %errorLevel% neq 0 (
    echo [ERROR] 프론트엔드 패키지 설치 실패
    pause
    exit /b 1
)

echo [OK] 프론트엔드 패키지 설치 완료
echo.

echo [5/8] 프론트엔드 빌드 중...
echo       Building frontend...
echo.

npm run build

if %errorLevel% neq 0 (
    echo [ERROR] 프론트엔드 빌드 실패
    pause
    exit /b 1
)

cd ..

echo [OK] 프론트엔드 빌드 완료
echo.

echo [6/8] 데이터베이스 초기화 중...
echo       Initializing database...
echo.

REM 데이터 디렉토리 생성
if not exist "data" mkdir data

REM SQLite 데이터베이스 초기화 (Alembic 마이그레이션)
cd backend
python -m alembic upgrade head

if %errorLevel% neq 0 (
    echo [WARNING] 데이터베이스 초기화 경고 (무시 가능)
)

cd ..

echo [OK] 데이터베이스 초기화 완료
echo.

echo [7/8] 설정 파일 생성 중...
echo       Creating configuration files...
echo.

REM .env 파일 생성
if not exist "backend\.env" (
    echo DATABASE_URL=sqlite:///./data/project_manager.db > backend\.env
    echo HOST=0.0.0.0 >> backend\.env
    echo PORT=8000 >> backend\.env
    echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000 >> backend\.env
)

echo [OK] 설정 파일 생성 완료
echo.

echo [8/8] 바로가기 생성 중...
echo       Creating shortcuts...
echo.

REM 실행 스크립트를 바탕화면에 복사
set "DESKTOP=%USERPROFILE%\Desktop"
copy /Y deployment\windows\start.bat "%DESKTOP%\프로젝트관리시스템_시작.bat"

echo [OK] 바로가기 생성 완료
echo.

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              설치가 완료되었습니다!                        ║
echo ║              Installation Complete!                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 시스템 시작 방법:
echo   1. 바탕화면의 "프로젝트관리시스템_시작.bat" 실행
echo   2. 또는 deployment\windows\start.bat 실행
echo.
echo 접속 주소:
echo   http://localhost:5173
echo.
echo 시스템 중지:
echo   명령 프롬프트 창에서 Ctrl+C 입력
echo.
pause
