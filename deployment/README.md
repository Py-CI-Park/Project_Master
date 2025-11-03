# 프로젝트 관리 시스템 - 폐쇄망 배포 가이드

이 디렉토리에는 폐쇄망 환경에서 프로젝트 관리 시스템을 설치하고 실행하기 위한 모든 파일과 스크립트가 포함되어 있습니다.

## 디렉토리 구조

```
deployment/
├── packages/
│   └── python-wheels/       # Python 패키지 wheel 파일들 (28개)
├── frontend-build/           # React 프론트엔드 빌드 파일
├── database/
│   ├── init_db.py           # 데이터베이스 초기화 스크립트
│   └── README.md            # 데이터베이스 초기화 안내
├── windows/
│   ├── install.bat          # Windows 설치 스크립트
│   └── start.bat            # Windows 서버 실행 스크립트
├── linux/
│   ├── install.sh           # Linux 설치 스크립트
│   ├── start.sh             # Linux 서버 실행 스크립트
│   └── stop.sh              # Linux 서버 종료 스크립트
└── README.md                # 이 파일
```

## 사전 요구사항

### 공통
- Python 3.10 이상

### Windows
- Windows 10 이상
- PowerShell 또는 명령 프롬프트

### Linux
- Ubuntu 20.04 이상 또는 동등한 배포판
- Bash 셸

## 설치 방법

### Windows

1. 프로젝트 디렉토리로 이동:
   ```cmd
   cd C:\Programming\Project_Master
   ```

2. 설치 스크립트 실행:
   ```cmd
   deployment\windows\install.bat
   ```

3. 설치 과정:
   - Python 버전 확인
   - 가상 환경 생성
   - 의존성 패키지 설치 (폐쇄망 모드)
   - 데이터베이스 초기화

### Linux

1. 프로젝트 디렉토리로 이동:
   ```bash
   cd /path/to/Project_Master
   ```

2. 설치 스크립트 실행:
   ```bash
   ./deployment/linux/install.sh
   ```

3. 설치 과정:
   - Python 버전 확인
   - 가상 환경 생성
   - 의존성 패키지 설치 (폐쇄망 모드)
   - 데이터베이스 초기화

## 서버 실행

### Windows

```cmd
deployment\windows\start.bat
```

별도의 명령 프롬프트 창에서 백엔드와 프론트엔드 서버가 실행됩니다.

**서버 종료**: 각 명령 프롬프트 창을 닫으세요.

### Linux

```bash
./deployment/linux/start.sh
```

백그라운드에서 백엔드와 프론트엔드 서버가 실행됩니다.

**서버 종료**:
```bash
./deployment/linux/stop.sh
```

## 접속 주소

설치 및 실행 후 다음 주소로 접속할 수 있습니다:

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 로그 파일 (Linux)

Linux 환경에서는 로그 파일이 다음 위치에 저장됩니다:

- 백엔드: `logs/backend.log`
- 프론트엔드: `logs/frontend.log`

로그 확인:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

## 구성 요소

### 백엔드
- **프레임워크**: FastAPI
- **데이터베이스**: SQLite
- **ORM**: SQLAlchemy
- **마이그레이션**: Alembic
- **서버**: Uvicorn

### 프론트엔드
- **프레임워크**: React + Vite
- **UI 라이브러리**: Material-UI
- **라우팅**: React Router
- **상태 관리**: Zustand
- **HTTP 클라이언트**: Axios

## 문제 해결

### Python이 설치되어 있지 않음
- Python 3.10 이상을 설치해주세요.
- 설치 후 `python --version` (Windows) 또는 `python3 --version` (Linux) 명령으로 확인

### 패키지 설치 실패
- `deployment/packages/python-wheels` 디렉토리에 모든 wheel 파일이 있는지 확인
- 28개의 패키지 파일이 있어야 합니다.

### 데이터베이스 초기화 실패
- 수동으로 초기화:
  ```bash
  cd backend
  source venv/bin/activate  # Windows: venv\Scripts\activate.bat
  python ../deployment/database/init_db.py
  ```

### 포트가 이미 사용 중
- 백엔드(8000) 또는 프론트엔드(5173) 포트를 사용하는 다른 프로세스를 종료
- Linux에서 포트 사용 확인:
  ```bash
  sudo lsof -i :8000
  sudo lsof -i :5173
  ```

## 배포 패키지 준비 (개발자용)

폐쇄망 배포 패키지를 새로 준비하려면:

1. **Python 패키지 수집**:
   ```bash
   cd backend
   pip download -r requirements.txt -d ../deployment/packages/python-wheels
   ```

2. **프론트엔드 빌드**:
   ```bash
   cd frontend
   npm run build
   cp -r dist/* ../deployment/frontend-build/
   ```

3. **전체 프로젝트 압축**:
   ```bash
   cd ..
   tar -czf project_master_deploy.tar.gz Project_Master/
   ```

## 보안 고려사항

- 폐쇄망 환경을 위해 설계됨
- 외부 네트워크 접속 불필요
- SQLite 파일 기반 데이터베이스 (물리적 보안 필요)
- 자세한 보안 정보: `backend/SECURITY.md` 참조

## 지원

문제가 발생하면 다음을 확인하세요:
1. 이 README 파일의 문제 해결 섹션
2. `backend/SECURITY.md` - 보안 관련 정보
3. `deployment/database/README.md` - 데이터베이스 초기화 상세 안내
