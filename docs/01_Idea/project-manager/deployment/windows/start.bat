@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

REM ============================================================
REM   프로젝트 관리 시스템 시작 스크립트
REM   Project Manager Start Script (Windows)
REM ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║         프로젝트 관리 시스템 시작 중...                   ║
echo ║         Starting Project Management System...             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 설치 디렉토리로 이동
set "INSTALL_DIR=%~dp0..\.."
cd /d "%INSTALL_DIR%"

REM 가상 환경 확인
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] 가상 환경을 찾을 수 없습니다.
    echo [ERROR] Virtual environment not found.
    echo.
    echo install.bat를 먼저 실행해주세요.
    echo Please run install.bat first.
    echo.
    pause
    exit /b 1
)

echo [1/3] 가상 환경 활성화 중...
echo       Activating virtual environment...
call venv\Scripts\activate.bat

echo [OK] 가상 환경 활성화 완료
echo.

echo [2/3] 백엔드 서버 시작 중...
echo       Starting backend server...
echo.

REM 백엔드 서버를 백그라운드에서 실행
start "Project Manager Backend" /MIN cmd /c "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

REM 서버 시작 대기
timeout /t 5 /nobreak > nul

echo [OK] 백엔드 서버 시작 완료 (포트 8000)
echo.

echo [3/3] 프론트엔드 서버 시작 중...
echo       Starting frontend server...
echo.

REM 프론트엔드 개발 서버 실행 (또는 빌드된 정적 파일 서빙)
cd frontend

REM 옵션 1: 개발 서버 (npm run dev)
REM start "Project Manager Frontend" cmd /c "npm run dev"

REM 옵션 2: 프로덕션 빌드 서빙 (추천)
start "Project Manager Frontend" cmd /c "npx serve -s dist -l 5173"

timeout /t 3 /nobreak > nul

cd ..

echo [OK] 프론트엔드 서버 시작 완료 (포트 5173)
echo.

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║       시스템이 성공적으로 시작되었습니다!                  ║
echo ║       System started successfully!                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │  접속 정보 / Access Information                            │
echo ├────────────────────────────────────────────────────────────┤
echo │                                                            │
echo │  웹 인터페이스 / Web Interface:                            │
echo │    http://localhost:5173                                   │
echo │                                                            │
echo │  API 서버 / API Server:                                    │
echo │    http://localhost:8000                                   │
echo │                                                            │
echo │  API 문서 / API Documentation:                             │
echo │    http://localhost:8000/docs                              │
echo │                                                            │
echo └────────────────────────────────────────────────────────────┘
echo.
echo 브라우저가 자동으로 열리지 않으면 위 주소를 직접 입력하세요.
echo If browser doesn't open automatically, enter the address above.
echo.
echo 시스템 중지 방법:
echo   이 창을 닫거나 Ctrl+C를 누르세요
echo To stop the system:
echo   Close this window or press Ctrl+C
echo.

REM 브라우저 자동 실행
timeout /t 2 /nobreak > nul
start http://localhost:5173

echo.
pause
