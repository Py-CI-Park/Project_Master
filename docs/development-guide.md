# 프로젝트 관리 시스템 - 개발 가이드

이 문서는 프로젝트 관리 시스템 개발에 참여하는 개발자를 위한 가이드입니다.

## 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조](#프로젝트-구조)
3. [개발 워크플로우](#개발-워크플로우)
4. [빌드 및 테스트](#빌드-및-테스트)
5. [코딩 규칙](#코딩-규칙)
6. [Git 워크플로우](#git-워크플로우)
7. [디버깅 가이드](#디버깅-가이드)
8. [배포 프로세스](#배포-프로세스)
9. [문제 해결](#문제-해결)
10. [기여 가이드](#기여-가이드)

---

## 개발 환경 설정

### 필수 요구사항

| 도구 | 버전 | 다운로드 |
|------|------|----------|
| **Python** | 3.10 이상 | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18.x 이상 | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x 이상 | Node.js와 함께 설치됨 |
| **Git** | 최신 버전 | [git-scm.com](https://git-scm.com/) |
| **SQLite** | 3.x | 대부분의 OS에 기본 설치됨 |

### 추천 개발 도구

- **IDE**: Visual Studio Code, PyCharm, WebStorm
- **Python 확장**: Python, Pylance
- **JavaScript 확장**: ESLint, Prettier
- **데이터베이스 도구**: DB Browser for SQLite
- **API 테스팅**: Postman, Thunder Client

---

## 프로젝트 구조

### 전체 디렉토리 구조

```
Project_Master/
├── backend/                    # 백엔드 (FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 진입점
│   │   ├── database.py        # DB 연결 설정
│   │   ├── models/            # SQLAlchemy ORM 모델
│   │   ├── schemas/           # Pydantic 스키마
│   │   ├── api/               # API 엔드포인트
│   │   └── crud/              # CRUD 작업
│   ├── migrations/            # Alembic 마이그레이션
│   ├── tests/                 # 테스트 코드
│   ├── requirements.txt       # Python 의존성
│   └── requirements-dev.txt   # 개발 의존성
│
├── frontend/                   # 프론트엔드 (React)
│   ├── public/                # 정적 파일
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   ├── services/          # API 서비스
│   │   ├── stores/            # Zustand 상태 관리
│   │   ├── utils/             # 유틸리티 함수
│   │   └── main.jsx           # React 진입점
│   ├── package.json           # npm 의존성
│   └── vite.config.js         # Vite 설정
│
├── deployment/                 # 배포 관련 파일
│   ├── packages/              # 오프라인 패키지
│   ├── windows/               # Windows 스크립트
│   └── linux/                 # Linux 스크립트
│
├── docs/                       # 문서
│   ├── installation-guide.md
│   ├── api-documentation.md
│   ├── architecture.md
│   ├── development-guide.md   # 이 문서
│   └── user-manual.md
│
├── README.md                   # 프로젝트 개요
├── DEVELOPMENT_PLAN.md         # 개발 계획서
└── .gitignore                 # Git 제외 파일
```

---

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/Project_Master.git
cd Project_Master
```

### 2. 백엔드 설정

#### 가상 환경 생성 및 활성화

**Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 의존성 설치

```bash
# 운영 의존성
pip install -r requirements.txt

# 개발 의존성 (테스트, 린팅 등)
pip install -r requirements-dev.txt
```

#### 데이터베이스 초기화

```bash
# Alembic 마이그레이션 실행
alembic upgrade head
```

또는 초기화 스크립트 사용:
```bash
python ../deployment/database/init_db.py
```

#### 백엔드 서버 실행

```bash
# 개발 모드 (자동 재시작)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 실행되면 다음 주소로 접속 가능합니다:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. 프론트엔드 설정

#### 의존성 설치

```bash
cd frontend
npm install
```

#### 프론트엔드 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 http://localhost:5173 으로 접속합니다.

### 4. 개발 환경 확인

다음 체크리스트를 확인하세요:

- [ ] 백엔드 서버가 http://localhost:8000 에서 실행 중
- [ ] Swagger UI가 http://localhost:8000/docs 에서 접속 가능
- [ ] 프론트엔드가 http://localhost:5173 에서 실행 중
- [ ] 프론트엔드에서 백엔드 API 호출 성공
- [ ] SQLite 데이터베이스 파일 (`backend/project_master.db`) 생성됨

---

## 개발 워크플로우

### 1. 기능 개발 프로세스

```
1. 이슈 생성
   ↓
2. Feature 브랜치 생성
   ↓
3. 코드 작성
   ↓
4. 테스트 작성 및 실행
   ↓
5. 코드 리뷰
   ↓
6. 메인 브랜치로 병합
   ↓
7. 배포
```

### 2. 브랜치 전략

```
main (production)
  ↓
develop (development)
  ↓
feature/기능명 (feature branches)
  ├─ feature/add-project-filter
  ├─ feature/gantt-chart-zoom
  └─ feature/user-authentication
```

### 3. 커밋 메시지 규칙

```
[타입] 간단한 설명 (50자 이내)

상세한 설명 (선택사항)
- 변경 사항 1
- 변경 사항 2

관련 이슈: #123
```

**커밋 타입**:
- `[기능]`: 새로운 기능 추가
- `[수정]`: 버그 수정
- `[개선]`: 기존 기능 개선
- `[리팩토링]`: 코드 리팩토링
- `[문서]`: 문서 수정
- `[테스트]`: 테스트 코드
- `[빌드]`: 빌드 설정 변경
- `[스타일]`: 코드 포맷팅

**예시**:
```
[기능] 프로젝트 필터링 기능 추가

- 프로젝트 상태별 필터링 구현
- 검색어 기반 프로젝트 검색 추가
- UI에 필터 컴포넌트 추가

관련 이슈: #45
```

---

## 빌드 및 테스트

### 백엔드 테스트

#### 단위 테스트 실행

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# 모든 테스트 실행
pytest

# 특정 테스트 파일 실행
pytest tests/test_api/test_projects.py

# 커버리지 포함
pytest --cov=app tests/

# 상세 출력
pytest -v
```

#### 테스트 작성 예시

```python
# tests/test_api/test_projects.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_project():
    response = client.post(
        "/api/v1/projects",
        json={
            "name": "테스트 프로젝트",
            "description": "테스트 설명",
            "start_date": "2025-01-01T00:00:00",
            "end_date": "2025-12-31T23:59:59",
            "status": "planning"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "테스트 프로젝트"
    assert "id" in data

def test_get_projects():
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

#### 코드 품질 검사

```bash
# 코드 스타일 검사 (Flake8)
flake8 app/

# 코드 포맷팅 (Black)
black app/ tests/

# 타입 체크 (mypy)
mypy app/
```

### 프론트엔드 테스트

#### 단위 테스트 실행

```bash
cd frontend

# 테스트 실행
npm run test

# 테스트 커버리지
npm run test:coverage

# 테스트 감시 모드
npm run test:watch
```

#### 테스트 작성 예시

```javascript
// src/components/projects/ProjectList.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProjectList from './ProjectList'

describe('ProjectList', () => {
  it('renders project list', () => {
    render(<ProjectList />)
    expect(screen.getByText(/프로젝트 목록/i)).toBeInTheDocument()
  })

  it('displays projects', async () => {
    render(<ProjectList />)
    const projectName = await screen.findByText(/테스트 프로젝트/i)
    expect(projectName).toBeInTheDocument()
  })
})
```

#### 린팅

```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix
```

### 프로덕션 빌드

#### 백엔드 빌드 (배포 패키지 준비)

```bash
cd backend

# 의존성 패키지 다운로드 (폐쇄망 배포용)
pip download -r requirements.txt -d ../deployment/packages/python-wheels
```

#### 프론트엔드 빌드

```bash
cd frontend

# 프로덕션 빌드
npm run build

# 빌드 결과는 frontend/dist/ 디렉토리에 생성됨
```

빌드 결과:
- `dist/` 디렉토리에 최적화된 정적 파일 생성
- 자동 코드 스플리팅 및 번들 최적화
- 프로덕션 모드로 컴파일

---

## 코딩 규칙

### Python 코딩 스타일 (Backend)

#### PEP 8 준수

```python
# 좋은 예시
def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
    """프로젝트 ID로 프로젝트 조회"""
    return db.query(Project).filter(Project.id == project_id).first()

# 나쁜 예시
def getProjectById(db,project_id):
    return db.query(Project).filter(Project.id==project_id).first()
```

#### 타입 힌팅 사용

```python
from typing import List, Optional
from sqlalchemy.orm import Session

def get_projects(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[Project]:
    """프로젝트 목록 조회"""
    return db.query(Project).offset(skip).limit(limit).all()
```

#### Docstring 작성

```python
def create_project(db: Session, project: ProjectCreate) -> Project:
    """
    새로운 프로젝트를 생성합니다.

    Args:
        db (Session): 데이터베이스 세션
        project (ProjectCreate): 생성할 프로젝트 데이터

    Returns:
        Project: 생성된 프로젝트 객체

    Raises:
        ValueError: 유효하지 않은 데이터인 경우
    """
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project
```

### JavaScript 코딩 스타일 (Frontend)

#### ESLint 규칙 준수

```javascript
// 좋은 예시
const getProject = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`)
    return response
  } catch (error) {
    console.error('프로젝트 조회 실패:', error)
    throw error
  }
}

// 나쁜 예시
function getProject(projectId){
  return api.get('/projects/'+projectId)
}
```

#### React 컴포넌트 작성

```jsx
// 함수형 컴포넌트 사용
import React, { useState, useEffect } from 'react'

const ProjectList = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div>
      {loading ? <p>로딩 중...</p> : (
        <ul>
          {projects.map(project => (
            <li key={project.id}>{project.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProjectList
```

### 명명 규칙

#### Python (Backend)

- **모듈/패키지**: `snake_case` (예: `project_service.py`)
- **클래스**: `PascalCase` (예: `ProjectCreate`)
- **함수/메서드**: `snake_case` (예: `get_project`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_PROJECTS`)
- **변수**: `snake_case` (예: `project_id`)

#### JavaScript (Frontend)

- **파일**: `PascalCase` (컴포넌트), `camelCase` (유틸리티)
  - 컴포넌트: `ProjectList.jsx`
  - 서비스: `projectService.js`
- **클래스/컴포넌트**: `PascalCase` (예: `ProjectList`)
- **함수**: `camelCase` (예: `getProject`)
- **상수**: `UPPER_SNAKE_CASE` (예: `API_BASE_URL`)
- **변수**: `camelCase` (예: `projectId`)

---

## Git 워크플로우

### 1. 새로운 기능 개발

```bash
# 최신 코드 가져오기
git checkout develop
git pull origin develop

# Feature 브랜치 생성
git checkout -b feature/프로젝트-필터링

# 작업 수행 후 커밋
git add .
git commit -m "[기능] 프로젝트 필터링 기능 추가"

# 원격 브랜치에 푸시
git push origin feature/프로젝트-필터링

# Pull Request 생성 (GitHub/GitLab)
```

### 2. 버그 수정

```bash
# Bugfix 브랜치 생성
git checkout -b bugfix/날짜-검증-오류

# 작업 수행 후 커밋
git add .
git commit -m "[수정] 날짜 검증 로직 오류 수정"

# 푸시 및 PR 생성
git push origin bugfix/날짜-검증-오류
```

### 3. 코드 리뷰 및 병합

```bash
# PR이 승인되면 develop 브랜치로 병합
git checkout develop
git merge feature/프로젝트-필터링

# 병합 후 원격 저장소에 푸시
git push origin develop

# Feature 브랜치 삭제
git branch -d feature/프로젝트-필터링
git push origin --delete feature/프로젝트-필터링
```

### 4. 릴리스

```bash
# Release 브랜치 생성
git checkout -b release/v1.1.0

# 버전 정보 업데이트, 최종 테스트

# main 브랜치로 병합
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin main --tags

# develop 브랜치에도 병합
git checkout develop
git merge release/v1.1.0
git push origin develop

# Release 브랜치 삭제
git branch -d release/v1.1.0
```

---

## 디버깅 가이드

### 백엔드 디버깅

#### 로그 설정

```python
# app/main.py
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@app.get("/api/v1/projects")
def get_projects(db: Session = Depends(get_db)):
    logger.debug("프로젝트 목록 조회 요청")
    projects = crud.get_projects(db)
    logger.debug(f"조회된 프로젝트 수: {len(projects)}")
    return projects
```

#### VS Code 디버깅 설정

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
      ],
      "jinja": true,
      "justMyCode": false,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

#### 데이터베이스 쿼리 디버깅

```python
# SQLAlchemy 쿼리 로깅 활성화
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### 프론트엔드 디버깅

#### 브라우저 개발자 도구

- **Console**: `console.log()`, `console.error()` 사용
- **Network**: API 요청/응답 확인
- **React DevTools**: 컴포넌트 상태 및 props 확인

#### VS Code 디버깅 설정

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

#### API 호출 디버깅

```javascript
// src/services/api.js
api.interceptors.request.use(
  config => {
    console.log('API 요청:', config.method.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('API 요청 오류:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('API 응답:', response.status, response.config.url)
    return response
  },
  error => {
    console.error('API 응답 오류:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

---

## 배포 프로세스

### 1. 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트
- [ ] 버전 번호 업데이트
- [ ] CHANGELOG.md 작성
- [ ] 의존성 보안 점검

### 2. 폐쇄망 배포 패키지 생성

#### Python 패키지 수집

```bash
cd backend
pip download -r requirements.txt -d ../deployment/packages/python-wheels
```

#### 프론트엔드 빌드

```bash
cd frontend
npm run build
cp -r dist/* ../deployment/frontend-build/
```

#### 배포 패키지 압축

```bash
cd ..
tar -czf project_master_v1.0.0.tar.gz Project_Master/
# 또는 Windows에서: zip -r project_master_v1.0.0.zip Project_Master/
```

### 3. 배포 실행

사용자는 [설치 가이드](installation-guide.md)를 따라 설치합니다.

---

## 문제 해결

### 백엔드 관련 문제

#### 1. 데이터베이스 마이그레이션 실패

**증상**: `alembic upgrade head` 실패

**해결방법**:
```bash
# 현재 버전 확인
alembic current

# 마이그레이션 히스토리 확인
alembic history

# 마이그레이션 재시도
alembic downgrade base
alembic upgrade head
```

#### 2. 가상 환경 활성화 오류

**증상**: `venv\Scripts\activate` 실행 불가 (Windows)

**해결방법**:
```powershell
# PowerShell 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. 포트 충돌

**증상**: `Address already in use: 8000`

**해결방법**:
```bash
# Linux/macOS
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### 프론트엔드 관련 문제

#### 1. npm install 실패

**증상**: 의존성 설치 중 오류

**해결방법**:
```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 2. CORS 에러

**증상**: `Access to XMLHttpRequest has been blocked by CORS policy`

**해결방법**:
백엔드 CORS 설정 확인:
```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. 빌드 오류

**증상**: `npm run build` 실패

**해결방법**:
```bash
# TypeScript 오류 확인
npm run type-check

# ESLint 오류 수정
npm run lint:fix

# 빌드 재시도
npm run build
```

---

## 기여 가이드

### 1. 기여 프로세스

```
1. 이슈 확인/생성
   ↓
2. 저장소 포크 (Fork)
   ↓
3. Feature 브랜치 생성
   ↓
4. 코드 작성
   ↓
5. 테스트 작성 및 실행
   ↓
6. 커밋 및 푸시
   ↓
7. Pull Request 생성
   ↓
8. 코드 리뷰
   ↓
9. 수정 반영
   ↓
10. 병합 (Merge)
```

### 2. Pull Request 가이드라인

#### PR 제목

```
[타입] 간단한 설명 (50자 이내)
```

예시:
```
[기능] 프로젝트 검색 기능 추가
[수정] 날짜 검증 로직 버그 수정
[개선] 간트 차트 성능 최적화
```

#### PR 설명

```markdown
## 변경 사항
- 변경된 내용 설명

## 동기
- 이 변경이 필요한 이유

## 테스트
- [ ] 단위 테스트 추가
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

## 체크리스트
- [ ] 코딩 규칙 준수
- [ ] 문서 업데이트
- [ ] 테스트 통과
- [ ] 커밋 메시지 작성

## 관련 이슈
Closes #123
```

### 3. 코드 리뷰 체크리스트

#### 리뷰어 체크리스트

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 코딩 규칙을 준수하는가?
- [ ] 테스트가 충분한가?
- [ ] 보안 취약점이 없는가?
- [ ] 성능 문제가 없는가?
- [ ] 문서가 업데이트되었는가?
- [ ] 불필요한 코드가 제거되었는가?

#### 기여자 체크리스트

- [ ] 로컬에서 모든 테스트 통과
- [ ] 코드 포맷팅 완료 (Black, Prettier)
- [ ] 린팅 오류 없음 (Flake8, ESLint)
- [ ] 커밋 메시지 규칙 준수
- [ ] 문서 업데이트 (필요 시)
- [ ] CHANGELOG.md 업데이트 (필요 시)

---

## 참고 자료

### 프로젝트 문서

- [README.md](../README.md) - 프로젝트 개요
- [설치 가이드](installation-guide.md) - 설치 방법
- [API 문서](api-documentation.md) - REST API 레퍼런스
- [아키텍처 문서](architecture.md) - 시스템 아키텍처
- [배포 가이드](../deployment/README.md) - 배포 방법

### 외부 문서

#### 백엔드

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SQLAlchemy 문서](https://docs.sqlalchemy.org/)
- [Pydantic 문서](https://docs.pydantic.dev/)
- [Alembic 문서](https://alembic.sqlalchemy.org/)
- [pytest 문서](https://docs.pytest.org/)

#### 프론트엔드

- [React 공식 문서](https://react.dev/)
- [Vite 문서](https://vitejs.dev/)
- [Material-UI 문서](https://mui.com/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [Axios 문서](https://axios-http.com/)
- [React Router 문서](https://reactrouter.com/)

---

## 지원 및 문의

- **이슈 트래커**: GitHub Issues
- **토론**: GitHub Discussions
- **이메일**: support@project-master.com

---

**개발에 참여해 주셔서 감사합니다! 🎉**
