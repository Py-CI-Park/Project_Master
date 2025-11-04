# 첫 번째 개발 단계 시작 가이드

> **프로젝트**: 폐쇄망 프로젝트 관리 시스템
> **현재 단계**: Phase 0 - 개발 환경 구축 및 기본 구조
> **예상 소요 시간**: 1주
> **작성일**: 2025-10-30

---

## 📋 목차

1. [시작하기 전에](#1-시작하기-전에)
2. [Phase 0 개요](#2-phase-0-개요)
3. [단계별 실행 가이드](#3-단계별-실행-가이드)
4. [검증 및 확인](#4-검증-및-확인)
5. [다음 단계](#5-다음-단계)
6. [문제 해결](#6-문제-해결)

---

## 1. 시작하기 전에

### 1.1 필수 확인 사항

개발을 시작하기 전에 다음 사항들을 확인하세요:

#### ✅ 문서 읽기
- [ ] [README.md](README.md) 프로젝트 소개 읽기
- [ ] [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) 전체 개발 계획 이해
- [ ] [개발 규칙](README.md#-개발-규칙) 숙지

#### ✅ 시스템 요구사항 확인
- [ ] **Python 3.11+** 설치 확인
  ```bash
  python --version
  # Python 3.11.0 이상 출력되어야 함
  ```
- [ ] **Node.js 18+** 설치 확인
  ```bash
  node --version
  # v18.0.0 이상 출력되어야 함
  npm --version
  ```
- [ ] **Git** 설치 확인
  ```bash
  git --version
  ```
- [ ] 디스크 여유 공간 **최소 2GB** 확인
- [ ] 관리자 권한 (일부 설치 작업에 필요)

#### ✅ 개발 도구 준비 (권장)
- **코드 에디터**: VS Code, PyCharm, WebStorm 등
- **터미널**: Windows Terminal, iTerm2, 또는 기본 터미널
- **브라우저**: Chrome, Edge, Firefox (개발자 도구 포함)

### 1.2 이 단계에서 달성할 목표

Phase 0를 완료하면 다음이 가능해집니다:

- ✅ 백엔드 개발 서버 실행 (`http://localhost:8000`)
- ✅ 프론트엔드 개발 서버 실행 (`http://localhost:5173`)
- ✅ API 문서 접속 (`http://localhost:8000/docs`)
- ✅ Git으로 버전 관리
- ✅ 코드 품질 도구 자동 실행

---

## 2. Phase 0 개요

### 2.1 Phase 0란?

Phase 0는 **개발 환경 구축 및 기본 구조 생성** 단계입니다. 실제 기능 개발에 앞서 프로젝트의 기반을 탄탄하게 만드는 중요한 단계입니다.

### 2.2 작업 항목

DEVELOPMENT_PLAN.md의 Phase 0에서 정의한 6개 작업 항목:

- **0.1** Git 저장소 초기화 및 `.gitignore` 설정
- **0.2** 백엔드 Python 가상환경 설정
- **0.3** 프론트엔드 프로젝트 초기화
- **0.4** 프로젝트 디렉토리 구조 생성
- **0.5** 코드 품질 도구 설정
- **0.6** Docker 개발 환경 설정 (선택)

### 2.3 완료 기준

다음 조건을 모두 만족하면 Phase 0 완료입니다:

- ✅ 백엔드 서버 실행 가능 (`uvicorn app.main:app --reload`)
- ✅ 프론트엔드 개발 서버 실행 가능 (`npm run dev`)
- ✅ Git 커밋 및 브랜치 전략 수립 완료

---

## 3. 단계별 실행 가이드

### 📍 Step 0.1: Git 저장소 초기화

#### 현재 상태 확인

현재 이미 Git 저장소가 초기화되어 있고, `feature/initial_dev` 브랜치에서 작업 중입니다.

```bash
# 현재 브랜치 확인
git branch
# * feature/initial_dev

# Git 상태 확인
git status
```

#### .gitignore 설정

프로젝트 루트에 `.gitignore` 파일을 생성하여 불필요한 파일이 커밋되지 않도록 합니다.

```bash
# .gitignore 파일 생성 (루트 디렉토리에서)
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.pytest_cache/
.coverage
htmlcov/
*.log

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnp/
.pnp.js
coverage/
.next/
out/
build/
dist/
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Database
*.db
*.sqlite
*.sqlite3
data/

# Logs
logs/
*.log

# Environment
.env
.env.local

# Deployment
deployment/packages/python-wheels/*.whl
deployment/packages/node-modules-cache/

# OS
Thumbs.db
.DS_Store
EOF
```

#### 커밋

```bash
git add .gitignore
git commit -m "[Phase 0] 0.1 Git 저장소 초기화 및 .gitignore 설정 완료"
```

---

### 📍 Step 0.2: 백엔드 Python 가상환경 설정

#### backend 디렉토리 생성 및 이동

```bash
mkdir -p backend
cd backend
```

#### Python 가상환경 생성

```bash
# Windows
python -m venv venv

# Linux/Mac
python3 -m venv venv
```

#### 가상환경 활성화

```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

가상환경이 활성화되면 터미널 프롬프트 앞에 `(venv)`가 표시됩니다.

#### requirements.txt 작성

`backend/requirements.txt` 파일을 생성합니다:

```txt
# FastAPI and Server
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.25
alembic==1.13.1

# Data Validation
pydantic==2.5.3
pydantic-settings==2.1.0

# Utilities
python-dateutil==2.8.2
```

#### requirements-dev.txt 작성

개발용 의존성을 `backend/requirements-dev.txt` 파일로 작성합니다:

```txt
# Testing
pytest==7.4.4
pytest-cov==4.1.0
pytest-asyncio==0.23.3
httpx==0.26.0

# Code Quality
black==24.1.1
isort==5.13.2
mypy==1.8.0
flake8==7.0.0

# Development
ipython==8.20.0
```

#### 의존성 설치

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

#### 커밋

```bash
cd ..  # 루트로 이동
git add backend/requirements.txt backend/requirements-dev.txt
git commit -m "[Phase 0] 0.2 백엔드 Python 가상환경 설정 완료

- Python 가상환경 생성
- requirements.txt 및 requirements-dev.txt 작성
- 의존성 설치 완료"
```

---

### 📍 Step 0.3: 프론트엔드 프로젝트 초기화

#### frontend 디렉토리에서 Vite + React + TypeScript 프로젝트 생성

```bash
# 루트 디렉토리에서
npm create vite@latest frontend -- --template react-ts
```

#### 프론트엔드 디렉토리로 이동 및 의존성 설치

```bash
cd frontend
npm install
```

#### 주요 라이브러리 추가 설치

```bash
# UI 라이브러리
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# 라우팅
npm install react-router-dom

# API 클라이언트
npm install axios

# 간트 차트
npm install frappe-gantt

# 캘린더
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# 의존성 그래프
npm install reactflow

# 차트
npm install recharts

# 날짜 처리
npm install date-fns

# 상태 관리 (선택 - 나중에 추가 가능)
# npm install zustand
```

#### 개발 의존성 설치

```bash
npm install --save-dev @types/node
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

#### package.json 스크립트 확인

`frontend/package.json` 파일에서 다음 스크립트가 있는지 확인:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 커밋

```bash
cd ..  # 루트로 이동
git add frontend/
git commit -m "[Phase 0] 0.3 프론트엔드 프로젝트 초기화 완료

- Vite + React + TypeScript 프로젝트 생성
- Material-UI, React Router, Axios 설치
- Frappe Gantt, FullCalendar, React-Flow, Recharts 설치
- 개발 의존성 설치 완료"
```

---

### 📍 Step 0.4: 프로젝트 디렉토리 구조 생성

#### 백엔드 디렉토리 구조 생성

```bash
mkdir -p backend/app/models
mkdir -p backend/app/schemas
mkdir -p backend/app/api
mkdir -p backend/app/services
mkdir -p backend/app/utils
mkdir -p backend/tests
mkdir -p backend/alembic/versions

# __init__.py 파일 생성 (Python 패키지로 인식)
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/api/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
touch backend/tests/__init__.py
```

#### 백엔드 기본 파일 생성

**backend/app/main.py** (FastAPI 진입점):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="폐쇄망 프로젝트 관리 시스템 API",
    description="100% 오프라인 동작하는 프로젝트/일정 관리 시스템 백엔드 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 프론트엔드 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "폐쇄망 프로젝트 관리 시스템 API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**backend/app/config.py** (환경 설정):

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "폐쇄망 프로젝트 관리 시스템"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./data/project_manager.db"

    class Config:
        env_file = ".env"

settings = Settings()
```

**backend/app/database.py** (데이터베이스 연결):

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite 전용
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 의존성 주입용 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 프론트엔드 디렉토리 구조 생성

```bash
mkdir -p frontend/src/components/Layout
mkdir -p frontend/src/components/Project
mkdir -p frontend/src/components/Task
mkdir -p frontend/src/components/Enabler
mkdir -p frontend/src/components/Gantt
mkdir -p frontend/src/components/Calendar
mkdir -p frontend/src/components/Dependency
mkdir -p frontend/src/components/Reports
mkdir -p frontend/src/components/Common

mkdir -p frontend/src/services
mkdir -p frontend/src/hooks
mkdir -p frontend/src/contexts
mkdir -p frontend/src/types
mkdir -p frontend/src/utils
mkdir -p frontend/src/styles
```

#### deployment, docs 디렉토리 생성

```bash
mkdir -p deployment/windows
mkdir -p deployment/linux
mkdir -p deployment/packages/python-wheels
mkdir -p deployment/packages/node-modules-cache
mkdir -p deployment/database

mkdir -p data
mkdir -p logs
```

#### 커밋

```bash
git add .
git commit -m "[Phase 0] 0.4 프로젝트 디렉토리 구조 생성 완료

- 백엔드 디렉토리 구조 및 기본 파일 생성 (main.py, config.py, database.py)
- 프론트엔드 컴포넌트 디렉토리 구조 생성
- deployment, data, logs 디렉토리 생성"
```

---

### 📍 Step 0.5: 코드 품질 도구 설정

#### 백엔드 코드 품질 도구 설정

**backend/pyproject.toml** (Black, isort 설정):

```toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'

[tool.isort]
profile = "black"
line_length = 100
multi_line_output = 3

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
```

**backend/.flake8**:

```ini
[flake8]
max-line-length = 100
exclude = .git,__pycache__,venv,build,dist
ignore = E203, W503
```

#### 프론트엔드 코드 품질 도구 설정

**frontend/.eslintrc.cjs**:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
```

**frontend/.prettierrc**:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

**frontend/tsconfig.json** (타입 체크 강화):

기존 파일에 다음 설정 추가:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 커밋

```bash
git add .
git commit -m "[Phase 0] 0.5 코드 품질 도구 설정 완료

- 백엔드: Black, isort, mypy, flake8 설정
- 프론트엔드: ESLint, Prettier, TypeScript strict 모드 설정"
```

---

### 📍 Step 0.6: Docker 개발 환경 설정 (선택)

이 단계는 선택사항입니다. Docker를 사용하지 않아도 개발 가능합니다.

Docker를 사용하려면 다음 파일들을 생성하세요:

**docker-compose.yml** (루트):

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite:///./data/project_manager.db
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host
```

**backend/Dockerfile**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]
```

**frontend/Dockerfile**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
```

#### 커밋 (Docker 사용 시)

```bash
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile
git commit -m "[Phase 0] 0.6 Docker 개발 환경 설정 완료 (선택)

- docker-compose.yml 작성
- backend/frontend Dockerfile 작성"
```

---

## 4. 검증 및 확인

### 4.1 백엔드 서버 실행 테스트

```bash
cd backend

# 가상환경 활성화 (이미 활성화되어 있지 않다면)
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# 서버 실행
uvicorn app.main:app --reload
```

브라우저에서 다음 URL 접속:
- http://localhost:8000 → `{"message": "폐쇄망 프로젝트 관리 시스템 API", ...}` 응답 확인
- http://localhost:8000/docs → Swagger UI 확인
- http://localhost:8000/health → `{"status": "healthy"}` 응답 확인

### 4.2 프론트엔드 서버 실행 테스트

새 터미널 창을 열고:

```bash
cd frontend

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속 → Vite + React 기본 화면 확인

### 4.3 코드 품질 도구 테스트

#### 백엔드

```bash
cd backend

# Black 포맷팅
black app/

# isort 정렬
isort app/

# flake8 검사
flake8 app/

# mypy 타입 체크 (현재는 에러 발생 가능, 추후 수정)
mypy app/
```

#### 프론트엔드

```bash
cd frontend

# ESLint 검사
npm run lint

# Prettier 포맷팅
npx prettier --write src/

# TypeScript 타입 체크
npx tsc --noEmit
```

### 4.4 Git 상태 확인

```bash
# 모든 변경사항이 커밋되었는지 확인
git status

# 커밋 이력 확인
git log --oneline

# 브랜치 확인
git branch
```

---

## 5. 다음 단계

### Phase 0 완료 체크리스트

모든 항목을 확인했다면 Phase 0를 완료한 것입니다! 🎉

- [ ] Git 저장소 초기화 및 .gitignore 설정
- [ ] 백엔드 Python 가상환경 설정 및 의존성 설치
- [ ] 프론트엔드 프로젝트 초기화 및 라이브러리 설치
- [ ] 프로젝트 디렉토리 구조 생성
- [ ] 코드 품질 도구 설정
- [ ] 백엔드 서버 실행 확인 (http://localhost:8000)
- [ ] 프론트엔드 서버 실행 확인 (http://localhost:5173)
- [ ] 모든 변경사항 Git 커밋

### Phase 1으로 이동

Phase 0를 완료했다면 이제 **Phase 1: 백엔드 핵심 기능** 개발을 시작할 수 있습니다.

다음 단계:

1. [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)에서 **Phase 1** 섹션 읽기
2. Phase 1 작업 항목 이해
3. Phase 1 첫 번째 작업 **1.1 데이터베이스 설계 및 모델 구현** 시작

**Phase 1 첫 작업 미리보기**:
- SQLAlchemy 모델 정의 (projects, tasks, enablers, dependencies 등)
- Alembic 마이그레이션 설정
- 데이터베이스 초기화 스크립트 작성

---

## 6. 문제 해결

### 6.1 Python 버전 문제

**증상**: `python --version`이 3.11 미만

**해결**:
1. Python 3.11 이상 다운로드: https://www.python.org/downloads/
2. 설치 후 터미널 재시작
3. `python --version` 또는 `python3 --version`으로 확인

### 6.2 Node.js 버전 문제

**증상**: `node --version`이 18 미만

**해결**:
1. Node.js 18 이상 다운로드: https://nodejs.org/
2. 설치 후 터미널 재시작
3. `node --version`으로 확인

### 6.3 가상환경 활성화 오류 (Windows)

**증상**: `venv\Scripts\activate` 실행 시 권한 오류

**해결**:
```powershell
# PowerShell에서 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 6.4 포트 충돌

**증상**: `Address already in use` 오류

**해결**:

#### Windows:
```bash
# 포트 8000 사용 프로세스 찾기
netstat -ano | findstr :8000

# 프로세스 ID로 종료
taskkill /PID <PID> /F
```

#### Linux/Mac:
```bash
# 포트 8000 사용 프로세스 찾기
lsof -ti:8000

# 프로세스 종료
kill -9 $(lsof -ti:8000)
```

또는 다른 포트 사용:
```bash
# 백엔드: 다른 포트로 실행
uvicorn app.main:app --reload --port 8001

# 프론트엔드: 다른 포트로 실행
npm run dev -- --port 5174
```

### 6.5 npm 의존성 설치 오류

**증상**: `npm install` 실행 시 오류

**해결**:
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 6.6 Git 커밋 오류

**증상**: Git 사용자 정보 미설정

**해결**:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📚 추가 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Material-UI 문서](https://mui.com/)
- [SQLAlchemy 문서](https://docs.sqlalchemy.org/)

---

## 🎉 축하합니다!

Phase 0를 완료하셨습니다! 이제 실제 기능 개발을 시작할 준비가 되었습니다.

**다음 단계**: [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) → **Phase 1: 백엔드 핵심 기능**

**질문이나 문제가 있다면**:
- [GitHub Issues](../../issues) 에 문의
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)의 위험 관리 섹션 참고

---

**Happy Coding! 🚀**
