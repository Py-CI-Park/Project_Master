@echo off
REM 프로젝트 관리 시스템 - Windows 설치 스크립트
REM 폐쇄망 환경에서 Python 패키지 및 프론트엔드 빌드 파일을 설치합니다.

echo ================================================================
echo 프로젝트 관리 시스템 - Windows 설치
echo ================================================================
echo.

REM 현재 스크립트의 디렉토리를 저장
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..\..\
set DEPLOYMENT_DIR=%SCRIPT_DIR%..\

echo [1/5] Python 설치 확인...
python --version >nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python 3.10 이상을 설치한 후 다시 실행해주세요.
    pause
    exit /b 1
)
echo [완료] Python 설치 확인 완료
echo.

echo [2/5] 백엔드 디렉토리로 이동...
cd /d "%PROJECT_ROOT%backend"
if errorlevel 1 (
    echo [오류] 백엔드 디렉토리를 찾을 수 없습니다.
    pause
    exit /b 1
)
echo [완료] 디렉토리 이동 완료
echo.

echo [3/5] Python 가상 환경 생성...
if exist venv (
    echo [정보] 기존 가상 환경이 있습니다. 삭제하고 다시 생성하시겠습니까? (Y/N^)
    set /p RECREATE=
    if /i "%RECREATE%"=="Y" (
        echo [정보] 기존 가상 환경 삭제 중...
        rmdir /s /q venv
    ) else (
        echo [정보] 기존 가상 환경을 유지합니다.
        goto skip_venv_create
    )
)
python -m venv venv
if errorlevel 1 (
    echo [오류] 가상 환경 생성에 실패했습니다.
    pause
    exit /b 1
)
echo [완료] 가상 환경 생성 완료
:skip_venv_create
echo.

echo [4/5] 의존성 패키지 설치 (폐쇄망 모드^)...
call venv\Scripts\activate.bat
pip install --no-index --find-links="%DEPLOYMENT_DIR%packages\python-wheels" -r requirements.txt
if errorlevel 1 (
    echo [오류] 패키지 설치에 실패했습니다.
    echo 패키지 파일이 deployment/packages/python-wheels 디렉토리에 있는지 확인해주세요.
    pause
    exit /b 1
)
echo [완료] 의존성 패키지 설치 완료
echo.

echo [5/5] 데이터베이스 초기화...
python "%DEPLOYMENT_DIR%database\init_db.py"
if errorlevel 1 (
    echo [경고] 데이터베이스 초기화에 실패했습니다.
    echo 나중에 수동으로 초기화할 수 있습니다:
    echo    python deployment\database\init_db.py
) else (
    echo [완료] 데이터베이스 초기화 완료
)
echo.

echo ================================================================
echo 설치 완료!
echo ================================================================
echo.
echo 다음 명령으로 서버를 실행할 수 있습니다:
echo    deployment\windows\start.bat
echo.
pause
