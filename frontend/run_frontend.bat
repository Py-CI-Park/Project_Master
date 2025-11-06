@echo off
chcp 65001 > nul
title 폐쇄망 프로젝트 관리 시스템 - Frontend Server
echo ========================================
echo  폐쇄망 프로젝트 관리 시스템 v2.0.0
echo  Frontend 개발 서버 실행
echo ========================================
echo.

:: 현재 디렉토리가 frontend인지 확인
if not exist "package.json" (
    echo [오류] frontend 폴더에서 실행해주세요.
    echo 현재 위치: %CD%
    pause
    exit /b 1
)

:: node_modules 확인
if not exist "node_modules" (
    echo [오류] node_modules가 설치되어 있지 않습니다.
    echo.
    echo install_frontend.bat를 먼저 실행하세요.
    pause
    exit /b 1
)

:: Node.js 확인
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    pause
    exit /b 1
)

:: 포트 3000 사용 중 확인
echo 포트 3000 확인 중...
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo.
    echo [경고] 포트 3000이 이미 사용 중입니다.
    echo.
    netstat -ano | findstr ":3000"
    echo.
    choice /C YN /M "기존 프로세스를 종료하고 계속하시겠습니까"
    if errorlevel 2 exit /b 1
    if errorlevel 1 (
        echo 프로세스 종료 중...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
    )
)
echo.

:: 포트 5173 사용 중 확인 (Vite 기본 포트)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo 포트 5173도 사용 중입니다. 종료 중...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
)

:: Backend 서버 확인
echo Backend 서버 연결 확인 중...
curl -s http://localhost:8000/health >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo [경고] Backend 서버가 실행 중이지 않습니다.
    echo.
    echo Backend 서버를 먼저 실행하세요:
    echo   cd ..\backend
    echo   run_backend.bat
    echo.
    choice /C YN /M "계속 진행하시겠습니까"
    if errorlevel 2 exit /b 1
) else (
    echo ✓ Backend 서버 연결 확인
)
echo.

:: 개발 서버 시작
echo ========================================
echo  Frontend 개발 서버를 시작합니다
echo ========================================
echo.
echo 접속 정보:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8000
echo   - Swagger UI: http://localhost:8000/docs
echo.
echo 브라우저가 자동으로 열립니다...
echo 서버를 종료하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

:: npm 개발 서버 실행
call npm run dev

:: 서버 종료 시
echo.
echo ========================================
echo  Frontend 서버가 종료되었습니다.
echo ========================================
pause
