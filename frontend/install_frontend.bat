@echo off
chcp 65001 > nul
echo ========================================
echo  폐쇄망 프로젝트 관리 시스템 v2.0.0
echo  Frontend 설치 스크립트
echo ========================================
echo.

:: 현재 디렉토리가 frontend인지 확인
if not exist "package.json" (
    echo [오류] frontend 폴더에서 실행해주세요.
    echo 현재 위치: %CD%
    pause
    exit /b 1
)

:: Node.js 설치 확인
echo [1/3] Node.js 설치 확인 중...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo Node.js 18 이상을 설치해주세요: https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo ✓ Node.js 설치 확인 완료
echo.

:: npm 설치 확인
echo [2/3] npm 설치 확인 중...
npm --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] npm이 설치되어 있지 않습니다.
    pause
    exit /b 1
)

npm --version
echo ✓ npm 설치 확인 완료
echo.

:: 기존 node_modules 삭제 (선택)
if exist "node_modules" (
    echo 기존 node_modules 폴더 발견
    choice /C YN /M "삭제하고 새로 설치하시겠습니까"
    if errorlevel 2 goto skip_delete
    if errorlevel 1 (
        echo 삭제 중...
        rmdir /s /q node_modules
        if exist "package-lock.json" del /f /q package-lock.json
        echo ✓ 삭제 완료
    )
)
:skip_delete
echo.

:: npm 패키지 설치
echo [3/3] npm 패키지 설치 중...
echo 이 작업은 몇 분이 소요될 수 있습니다...
echo.

npm install
if %errorLevel% neq 0 (
    echo.
    echo [오류] 패키지 설치 실패
    echo.
    echo 문제 해결 방법:
    echo   1. 인터넷 연결 확인
    echo   2. npm cache clean --force 실행
    echo   3. node_modules 폴더 삭제 후 재실행
    echo   4. Node.js 재설치
    pause
    exit /b 1
)

echo.
echo ✓ npm 패키지 설치 완료
echo.

:: 설치 확인
echo ========================================
echo 설치된 주요 패키지 확인:
echo ========================================
call npm list --depth=0 | findstr /i "react vite typescript"
echo.

echo ========================================
echo  Frontend 설치가 완료되었습니다!
echo ========================================
echo.
echo 다음 단계:
echo   1. run_frontend.bat 실행하여 개발 서버 시작
echo   2. 브라우저에서 http://localhost:3000 접속
echo.
echo 또는 수동 실행:
echo   npm run dev
echo.
echo 프로덕션 빌드:
echo   npm run build
echo.
pause
