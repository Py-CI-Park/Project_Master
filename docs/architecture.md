# 프로젝트 관리 시스템 - 아키텍처 문서

이 문서는 프로젝트 관리 시스템의 전체 아키텍처와 기술 스택을 설명합니다.

## 목차

1. [시스템 개요](#시스템-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [백엔드 아키텍처](#백엔드-아키텍처)
4. [프론트엔드 아키텍처](#프론트엔드-아키텍처)
5. [데이터베이스 설계](#데이터베이스-설계)
6. [API 아키텍처](#api-아키텍처)
7. [배포 아키텍처](#배포-아키텍처)
8. [기술 스택](#기술-스택)
9. [보안 아키텍처](#보안-아키텍처)
10. [성능 고려사항](#성능-고려사항)

---

## 시스템 개요

### 시스템 목적

프로젝트 관리 시스템은 소프트웨어 개발 프로젝트의 일정, 태스크, Enabler를 효율적으로 관리하기 위한 웹 기반 애플리케이션입니다.

### 주요 기능

- **프로젝트 관리**: 프로젝트 생성, 수정, 삭제, 조회
- **태스크 관리**: 프로젝트별 태스크 관리 (간트 차트)
- **Enabler 관리**: 프로젝트 지원 활동 관리
- **시각화**: 간트 차트를 통한 일정 시각화

### 시스템 특징

- **폐쇄망 지원**: 외부 네트워크 없이 독립 실행 가능
- **웹 기반**: 브라우저를 통한 접근
- **RESTful API**: 표준 REST API 제공
- **경량 데이터베이스**: SQLite 사용으로 설치 간소화

---

## 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────┐
│                       웹 브라우저                         │
│                    (사용자 인터페이스)                    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/HTTPS
                      │
┌─────────────────────┴───────────────────────────────────┐
│                  프론트엔드 서버                          │
│              React + Vite (localhost:5173)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  - React Components (UI)                         │  │
│  │  - React Router (라우팅)                         │  │
│  │  - Zustand (상태 관리)                           │  │
│  │  - Axios (HTTP 클라이언트)                       │  │
│  │  - Material-UI (UI 라이브러리)                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API (JSON)
                      │
┌─────────────────────┴───────────────────────────────────┐
│                  백엔드 API 서버                          │
│             FastAPI + Uvicorn (localhost:8000)          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Layer (FastAPI Endpoints)                   │  │
│  │  ├─ /api/v1/projects                             │  │
│  │  ├─ /api/v1/tasks                                │  │
│  │  └─ /api/v1/enablers                             │  │
│  └────────────────────┬─────────────────────────────┘  │
│  ┌────────────────────┴─────────────────────────────┐  │
│  │  Business Logic Layer                            │  │
│  │  - Pydantic Models (검증)                        │  │
│  │  - Service Logic (비즈니스 로직)                 │  │
│  └────────────────────┬─────────────────────────────┘  │
│  ┌────────────────────┴─────────────────────────────┐  │
│  │  Data Access Layer (SQLAlchemy ORM)              │  │
│  │  - Models (ORM 모델)                             │  │
│  │  - CRUD Operations                               │  │
│  └────────────────────┬─────────────────────────────┘  │
└─────────────────────┬─┴─────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│                  데이터베이스 계층                        │
│                SQLite (project_master.db)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tables:                                         │  │
│  │  - projects (프로젝트)                           │  │
│  │  - tasks (태스크)                                │  │
│  │  - enablers (Enabler)                            │  │
│  │  - alembic_version (마이그레이션 버전)           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 아키텍처 레이어

#### 1. 프레젠테이션 레이어 (Presentation Layer)
- **역할**: 사용자 인터페이스 제공
- **기술**: React, Material-UI
- **책임**: UI 렌더링, 사용자 입력 처리, 상태 관리

#### 2. API 레이어 (API Layer)
- **역할**: REST API 엔드포인트 제공
- **기술**: FastAPI
- **책임**: HTTP 요청/응답 처리, 라우팅, 입력 검증

#### 3. 비즈니스 로직 레이어 (Business Logic Layer)
- **역할**: 비즈니스 규칙 구현
- **기술**: Python, Pydantic
- **책임**: 데이터 검증, 비즈니스 로직 실행

#### 4. 데이터 접근 레이어 (Data Access Layer)
- **역할**: 데이터베이스 CRUD 작업
- **기술**: SQLAlchemy ORM
- **책임**: 데이터베이스 쿼리, 트랜잭션 관리

#### 5. 데이터베이스 레이어 (Database Layer)
- **역할**: 데이터 영속성
- **기술**: SQLite
- **책임**: 데이터 저장, 조회, 관계 관리

---

## 백엔드 아키텍처

### 디렉토리 구조

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI 애플리케이션 진입점
│   ├── database.py              # 데이터베이스 설정
│   ├── models/                  # SQLAlchemy ORM 모델
│   │   ├── __init__.py
│   │   ├── project.py          # Project 모델
│   │   ├── task.py             # Task 모델
│   │   └── enabler.py          # Enabler 모델
│   ├── schemas/                 # Pydantic 스키마
│   │   ├── __init__.py
│   │   ├── project.py          # Project 스키마
│   │   ├── task.py             # Task 스키마
│   │   └── enabler.py          # Enabler 스키마
│   ├── api/                     # API 엔드포인트
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── projects.py     # 프로젝트 API
│   │   │   ├── tasks.py        # 태스크 API
│   │   │   └── enablers.py     # Enabler API
│   └── crud/                    # CRUD 작업
│       ├── __init__.py
│       ├── project.py
│       ├── task.py
│       └── enabler.py
├── migrations/                  # Alembic 마이그레이션
│   ├── versions/
│   └── env.py
├── tests/                       # 테스트 코드
│   ├── test_api/
│   └── test_models/
├── requirements.txt             # Python 의존성
└── project_master.db            # SQLite 데이터베이스 (런타임 생성)
```

### 핵심 컴포넌트

#### 1. FastAPI 애플리케이션 (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="프로젝트 관리 시스템 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 통신)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(projects_router, prefix="/api/v1", tags=["projects"])
app.include_router(tasks_router, prefix="/api/v1", tags=["tasks"])
app.include_router(enablers_router, prefix="/api/v1", tags=["enablers"])
```

#### 2. 데이터베이스 설정 (`app/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./project_master.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 3. ORM 모델 (`app/models/project.py` 예시)

```python
from sqlalchemy import Column, Integer, String, DateTime, Enum
from app.database import Base
import enum

class ProjectStatus(str, enum.Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(2000))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # 관계 정의
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    enablers = relationship("Enabler", back_populates="project", cascade="all, delete-orphan")
```

#### 4. Pydantic 스키마 (`app/schemas/project.py` 예시)

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    start_date: datetime
    end_date: datetime
    status: Optional[str] = "planning"

    @field_validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values.data and v < values.data['start_date']:
            raise ValueError('종료일은 시작일 이후여야 합니다')
        return v

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
```

#### 5. CRUD 작업 (`app/crud/project.py` 예시)

```python
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    """프로젝트 목록 조회"""
    return db.query(Project).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int):
    """프로젝트 상세 조회"""
    return db.query(Project).filter(Project.id == project_id).first()

def create_project(db: Session, project: ProjectCreate):
    """프로젝트 생성"""
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def update_project(db: Session, project_id: int, project: ProjectUpdate):
    """프로젝트 수정"""
    db_project = get_project(db, project_id)
    if db_project:
        for key, value in project.dict(exclude_unset=True).items():
            setattr(db_project, key, value)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    """프로젝트 삭제"""
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
    return db_project
```

---

## 프론트엔드 아키텍처

### 디렉토리 구조

```
frontend/
├── public/                      # 정적 파일
│   └── favicon.ico
├── src/
│   ├── main.jsx                # React 진입점
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── components/             # React 컴포넌트
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── projects/          # 프로젝트 관련 컴포넌트
│   │   │   ├── ProjectList.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   └── ProjectDetail.jsx
│   │   ├── tasks/             # 태스크 관련 컴포넌트
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── GanttChart.jsx
│   │   └── enablers/          # Enabler 관련 컴포넌트
│   │       ├── EnablerList.jsx
│   │       └── EnablerForm.jsx
│   ├── services/              # API 서비스
│   │   ├── api.js            # Axios 설정
│   │   ├── projectService.js
│   │   ├── taskService.js
│   │   └── enablerService.js
│   ├── stores/                # Zustand 상태 관리
│   │   ├── projectStore.js
│   │   ├── taskStore.js
│   │   └── enablerStore.js
│   ├── utils/                 # 유틸리티 함수
│   │   ├── dateFormatter.js
│   │   └── validators.js
│   ├── styles/                # 스타일 파일
│   │   └── global.css
│   └── routes/                # 라우팅 설정
│       └── index.jsx
├── package.json               # npm 의존성
├── vite.config.js            # Vite 설정
└── index.html                # HTML 템플릿
```

### 핵심 컴포넌트

#### 1. React 진입점 (`src/main.jsx`)

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

#### 2. API 서비스 (`src/services/api.js`)

```javascript
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// 요청 인터셉터 (에러 처리)
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api
```

#### 3. 상태 관리 (`src/stores/projectStore.js` 예시)

```javascript
import { create } from 'zustand'
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService'

export const useProjectStore = create((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await getProjects()
      set({ projects, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addProject: async (projectData) => {
    set({ loading: true, error: null })
    try {
      const newProject = await createProject(projectData)
      set(state => ({
        projects: [...state.projects, newProject],
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // ... 기타 작업
}))
```

#### 4. 라우팅 설정 (`src/App.jsx`)

```jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import ProjectList from './components/projects/ProjectList'
import ProjectDetail from './components/projects/ProjectDetail'
import TaskList from './components/tasks/TaskList'
import EnablerList from './components/enablers/EnablerList'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/tasks" element={<TaskList />} />
        <Route path="/projects/:id/enablers" element={<EnablerList />} />
      </Routes>
    </Layout>
  )
}

export default App
```

---

## 데이터베이스 설계

### ERD (Entity-Relationship Diagram)

```
┌─────────────────────────────────┐
│          projects               │
├─────────────────────────────────┤
│ PK  id: INTEGER                 │
│     name: VARCHAR(200)          │
│     description: VARCHAR(2000)  │
│     start_date: DATETIME        │
│     end_date: DATETIME          │
│     status: ENUM                │
│     created_at: DATETIME        │
│     updated_at: DATETIME        │
└────────────┬────────────────────┘
             │
             │ 1:N
             │
   ┌─────────┴─────────┐
   │                   │
   ▼                   ▼
┌──────────────┐  ┌──────────────┐
│    tasks     │  │   enablers   │
├──────────────┤  ├──────────────┤
│ PK id        │  │ PK id        │
│ FK project_id│  │ FK project_id│
│    name      │  │    name      │
│    ...       │  │    ...       │
└──────────────┘  └──────────────┘
```

### 테이블 스키마

#### 1. projects 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 프로젝트 고유 ID |
| name | VARCHAR(200) | NOT NULL | 프로젝트 이름 |
| description | VARCHAR(2000) | NULL | 프로젝트 설명 |
| start_date | DATETIME | NOT NULL | 시작일 |
| end_date | DATETIME | NOT NULL | 종료일 |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'planning' | 상태 (planning, in_progress, on_hold, completed, cancelled) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | DATETIME | NULL | 수정일시 |

**인덱스**:
- PRIMARY KEY: `id`
- INDEX: `name`

#### 2. tasks 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 태스크 고유 ID |
| project_id | INTEGER | NOT NULL, FOREIGN KEY → projects(id) | 프로젝트 ID |
| name | VARCHAR(200) | NOT NULL | 태스크 이름 |
| description | VARCHAR(2000) | NULL | 태스크 설명 |
| start_date | DATETIME | NOT NULL | 시작일 |
| end_date | DATETIME | NOT NULL | 종료일 |
| duration_days | INTEGER | DEFAULT 1 | 기간 (일) |
| progress | FLOAT | DEFAULT 0.0, CHECK(0 <= progress <= 100) | 진행률 (%) |
| status | VARCHAR(50) | DEFAULT 'not_started' | 상태 (not_started, in_progress, completed, blocked) |
| priority | VARCHAR(50) | DEFAULT 'medium' | 우선순위 (low, medium, high, critical) |
| assignee | VARCHAR(100) | NULL | 담당자 |
| is_milestone | BOOLEAN | DEFAULT FALSE | 마일스톤 여부 |
| color | VARCHAR(7) | NULL | 간트 차트 색상 (#RRGGBB) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | DATETIME | NULL | 수정일시 |

**인덱스**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `project_id` → `projects(id)` ON DELETE CASCADE
- INDEX: `project_id`, `status`

#### 3. enablers 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Enabler 고유 ID |
| project_id | INTEGER | NOT NULL, FOREIGN KEY → projects(id) | 프로젝트 ID |
| name | VARCHAR(200) | NOT NULL | Enabler 이름 |
| description | VARCHAR(2000) | NULL | 설명 |
| start_date | DATETIME | NOT NULL | 시작일 |
| end_date | DATETIME | NOT NULL | 종료일 |
| duration_days | INTEGER | DEFAULT 1 | 기간 (일) |
| progress | FLOAT | DEFAULT 0.0 | 진행률 (%) |
| status | VARCHAR(50) | DEFAULT 'not_started' | 상태 |
| priority | VARCHAR(50) | DEFAULT 'medium' | 우선순위 |
| assignee | VARCHAR(100) | NULL | 담당자 |
| color | VARCHAR(7) | NULL | 간트 차트 색상 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| updated_at | DATETIME | NULL | 수정일시 |

**인덱스**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `project_id` → `projects(id)` ON DELETE CASCADE
- INDEX: `project_id`, `status`

#### 4. alembic_version 테이블 (마이그레이션 관리)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| version_num | VARCHAR(32) | PRIMARY KEY | Alembic 마이그레이션 버전 |

### 데이터베이스 관계

- **1:N 관계**:
  - `projects` → `tasks` (한 프로젝트는 여러 태스크를 가짐)
  - `projects` → `enablers` (한 프로젝트는 여러 Enabler를 가짐)

- **CASCADE 삭제**:
  - 프로젝트 삭제 시 연관된 모든 태스크와 Enabler도 함께 삭제

---

## API 아키텍처

### RESTful API 설계 원칙

1. **리소스 중심 URL**: 명사형 URL 사용 (`/projects`, `/tasks`)
2. **HTTP 메서드 활용**:
   - GET (조회)
   - POST (생성)
   - PUT (전체 수정)
   - PATCH (부분 수정)
   - DELETE (삭제)
3. **상태 코드 표준화**:
   - 200: 성공
   - 201: 생성 성공
   - 204: 성공 (응답 본문 없음)
   - 400: 잘못된 요청
   - 404: 리소스 없음
   - 422: 검증 실패
   - 500: 서버 오류

### API 엔드포인트 구조

```
/api/v1/
├── /projects
│   ├── GET    /                     # 프로젝트 목록 조회
│   ├── POST   /                     # 프로젝트 생성
│   ├── GET    /{project_id}         # 프로젝트 상세 조회
│   ├── PUT    /{project_id}         # 프로젝트 수정
│   ├── DELETE /{project_id}         # 프로젝트 삭제
│   ├── GET    /{project_id}/tasks   # 프로젝트의 태스크 목록
│   └── GET    /{project_id}/enablers # 프로젝트의 Enabler 목록
│
├── /tasks
│   ├── GET    /{task_id}            # 태스크 상세 조회
│   ├── POST   /                     # 태스크 생성
│   ├── PUT    /{task_id}            # 태스크 수정
│   └── DELETE /{task_id}            # 태스크 삭제
│
└── /enablers
    ├── GET    /{enabler_id}         # Enabler 상세 조회
    ├── POST   /                     # Enabler 생성
    ├── PUT    /{enabler_id}         # Enabler 수정
    └── DELETE /{enabler_id}         # Enabler 삭제
```

### API 버전 관리

- **현재 버전**: v1 (`/api/v1`)
- **버전 관리 전략**: URL 경로 기반 버전 관리
- **하위 호환성**: 신규 필드 추가는 하위 호환, 필드 제거는 신규 버전 생성

### API 문서화

- **Swagger UI**: `http://localhost:8000/docs` (대화형 문서)
- **ReDoc**: `http://localhost:8000/redoc` (읽기 전용 문서)
- **OpenAPI JSON**: `http://localhost:8000/openapi.json` (스펙 파일)

---

## 배포 아키텍처

### 폐쇄망 배포 구조

```
Project_Master/
├── backend/
│   ├── app/                    # 백엔드 소스 코드
│   ├── venv/                   # Python 가상 환경 (설치 시 생성)
│   ├── requirements.txt        # Python 의존성
│   └── project_master.db       # SQLite 데이터베이스 (런타임 생성)
│
├── frontend/
│   ├── src/                    # 프론트엔드 소스 코드
│   └── dist/                   # 빌드된 프론트엔드 (배포 패키지에 포함)
│
├── deployment/
│   ├── packages/
│   │   └── python-wheels/      # Python 패키지 wheel 파일 (28개)
│   ├── frontend-build/          # 프론트엔드 빌드 파일
│   ├── database/
│   │   └── init_db.py          # 데이터베이스 초기화 스크립트
│   ├── windows/
│   │   ├── install.bat         # Windows 설치 스크립트
│   │   └── start.bat           # Windows 실행 스크립트
│   └── linux/
│       ├── install.sh          # Linux 설치 스크립트
│       ├── start.sh            # Linux 실행 스크립트
│       └── stop.sh             # Linux 종료 스크립트
│
└── docs/                       # 문서
```

### 설치 프로세스

```
1. 배포 패키지 압축 해제
   ↓
2. Python 3.10+ 설치 확인
   ↓
3. 설치 스크립트 실행 (install.bat / install.sh)
   ├─ 가상 환경 생성 (backend/venv)
   ├─ Python 패키지 설치 (폐쇄망 모드)
   └─ 데이터베이스 초기화 (Alembic migration)
   ↓
4. 서버 실행 스크립트 실행 (start.bat / start.sh)
   ├─ 백엔드 서버 시작 (localhost:8000)
   └─ 프론트엔드 서버 시작 (localhost:5173)
   ↓
5. 브라우저에서 접속 (http://localhost:5173)
```

### 실행 환경

#### Windows 환경
```batch
# 백엔드 서버
cd backend
venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 프론트엔드 서버 (별도 창)
cd frontend
npm run dev
```

#### Linux 환경
```bash
# 백엔드 서버 (백그라운드)
cd backend
source venv/bin/activate
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &

# 프론트엔드 서버 (백그라운드)
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
```

---

## 기술 스택

### 백엔드 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **언어** | Python | 3.10+ | 백엔드 개발 언어 |
| **프레임워크** | FastAPI | 0.109+ | 웹 프레임워크 |
| **ASGI 서버** | Uvicorn | 0.27+ | 비동기 서버 |
| **ORM** | SQLAlchemy | 2.0+ | 데이터베이스 ORM |
| **마이그레이션** | Alembic | 1.13+ | 데이터베이스 마이그레이션 |
| **검증** | Pydantic | 2.5+ | 데이터 검증 및 직렬화 |
| **데이터베이스** | SQLite | 3.x | 경량 파일 기반 DB |
| **테스팅** | pytest | 7.4+ | 단위 테스트 |
| **테스팅** | httpx | 0.26+ | HTTP 클라이언트 (테스트용) |

### 프론트엔드 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **언어** | JavaScript (ES6+) | - | 프론트엔드 개발 언어 |
| **프레임워크** | React | 18.x | UI 프레임워크 |
| **빌드 도구** | Vite | 5.x | 개발 서버 및 빌드 |
| **라우팅** | React Router | 6.x | 클라이언트 사이드 라우팅 |
| **상태 관리** | Zustand | 4.x | 경량 상태 관리 |
| **HTTP 클라이언트** | Axios | 1.x | REST API 통신 |
| **UI 라이브러리** | Material-UI (MUI) | 5.x | UI 컴포넌트 |
| **스타일링** | Emotion | 11.x | CSS-in-JS (MUI 의존성) |
| **간트 차트** | DHTMLX Gantt | 8.x | 간트 차트 시각화 |
| **테스팅** | Vitest | 1.x | 단위 테스트 |

### 개발 도구

| 카테고리 | 도구 | 용도 |
|---------|------|------|
| **버전 관리** | Git | 소스 코드 버전 관리 |
| **패키지 관리 (Python)** | pip | Python 패키지 관리 |
| **패키지 관리 (Node.js)** | npm | JavaScript 패키지 관리 |
| **가상 환경** | venv | Python 가상 환경 |
| **코드 포맷팅** | Black (Python) | Python 코드 포맷팅 |
| **린팅** | Flake8 (Python) | Python 코드 린팅 |
| **린팅** | ESLint (JavaScript) | JavaScript 코드 린팅 |

### 배포 도구

| 도구 | 용도 |
|------|------|
| Batch Scripts (Windows) | Windows 자동 설치/실행 |
| Shell Scripts (Linux) | Linux 자동 설치/실행 |
| pip wheel | Python 패키지 오프라인 배포 |
| Vite build | 프론트엔드 프로덕션 빌드 |

---

## 보안 아키텍처

### 현재 보안 수준 (v1.0)

#### 구현된 보안 기능

1. **입력 검증**:
   - Pydantic 스키마를 통한 모든 입력 데이터 검증
   - 길이 제한 (name: 1-200자, description: 최대 2000자)
   - 타입 검증 (날짜, 숫자, Enum 등)
   - 범위 검증 (progress: 0-100, duration: 1-3650)

2. **CORS 설정**:
   - 프론트엔드 origin만 허용 (`http://localhost:5173`)
   - 명시적 메서드 및 헤더 제한

3. **SQL 인젝션 방지**:
   - SQLAlchemy ORM 사용으로 자동 방지
   - Parameterized queries 사용

4. **에러 처리**:
   - 상세한 내부 에러 정보 노출 최소화
   - 표준화된 에러 응답 형식

#### 향후 보안 강화 계획

1. **인증 및 권한 관리**:
   - JWT 기반 인증 시스템
   - 역할 기반 접근 제어 (RBAC)
   - 세션 관리 및 토큰 갱신

2. **암호화**:
   - 사용자 비밀번호 해싱 (bcrypt)
   - HTTPS 통신 강제화
   - 민감 데이터 암호화

3. **보안 헤더**:
   - Content-Security-Policy
   - X-Frame-Options
   - X-Content-Type-Options

4. **감사 로그**:
   - 모든 API 요청 로깅
   - 사용자 활동 추적
   - 보안 이벤트 기록

### 보안 체크리스트

- [x] SQL 인젝션 방지 (ORM 사용)
- [x] 입력 검증 (Pydantic)
- [x] CORS 설정
- [ ] 인증 시스템 (v2.0 예정)
- [ ] 권한 관리 (v2.0 예정)
- [ ] HTTPS 지원 (v2.0 예정)
- [ ] 비밀번호 해싱 (v2.0 예정)
- [ ] Rate Limiting (v2.0 예정)

자세한 보안 정보는 `backend/SECURITY.md`를 참조하세요.

---

## 성능 고려사항

### 백엔드 성능 최적화

1. **데이터베이스 최적화**:
   - 적절한 인덱스 설정 (id, project_id, status)
   - 쿼리 최적화 (N+1 문제 방지)
   - 페이지네이션 (skip/limit 파라미터)

2. **API 응답 최적화**:
   - 필요한 필드만 조회 (select specific columns)
   - 응답 데이터 압축 (gzip)
   - 적절한 캐싱 전략

3. **비동기 처리**:
   - FastAPI의 async/await 활용
   - 비동기 데이터베이스 드라이버 (향후)

### 프론트엔드 성능 최적화

1. **번들 최적화**:
   - Vite의 코드 스플리팅 활용
   - Tree shaking으로 불필요한 코드 제거
   - 프로덕션 빌드 최적화

2. **렌더링 최적화**:
   - React.memo를 통한 불필요한 리렌더링 방지
   - useMemo, useCallback 활용
   - 가상 스크롤링 (대량 데이터)

3. **네트워크 최적화**:
   - API 요청 캐싱 (Axios 캐시)
   - 디바운싱/쓰로틀링 (검색 입력)
   - 병렬 요청 최적화

### 확장성 고려사항

#### 현재 아키텍처 한계

- **SQLite**: 동시 쓰기 제한, 대용량 데이터 처리 한계
- **단일 서버**: 수평 확장 어려움
- **파일 기반 DB**: 백업 및 복제 제한

#### 확장 방안

1. **데이터베이스 전환** (필요시):
   - SQLite → PostgreSQL / MySQL
   - 동시성 향상, 대용량 데이터 처리

2. **캐싱 레이어 추가** (필요시):
   - Redis 캐시 서버
   - 자주 조회되는 데이터 캐싱

3. **로드 밸런싱** (필요시):
   - 여러 백엔드 서버 인스턴스
   - Nginx/HAProxy 로드 밸런서

4. **마이크로서비스 아키텍처** (장기):
   - 서비스별 독립 배포
   - API Gateway 패턴

---

## 데이터 흐름

### 프로젝트 생성 데이터 흐름

```
1. 사용자 입력 (프론트엔드)
   └─ ProjectForm.jsx에서 폼 데이터 수집
      ↓
2. 클라이언트 검증
   └─ 필수 필드, 날짜 유효성 검증
      ↓
3. API 요청 (Axios)
   └─ POST /api/v1/projects
      ↓
4. 백엔드 수신 (FastAPI)
   └─ app/api/v1/projects.py 엔드포인트
      ↓
5. 데이터 검증 (Pydantic)
   └─ ProjectCreate 스키마 검증
      ↓
6. 비즈니스 로직 (CRUD)
   └─ crud.project.create_project()
      ↓
7. 데이터베이스 저장 (SQLAlchemy)
   └─ Project 모델 인스턴스 생성 및 저장
      ↓
8. 응답 반환 (FastAPI)
   └─ ProjectResponse 스키마로 직렬화
      ↓
9. 상태 업데이트 (Zustand)
   └─ projectStore.addProject()
      ↓
10. UI 업데이트 (React)
    └─ ProjectList 컴포넌트 리렌더링
```

### 프로젝트 조회 데이터 흐름

```
1. 컴포넌트 마운트 (React)
   └─ ProjectList.jsx useEffect
      ↓
2. 상태 관리 (Zustand)
   └─ projectStore.fetchProjects()
      ↓
3. API 요청 (Axios)
   └─ GET /api/v1/projects?skip=0&limit=100
      ↓
4. 백엔드 수신 (FastAPI)
   └─ app/api/v1/projects.py 엔드포인트
      ↓
5. 데이터 조회 (CRUD)
   └─ crud.project.get_projects()
      ↓
6. 데이터베이스 쿼리 (SQLAlchemy)
   └─ SELECT * FROM projects LIMIT 100 OFFSET 0
      ↓
7. 응답 반환 (FastAPI)
   └─ List[ProjectResponse] 스키마로 직렬화
      ↓
8. 상태 업데이트 (Zustand)
   └─ projects 배열 업데이트
      ↓
9. UI 렌더링 (React)
   └─ ProjectList 컴포넌트에 데이터 표시
```

---

## 에러 처리 흐름

### 백엔드 에러 처리

```python
# app/api/v1/projects.py
from fastapi import HTTPException

@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(
            status_code=404,
            detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다."
        )
    return project
```

### 프론트엔드 에러 처리

```javascript
// src/services/projectService.js
export const getProject = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`)
    return response
  } catch (error) {
    if (error.response) {
      // 서버 응답 에러 (4xx, 5xx)
      throw new Error(error.response.data.detail || '프로젝트를 불러올 수 없습니다.')
    } else if (error.request) {
      // 요청 전송 실패
      throw new Error('서버에 연결할 수 없습니다.')
    } else {
      // 기타 에러
      throw new Error('알 수 없는 오류가 발생했습니다.')
    }
  }
}
```

---

## 추가 참고 자료

- [설치 가이드](installation-guide.md) - 시스템 설치 방법
- [API 문서](api-documentation.md) - REST API 상세 설명
- [개발 가이드](development-guide.md) - 개발 환경 설정 및 기여 방법
- [배포 가이드](../deployment/README.md) - 폐쇄망 배포 상세 정보
- [보안 문서](../backend/SECURITY.md) - 보안 취약점 및 대응 방안

---

**이 아키텍처 문서는 v1.0 기준이며, 시스템 업데이트에 따라 변경될 수 있습니다.**
