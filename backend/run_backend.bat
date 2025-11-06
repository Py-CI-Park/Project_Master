@echo off
chcp 65001 > nul
title 폐쇄망 프로젝트 관리 시스템 - Backend Server
echo ========================================
echo  폐쇄망 프로젝트 관리 시스템 v2.0.0
echo  Backend 서버 실행
echo ========================================
echo.

:: 현재 디렉토리가 backend인지 확인
if not exist "app\main.py" (
    echo [오류] backend 폴더에서 실행해주세요.
    echo 현재 위치: %CD%
    pause
    exit /b 1
)

:: 가상환경 확인
if not exist "venv\Scripts\activate.bat" (
    echo [오류] 가상환경이 설치되어 있지 않습니다.
    echo.
    echo install_backend.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

:: 가상환경 활성화
echo 가상환경 활성화 중...
call venv\Scripts\activate.bat
if %errorLevel% neq 0 (
    echo [오류] 가상환경 활성화 실패
    pause
    exit /b 1
)
echo ✓ 가상환경 활성화 완료
echo.

:: uvicorn 설치 확인
python -c "import uvicorn" 2>nul
if %errorLevel% neq 0 (
    echo [오류] uvicorn이 설치되어 있지 않습니다.
    echo.
    echo install_backend.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

:: 포트 8099 사용 중 확인
echo 포트 8099 확인 중...
netstat -ano | findstr ":8099" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo.
    echo [경고] 포트 8099이 이미 사용 중입니다.
    echo.
    netstat -ano | findstr ":8099"
    echo.
    choice /C YN /M "기존 프로세스를 종료하고 계속하시겠습니까"
    if errorlevel 2 exit /b 1
    if errorlevel 1 (
        echo 프로세스 종료 중...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8099" ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
    )
)
echo.

:: 데이터베이스 폴더 확인
if not exist "data" (
    echo data 폴더가 없습니다. 생성 중...
    mkdir data
    echo ✓ data 폴더 생성 완료
    echo.
)

:: 서버 시작
echo ========================================
echo  Backend 서버를 시작합니다
echo ========================================
echo.
echo 접속 정보:
echo   - API 서버: http://localhost:8099
echo   - Swagger UI: http://localhost:8099/docs
echo   - Health Check: http://localhost:8099/health
echo.
echo 서버를 종료하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

:: uvicorn 서버 실행
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8099

:: 서버 종료 시
echo.
echo ========================================
echo  Backend 서버가 종료되었습니다.
echo ========================================
pause
