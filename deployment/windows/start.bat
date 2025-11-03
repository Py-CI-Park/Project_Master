@echo off
REM 프로젝트 관리 시스템 - Windows 실행 스크립트
REM 백엔드 API 서버와 프론트엔드 서버를 동시에 실행합니다.

echo ================================================================
echo 프로젝트 관리 시스템 - 서버 실행
echo ================================================================
echo.

REM 현재 스크립트의 디렉토리를 저장
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..\..\
set BACKEND_DIR=%PROJECT_ROOT%backend
set FRONTEND_BUILD_DIR=%PROJECT_ROOT%deployment\frontend-build

echo [정보] 백엔드 디렉토리: %BACKEND_DIR%
echo [정보] 프론트엔드 빌드 디렉토리: %FRONTEND_BUILD_DIR%
echo.

REM 백엔드 가상 환경 확인
if not exist "%BACKEND_DIR%\venv" (
    echo [오류] 백엔드 가상 환경이 없습니다.
    echo 먼저 설치 스크립트를 실행해주세요: deployment\windows\install.bat
    pause
    exit /b 1
)

echo [1/2] 백엔드 API 서버 시작 중...
cd /d "%BACKEND_DIR%"
start "Backend API Server" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo [완료] 백엔드 API 서버가 http://localhost:8000 에서 실행 중입니다.
echo.

REM Python http.server 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo 프론트엔드 서버를 시작할 수 없습니다.
    pause
    exit /b 1
)

echo [2/2] 프론트엔드 서버 시작 중...
cd /d "%FRONTEND_BUILD_DIR%"
start "Frontend Server" cmd /k "python -m http.server 5173"
echo [완료] 프론트엔드 서버가 http://localhost:5173 에서 실행 중입니다.
echo.

echo ================================================================
echo 서버 실행 완료!
echo ================================================================
echo.
echo 백엔드 API: http://localhost:8000
echo 프론트엔드: http://localhost:5173
echo API 문서: http://localhost:8000/docs
echo.
echo 서버를 중지하려면 각 명령 프롬프트 창을 닫으세요.
echo.
pause
