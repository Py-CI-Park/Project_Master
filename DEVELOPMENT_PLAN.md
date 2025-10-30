# 폐쇄망 프로젝트 관리 시스템 개발 계획서

> **프로젝트명**: Closed Network Project Manager
> **버전**: 1.0.0
> **작성일**: 2025-10-30
> **개발 상태**: 🔴 미시작 (Phase 0 - 계획 단계)

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [개발 단계 및 일정](#5-개발-단계-및-일정)
6. [상세 개발 계획](#6-상세-개발-계획)
7. [품질 관리](#7-품질-관리)
8. [테스트 전략](#8-테스트-전략)
9. [배포 전략](#9-배포-전략)
10. [위험 관리](#10-위험-관리)
11. [개발 진행 상황 추적](#11-개발-진행-상황-추적)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적
폐쇄망 환경에서 **100% 오프라인으로 동작**하는 완전 오픈소스 기반 프로젝트/일정 관리 시스템 개발

### 1.2 핵심 기능
- ✅ **동적 간트 차트**: 실시간 태스크 시각화 및 드래그 앤 드롭 편집
- ✅ **Key Enabler 관리**: 프로젝트 성공을 위한 핵심 요소 추적
- ✅ **의존성 시각화**: 태스크 간 의존성 그래프 및 영향 분석
- ✅ **통합 캘린더**: 일정, 마일스톤, 이벤트 통합 관리
- ✅ **크리티컬 패스 분석**: CPM 알고리즘 기반 자동 계산
- ✅ **영향 분석**: Enabler 지연 시 프로젝트 영향도 자동 계산
- ✅ **리포트 생성**: 진행 현황, 지연 분석, CSV/Excel 익스포트

### 1.3 비기능 요구사항
- **성능**: 1000개 이상의 태스크 처리 가능
- **응답성**: 모든 UI 작업 100ms 이내 응답
- **안정성**: 99% 이상의 업타임
- **보안**: 데이터 암호화 및 접근 제어
- **확장성**: 모듈식 설계로 기능 추가 용이
- **호환성**: Windows 10/11, Linux(Ubuntu 20.04+) 지원

### 1.4 프로젝트 범위
**포함 사항**:
- 웹 기반 UI (React SPA)
- RESTful API 백엔드 (FastAPI)
- SQLite 데이터베이스
- 오프라인 패키지 배포 시스템
- 사용자 매뉴얼 및 설치 가이드

**제외 사항**:
- 멀티 유저 동시 편집 (향후 고려)
- 클라우드 동기화
- 모바일 앱
- 다국어 지원 (1차 버전은 한국어만)

---

## 2. 기술 스택

### 2.1 Frontend
| 기술 | 버전 | 라이선스 | 용도 |
|------|------|----------|------|
| React | 18.2+ | MIT | UI 프레임워크 |
| TypeScript | 5.0+ | Apache 2.0 | 타입 안정성 |
| Material-UI (MUI) | 6.0+ | MIT | UI 컴포넌트 라이브러리 |
| Vite | 5.0+ | MIT | 빌드 도구 |
| Frappe Gantt | 0.6+ | MIT | 간트 차트 |
| FullCalendar | 6.0+ | MIT | 캘린더 |
| React-Flow | 11.0+ | MIT | 의존성 그래프 |
| Recharts | 2.8+ | MIT | 차트 라이브러리 |
| Axios | 1.6+ | MIT | HTTP 클라이언트 |
| Zustand | 4.4+ | MIT | 상태 관리 (선택) |

### 2.2 Backend
| 기술 | 버전 | 라이선스 | 용도 |
|------|------|----------|------|
| Python | 3.11+ | PSF | 백엔드 언어 |
| FastAPI | 0.109+ | MIT | 웹 프레임워크 |
| SQLAlchemy | 2.0+ | MIT | ORM |
| Pydantic | 2.5+ | MIT | 데이터 검증 |
| Uvicorn | 0.27+ | BSD | ASGI 서버 |
| SQLite | 3.4+ | Public Domain | 데이터베이스 |
| Alembic | 1.13+ | MIT | DB 마이그레이션 |
| pytest | 7.4+ | MIT | 테스팅 프레임워크 |

### 2.3 개발 도구
- **버전 관리**: Git
- **코드 품질**: ESLint, Prettier, Black, mypy
- **테스트**: Jest, React Testing Library, pytest
- **문서화**: Markdown, Swagger/OpenAPI
- **배포**: PyInstaller, npm, Docker (선택)

---

## 3. 시스템 아키텍처

### 3.1 전체 시스템 구조

```
┌─────────────────────────────────────────────┐
│         사용자 브라우저 (Client)             │
│        Chrome, Edge, Firefox                │
└──────────────┬──────────────────────────────┘
               │ HTTP/HTTPS (REST API)
               │
┌──────────────▼──────────────────────────────┐
│          Frontend (React SPA)               │
│  ┌────────────────────────────────────┐    │
│  │ Presentation Layer                  │    │
│  │  - Components (Gantt, Calendar)    │    │
│  │  - Hooks (useProjects, useTasks)   │    │
│  │  - Context (State Management)      │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │ Service Layer                       │    │
│  │  - API Client (Axios)              │    │
│  │  - Data Transformation             │    │
│  └────────────────────────────────────┘    │
└──────────────┬──────────────────────────────┘
               │ JSON over HTTP
               │
┌──────────────▼──────────────────────────────┐
│          Backend (FastAPI)                  │
│  ┌────────────────────────────────────┐    │
│  │ API Layer                           │    │
│  │  - REST Endpoints (/api/*)         │    │
│  │  - Request/Response Validation     │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │ Service Layer                       │    │
│  │  - Business Logic                  │    │
│  │  - CPM Algorithm                   │    │
│  │  - Dependency Analysis             │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │ Data Access Layer                   │    │
│  │  - SQLAlchemy ORM                  │    │
│  │  - Repository Pattern              │    │
│  └────────────────────────────────────┘    │
└──────────────┬──────────────────────────────┘
               │ SQL
               │
┌──────────────▼──────────────────────────────┐
│        Database (SQLite)                    │
│  - projects, tasks, enablers                │
│  - dependencies, enabler_impacts            │
│  - calendar_events                          │
└─────────────────────────────────────────────┘
```

### 3.2 핵심 알고리즘

#### 3.2.1 크리티컬 패스 분석 (CPM)
```
1. Topological Sort로 태스크 정렬
2. Forward Pass: 최조 시작/완료 시간 계산
3. Backward Pass: 최지 시작/완료 시간 계산
4. Slack 계산: LS - ES
5. Slack = 0인 태스크들이 크리티컬 패스
```

#### 3.2.2 Enabler 영향 분석
```
1. enabler_impacts 조회
2. 직접 영향 태스크 식별
3. DFS로 연쇄 영향 태스크 추적
4. 지연 일수 계산 및 전파
```

---

## 4. 데이터베이스 설계

### 4.1 ERD
```
projects (1) ──┬── (N) tasks
               │       │
               │       ├── (N) dependencies (self-reference)
               │       │
               │       └── (N) enabler_impacts
               │                    │
               └── (N) enablers ────┘
               │
               └── (N) calendar_events
```

### 4.2 주요 테이블

#### projects
```sql
id, name, description, start_date, end_date, status,
created_at, updated_at
```

#### tasks
```sql
id, project_id, name, description, start_date, end_date,
duration_days, progress, status, priority, assignee,
is_milestone, color, created_at, updated_at
```

#### enablers
```sql
id, project_id, name, description, type,
planned_delivery_date, actual_delivery_date,
status, criticality, responsible_person, notes,
created_at, updated_at
```

#### dependencies
```sql
id, predecessor_task_id, successor_task_id,
dependency_type (FS/SS/FF/SF), lag_days, created_at
```

#### enabler_impacts
```sql
id, enabler_id, task_id, impact_type,
impact_description, created_at
```

#### calendar_events
```sql
id, project_id, task_id, enabler_id, event_type,
title, description, event_date, all_day,
start_time, end_time, color, created_at
```

---

## 5. 개발 단계 및 일정

### 5.1 전체 일정 개요

| Phase | 기간 | 주요 산출물 | 상태 |
|-------|------|-------------|------|
| **Phase 0** | 1주 | 개발 환경 구축, 기본 구조 | 🔴 미시작 |
| **Phase 1** | 2-3주 | 백엔드 핵심 기능 | 🔴 미시작 |
| **Phase 2** | 3-4주 | 프론트엔드 기본 UI | 🔴 미시작 |
| **Phase 3** | 2-3주 | 고급 기능 (간트, 의존성) | 🔴 미시작 |
| **Phase 4** | 1-2주 | 통합 테스트 및 최적화 | 🔴 미시작 |
| **Phase 5** | 1-2주 | 배포 패키지 및 문서화 | 🔴 미시작 |

**총 예상 기간**: 10-15주 (약 3-4개월)

### 5.2 마일스톤

- 🎯 **M1** (2주차): 백엔드 API 기본 구조 완성
- 🎯 **M2** (4주차): 데이터베이스 및 CRUD 완성
- 🎯 **M3** (7주차): 프론트엔드 기본 UI 완성
- 🎯 **M4** (10주차): 간트 차트 및 캘린더 통합 완성
- 🎯 **M5** (12주차): 의존성 분석 및 크리티컬 패스 완성
- 🎯 **M6** (15주차): 배포 패키지 및 문서 완성

---

## 6. 상세 개발 계획

### Phase 0: 개발 환경 구축 및 기본 구조 (1주)
**기간**: 1주차
**목표**: 프로젝트 초기 설정 및 개발 환경 구성
**상태**: 🟢 완료
**시작일**: 2025-10-30
**완료일**: 2025-10-30

#### 작업 항목
- [x] **0.1** Git 저장소 초기화 및 `.gitignore` 설정 ✅ 완료 (2025-10-30)
- [x] **0.2** 백엔드 Python 가상환경 설정 ✅ 완료 (2025-10-30)
  - Python 3.10.12 설치 확인 완료
  - `venv` 생성 완료: `python -m venv backend/venv`
  - `requirements.txt` 및 `requirements-dev.txt` 작성 완료
  - 모든 패키지 설치 및 검증 완료
- [x] **0.3** 프론트엔드 프로젝트 초기화 ✅ 완료 (2025-10-30)
  - Node.js 20.19.3 설치 확인 완료 (요구사항: 18+)
  - Vite + React 19 + TypeScript 5.9 프로젝트 생성 완료
  - 핵심 의존성 설치 완료:
    - Material-UI 7.3.4, React Router 7.9.5, Axios 1.13.1, Zustand 5.0.8
  - 빌드 테스트 성공 (1.77초, 취약점 0개)
- [x] **0.4** 프로젝트 디렉토리 구조 생성 ✅ 완료 (2025-10-30)
  - 백엔드 구조: `app/{models,schemas,api,services,utils}`, `tests`, `alembic`
  - 프론트엔드 구조: `src/{components,services,hooks,contexts,types,utils}`, `tests`
  - 배포 구조: `deployment/{windows,linux,packages,database}`
  - 데이터/로그 구조: `data`, `logs`
  - 기본 파일 생성: `app/main.py`, `app/database.py` + Python 패키지 `__init__.py`
  - FastAPI 앱 import 테스트 성공
- [x] **0.5** 코드 품질 도구 설정 ✅ 완료 (2025-10-30)
  - 백엔드:
    - `pyproject.toml` 설정 완료 (Black, isort, mypy, pytest)
    - `.flake8` 설정 완료
    - Black 24.1.1 포맷 적용 (line-length: 100)
    - isort 검증 완료 (profile: black)
    - flake8 린팅 통과 (max-complexity: 10)
    - mypy 타입 체크 통과 (8개 파일)
  - 프론트엔드:
    - Prettier 3.6.2 설치 및 설정 완료 (.prettierrc, .prettierignore)
    - ESLint-Prettier 통합 완료 (eslint-config-prettier, eslint-plugin-prettier)
    - eslint.config.js 업데이트 (prettierConfig 추가)
    - package.json 스크립트 추가: `lint:fix`, `format`, `format:check`, `typecheck`
    - 모든 코드 품질 도구 테스트 통과
- [-] **0.6** Docker 개발 환경 설정 ⏭️ 건너뛰기 (선택사항)
  - 사유: 로컬 환경 구축 완료, 폐쇄망 특성상 네이티브 설치 우선
  - 향후 필요시 Phase 5에서 추가 가능

#### 완료 기준
- ✅ 백엔드 서버 실행 가능 (`uvicorn app.main:app --reload`)
- ✅ 프론트엔드 개발 서버 실행 가능 (`npm run dev`)
- ✅ Git 커밋 및 브랜치 전략 수립 완료

---

### Phase 1: 백엔드 핵심 기능 (2-3주)
**기간**: 2-4주차
**목표**: FastAPI 기반 RESTful API 및 데이터베이스 구축
**상태**: 🟡 진행 중
**시작일**: 2025-10-30

#### 1.1 데이터베이스 설계 및 모델 구현 (3일)
- [x] **1.1.1** SQLAlchemy 모델 정의 ✅ 완료 (2025-10-30)
  - ✅ `models/project.py` - 프로젝트 모델 (8개 필드, 3개 관계)
  - ✅ `models/task.py` - 태스크 모델 (14개 필드, 5개 관계)
  - ✅ `models/enabler.py` - Key Enabler 모델 (11개 필드, 3개 관계)
  - ✅ `models/dependency.py` - 의존성 모델 (FS/SS/FF/SF 타입 지원)
  - ✅ `models/enabler_impact.py` - Enabler 영향 모델 (blocking/required/optional/helpful)
  - ✅ `models/calendar_event.py` - 캘린더 이벤트 모델 (6가지 이벤트 타입)
  - ✅ `models/__init__.py` - 모든 모델 export
  - ✅ Black 포맷팅 적용 (6개 파일)
  - ✅ 모델 import 테스트 통과
- [x] **1.1.2** Alembic 마이그레이션 설정 ✅ 완료 (2025-10-30)
  - ✅ `alembic init alembic` - Alembic 초기화 완료
  - ✅ `alembic.ini` 설정 - SQLite 데이터베이스 URL 설정
  - ✅ `alembic/env.py` 설정 - Base metadata 및 모델 import 추가
  - ✅ 초기 마이그레이션 생성 (`777817938b66_initial_migration_create_all_tables.py`)
    - 6개 테이블: projects, tasks, enablers, dependencies, enabler_impacts, calendar_events
    - 모든 Foreign Key 제약조건 (CASCADE delete)
    - 29개 인덱스 (ID, Name, Status, Date 등 검색 필드)
  - ✅ 마이그레이션 적용 (`alembic upgrade head`)
  - ✅ 데이터베이스 생성 확인 (data/project_manager.db, 160KB)
  - ✅ Black 포맷팅 적용 (alembic/env.py, migration file)
- [x] **1.1.3** 데이터베이스 초기화 스크립트 ✅ 완료 (2025-10-30)
  - ✅ `init_db.py` 작성 (데이터베이스 초기화 및 검증 스크립트)
    - data 디렉토리 자동 생성
    - 데이터베이스 파일 존재 확인
    - 6개 테이블 존재 확인 (projects, tasks, enablers, dependencies, enabler_impacts, calendar_events)
    - 데이터베이스 연결 테스트
    - 상세한 초기화 진행 상황 출력
    - 다음 단계 안내 기능
  - ✅ `create_sample_data.py` 작성 (샘플 데이터 생성 스크립트)
    - 1개 샘플 프로젝트: "신규 시스템 구축 프로젝트" (6개월 일정)
    - 6개 샘플 태스크: 요구사항 분석, 시스템 설계, 백엔드/프론트엔드 개발, 통합 테스트, 배포
    - 6개 태스크 의존성: FS(Finish-Start) 타입 의존성 체인
    - 5개 Key Enabler: 클라우드 승인, 개발 서버, 보안 문서, DB 라이선스, 운영 교육
    - 6개 Enabler 영향: blocking, required, optional 타입 영향 관계
    - 6개 캘린더 이벤트: 킥오프 미팅, 마일스톤, 리뷰, 이벤트
    - 기존 데이터 삭제 기능 (사용자 확인 후)
    - 상세한 데이터 생성 로그
  - ✅ Black 포맷팅 적용 (2개 파일)
  - ✅ 실행 권한 설정 (chmod +x)
  - ✅ init_db.py 실행 테스트 통과

#### 1.2 Pydantic 스키마 정의 (2일)
- [x] **1.2.1** Request/Response 스키마 작성 ✅ 완료 (2025-10-30)
  - ✅ `schemas/project.py` - Project 스키마 (Base, Create, Update, Response)
    - ProjectBase: 공통 필드 (name, description, start_date, end_date, status)
    - ProjectCreate: 생성 요청 스키마
    - ProjectUpdate: 수정 요청 스키마 (모든 필드 Optional)
    - ProjectResponse: 응답 스키마 (id, created_at, updated_at 포함)
    - 상태 검증: planning, in_progress, on_hold, completed, cancelled
    - 날짜 검증: end_date >= start_date

  - ✅ `schemas/task.py` - Task 스키마 (Base, Create, Update, Response)
    - TaskBase: 14개 필드 (name, description, dates, progress, status, priority, assignee, milestone, color)
    - TaskCreate: project_id 포함 생성 스키마
    - TaskUpdate: 모든 필드 Optional
    - TaskResponse: id, project_id, timestamps 포함
    - 상태 검증: not_started, in_progress, completed, blocked
    - 우선순위 검증: low, medium, high, critical
    - 진행률 검증: 0.0 <= progress <= 100.0
    - 소요 기간 검증: duration_days >= 1
    - 날짜 검증: end_date >= start_date

  - ✅ `schemas/enabler.py` - Enabler 스키마 (Base, Create, Update, Response)
    - EnablerBase: 9개 필드 (name, type, dates, status, criticality, responsible_person, notes)
    - EnablerCreate: project_id 포함
    - EnablerUpdate: 모든 필드 Optional
    - EnablerResponse: id, project_id, timestamps 포함
    - 타입 검증: document, equipment, approval, resource, license, training
    - 상태 검증: requested, in_progress, delivered, delayed, cancelled
    - 중요도 검증: low, medium, high, critical

  - ✅ `schemas/dependency.py` - Dependency 스키마 (Base, Create, Update, Response)
    - DependencyBase: 4개 필드 (predecessor_task_id, successor_task_id, dependency_type, lag_days)
    - DependencyCreate: 생성 스키마
    - DependencyUpdate: dependency_type, lag_days 수정 가능
    - DependencyResponse: id, created_at 포함
    - 의존성 타입 검증: FS, SS, FF, SF
    - 순환 의존성 방지: predecessor ≠ successor

  - ✅ `schemas/calendar.py` - CalendarEvent 스키마 (Base, Create, Update, Response)
    - CalendarEventBase: 8개 필드 (event_type, title, description, date, time, color)
    - CalendarEventCreate: project_id, task_id, enabler_id 포함
    - CalendarEventUpdate: 모든 필드 Optional
    - CalendarEventResponse: id, foreign keys, created_at 포함
    - 이벤트 타입 검증: milestone, task_start, task_end, enabler_delivery, meeting, review
    - 시간 검증: all_day=False 시 start_time, end_time 필수
    - 시간 순서 검증: end_time > start_time

  - ✅ `schemas/enabler_impact.py` - EnablerImpact 스키마 (Base, Create, Update, Response)
    - EnablerImpactBase: 4개 필드 (enabler_id, task_id, impact_type, impact_description)
    - EnablerImpactCreate: 생성 스키마
    - EnablerImpactUpdate: impact_type, impact_description 수정 가능
    - EnablerImpactResponse: id, created_at 포함
    - 영향 타입 검증: blocking, required, optional, helpful

  - ✅ `schemas/__init__.py` - 모든 스키마 export
  - ✅ Black 포맷팅 적용 (6개 파일)
  - ✅ 스키마 import 테스트 통과

- [x] **1.2.2** 데이터 검증 로직 구현 ✅ 완료 (2025-10-30)
  - ✅ 날짜 유효성 검증 (end_date >= start_date)
    - Project, Task 스키마에 적용
    - field_validator 사용
  - ✅ 진행률 검증 (0.0 <= progress <= 100.0)
    - Task 스키마에 적용
    - Create, Update 모두 검증
  - ✅ Enum 값 검증
    - status, priority, type, criticality 등 모든 enum 필드
    - 허용된 값 목록과 비교
  - ✅ 관계 필드 검증
    - Dependency: predecessor ≠ successor (순환 방지)
    - CalendarEvent: all_day=False 시 시간 필수
  - ✅ Pydantic v2 패턴 사용
    - ConfigDict 사용 (from_attributes=True)
    - field_validator 데코레이터 사용
    - ValidationInfo 사용 (info.data)

#### 1.3 기본 CRUD API 구현 (5일)
- [x] **1.3.1** Projects API ✅ (2025-10-30 완료)
  - ✅ `POST /api/projects` - 프로젝트 생성
  - ✅ `GET /api/projects` - 프로젝트 목록 조회 (pagination 지원: skip, limit)
  - ✅ `GET /api/projects/{id}` - 프로젝트 상세 조회
  - ✅ `PUT /api/projects/{id}` - 프로젝트 수정
  - ✅ `DELETE /api/projects/{id}` - 프로젝트 삭제
  - ✅ 파일 생성:
    - app/api/v1/endpoints/projects.py (5개 엔드포인트, 212줄)
    - app/api/v1/endpoints/__init__.py (라우터 export)
    - app/api/v1/__init__.py (v1 API 라우터 통합)
    - app/api/__init__.py (메인 API export)
  - ✅ 에러 처리:
    - 400 Bad Request (생성/수정 실패)
    - 404 Not Found (프로젝트 미존재)
  - ✅ 문서화: OpenAPI 스키마 자동 생성 (summary, description, response_model)
  - ✅ Dependency Injection: get_db() 세션 관리
  - ✅ Black 포맷팅 완료
  - ✅ Import 테스트 통과
- [x] **1.3.2** Tasks API ✅ (2025-10-30 완료)
  - ✅ `POST /api/projects/{project_id}/tasks` - 태스크 생성
  - ✅ `GET /api/projects/{project_id}/tasks` - 프로젝트별 태스크 목록 조회 (pagination 지원)
  - ✅ `GET /api/tasks/{id}` - 태스크 상세 조회
  - ✅ `PUT /api/tasks/{id}` - 태스크 수정
  - ✅ `DELETE /api/tasks/{id}` - 태스크 삭제
  - ✅ 파일 생성:
    - app/api/v1/endpoints/tasks.py (5개 엔드포인트, 236줄)
  - ✅ 파일 업데이트:
    - app/api/v1/endpoints/__init__.py (tasks_router export)
    - app/api/v1/__init__.py (tasks 엔드포인트 등록)
  - ✅ 프로젝트 관계 검증:
    - 프로젝트 존재 여부 확인 (POST, GET list)
    - project_id 일치 검증 (URL vs 요청 데이터)
  - ✅ 에러 처리:
    - 400 Bad Request (생성/수정 실패, project_id 불일치)
    - 404 Not Found (프로젝트/태스크 미존재)
  - ✅ 문서화: OpenAPI 스키마 자동 생성
  - ✅ Black 포맷팅 완료 (1개 파일 재포맷)
  - ✅ Import 테스트 통과
- [ ] **1.3.3** Enablers API
  - 동일한 CRUD 패턴 적용
- [ ] **1.3.4** Dependencies API
  - `POST /api/dependencies` - 의존성 추가
  - `GET /api/projects/{id}/dependencies` - 의존성 조회
  - `DELETE /api/dependencies/{id}` - 의존성 삭제

#### 1.4 비즈니스 로직 구현 (5일)
- [ ] **1.4.1** 크리티컬 패스 계산 (`services/critical_path.py`)
  - Topological Sort 알고리즘 구현
  - Forward Pass 구현
  - Backward Pass 구현
  - Slack 계산
  - 크리티컬 패스 식별
- [ ] **1.4.2** 의존성 분석 (`services/dependency_analyzer.py`)
  - 의존성 그래프 생성
  - 순환 의존성 검증
  - 영향 분석 (DFS)
- [ ] **1.4.3** Gantt 데이터 생성 (`services/gantt_service.py`)
  - 태스크 데이터 변환
  - Enabler 마커 데이터 생성
  - 의존성 선 데이터 생성
- [ ] **1.4.4** 캘린더 서비스 (`services/calendar_service.py`)
  - 이벤트 자동 생성 (태스크 시작/종료, 마일스톤, Enabler 전달)
  - 기간별 이벤트 조회

#### 1.5 테스트 작성 (3일)
- [ ] **1.5.1** 단위 테스트 (pytest)
  - 모델 테스트
  - 서비스 로직 테스트
  - 유틸리티 함수 테스트
- [ ] **1.5.2** API 통합 테스트
  - 각 엔드포인트 테스트
  - 에러 케이스 테스트
- [ ] **1.5.3** 테스트 커버리지 80% 이상 달성

#### 완료 기준
- ✅ 모든 API 엔드포인트 정상 작동
- ✅ Swagger UI에서 API 문서 확인 가능
- ✅ 크리티컬 패스 계산 정확도 검증 완료
- ✅ 테스트 커버리지 80% 이상
- ✅ 데이터베이스 마이그레이션 정상 작동

---

### Phase 2: 프론트엔드 기본 UI (3-4주)
**기간**: 5-8주차
**목표**: React 기반 사용자 인터페이스 구축
**상태**: 🔴 미시작

#### 2.1 프로젝트 구조 및 기본 설정 (2일)
- [ ] **2.1.1** 라우팅 설정 (React Router)
  - `/` - 대시보드
  - `/projects` - 프로젝트 목록
  - `/projects/:id` - 프로젝트 상세
  - `/projects/:id/gantt` - 간트 차트
  - `/projects/:id/calendar` - 캘린더
  - `/projects/:id/dependencies` - 의존성 그래프
- [ ] **2.1.2** Material-UI 테마 설정
  - 커스텀 테마 정의 (`styles/theme.ts`)
  - 다크 모드 지원
- [ ] **2.1.3** Axios 인스턴스 설정
  - Base URL 설정
  - 인터셉터 구성 (에러 핸들링)

#### 2.2 공통 컴포넌트 개발 (3일)
- [ ] **2.2.1** Layout 컴포넌트
  - `Header.tsx` - 앱 바, 네비게이션
  - `Sidebar.tsx` - 사이드 메뉴
  - `MainLayout.tsx` - 레이아웃 컨테이너
- [ ] **2.2.2** 재사용 컴포넌트
  - `Button.tsx`
  - `Input.tsx`
  - `Select.tsx`
  - `DatePicker.tsx`
  - `Modal.tsx`
  - `Loading.tsx`
  - `ErrorBoundary.tsx`

#### 2.3 프로젝트 관리 UI (4일)
- [ ] **2.3.1** 프로젝트 목록 (`ProjectList.tsx`)
  - 카드 레이아웃
  - 검색 및 필터링
  - 정렬 기능
- [ ] **2.3.2** 프로젝트 생성/수정 폼 (`ProjectForm.tsx`)
  - 폼 검증
  - 날짜 선택기
  - 상태 선택
- [ ] **2.3.3** 프로젝트 상세 (`ProjectDetail.tsx`)
  - 프로젝트 정보 표시
  - 탭 네비게이션 (태스크, 간트, 캘린더, 리포트)
  - 통계 위젯

#### 2.4 태스크 관리 UI (5일)
- [ ] **2.4.1** 태스크 목록 (`TaskList.tsx`)
  - 테이블 뷰
  - 인라인 편집
  - 진행률 표시
  - 우선순위 표시
- [ ] **2.4.2** 태스크 생성/수정 폼 (`TaskForm.tsx`)
  - 폼 검증
  - 날짜 범위 선택
  - 담당자 할당
  - 마일스톤 플래그
- [ ] **2.4.3** 태스크 상세 (`TaskDetail.tsx`)
  - 상세 정보
  - 의존성 목록
  - 연결된 Enabler
  - 활동 이력
- [ ] **2.4.4** 칸반 보드 (`TaskBoard.tsx`) - 선택사항
  - 드래그 앤 드롭
  - 상태별 컬럼

#### 2.5 Enabler 관리 UI (3일)
- [ ] **2.5.1** Enabler 목록 (`EnablerList.tsx`)
  - 카드 레이아웃
  - 상태별 필터
  - 긴급도 표시
- [ ] **2.5.2** Enabler 생성/수정 폼 (`EnablerForm.tsx`)
  - 전달 예정일 설정
  - 실제 전달일 기록
  - 영향받는 태스크 선택
- [ ] **2.5.3** 영향 분석 뷰 (`ImpactAnalysis.tsx`)
  - 영향받는 태스크 목록
  - 지연 영향도 시각화
  - 경고 표시

#### 2.6 API 연동 및 상태 관리 (4일)
- [ ] **2.6.1** API Service 클래스 작성
  - `projectService.ts`
  - `taskService.ts`
  - `enablerService.ts`
  - `dependencyService.ts`
  - `calendarService.ts`
- [ ] **2.6.2** Custom Hooks 작성
  - `useProjects.ts` - 프로젝트 CRUD 훅
  - `useTasks.ts` - 태스크 CRUD 훅
  - `useEnablers.ts` - Enabler CRUD 훅
  - `useDependencies.ts` - 의존성 훅
- [ ] **2.6.3** React Context 구성 (또는 Zustand)
  - `ProjectContext.tsx` - 현재 프로젝트 상태
  - `ThemeContext.tsx` - 테마 설정

#### 2.7 테스트 작성 (3일)
- [ ] **2.7.1** 컴포넌트 테스트 (Jest + React Testing Library)
  - 주요 컴포넌트 렌더링 테스트
  - 사용자 인터랙션 테스트
  - 스냅샷 테스트
- [ ] **2.7.2** 통합 테스트
  - API 연동 테스트 (MSW 사용)
  - 라우팅 테스트

#### 완료 기준
- ✅ 프로젝트 및 태스크 CRUD 기능 정상 작동
- ✅ Enabler 관리 기능 정상 작동
- ✅ API 연동 완료
- ✅ 반응형 디자인 적용 (데스크톱, 태블릿)
- ✅ 테스트 커버리지 70% 이상

---

### Phase 3: 고급 기능 (간트 차트 및 의존성 시각화) (2-3주)
**기간**: 9-11주차
**목표**: 핵심 시각화 기능 구현
**상태**: 🔴 미시작

#### 3.1 간트 차트 구현 (5일)
- [ ] **3.1.1** Frappe Gantt 통합 (`GanttChart.tsx`)
  - 라이브러리 초기화
  - 데이터 변환 (API → Gantt 포맷)
  - 렌더링 최적화
- [ ] **3.1.2** 태스크 바 커스터마이징
  - 진행률 표시
  - 마일스톤 표시
  - 색상 코딩 (상태별, 우선순위별)
  - 크리티컬 패스 강조
- [ ] **3.1.3** Enabler 마커 오버레이
  - Gantt 차트 위에 Enabler 위치 표시
  - 툴팁으로 상세 정보 표시
  - 지연 시 경고 표시
- [ ] **3.1.4** 의존성 화살표
  - 태스크 간 의존성 선 그리기
  - 의존성 타입별 스타일 (FS, SS, FF, SF)
- [ ] **3.1.5** 인터랙티브 기능
  - 드래그로 태스크 일정 조정
  - 클릭으로 태스크 상세 보기
  - 줌 인/아웃
  - 타임라인 스크롤
- [ ] **3.1.6** 간트 차트 툴바
  - 뷰 모드 전환 (일, 주, 월)
  - 필터 (담당자, 상태, 우선순위)
  - 익스포트 (PNG, PDF)

#### 3.2 의존성 그래프 구현 (4일)
- [ ] **3.2.1** React-Flow 통합 (`DependencyGraph.tsx`)
  - 노드 및 엣지 데이터 변환
  - 자동 레이아웃 (dagre 또는 elk)
- [ ] **3.2.2** 커스텀 노드 디자인
  - 태스크 정보 표시 (이름, 기간, 진행률)
  - 상태별 색상 코딩
  - 크리티컬 패스 강조
- [ ] **3.2.3** 인터랙티브 기능
  - 노드 클릭으로 상세 정보
  - 의존성 추가/삭제
  - 영향 분석 하이라이트
  - 줌 및 팬
- [ ] **3.2.4** 의존성 매트릭스 뷰 (`DependencyMatrix.tsx`)
  - 테이블 형식으로 의존성 표시
  - 순환 의존성 경고

#### 3.3 캘린더 통합 (3일)
- [ ] **3.3.1** FullCalendar 통합 (`CalendarView.tsx`)
  - 월/주/일 뷰
  - 이벤트 데이터 로딩
- [ ] **3.3.2** 이벤트 표시
  - 태스크 시작/종료일
  - 마일스톤
  - Enabler 전달일
  - 사용자 정의 이벤트
- [ ] **3.3.3** 이벤트 상세 모달 (`EventModal.tsx`)
  - 이벤트 정보 표시
  - 연결된 태스크/Enabler로 이동
- [ ] **3.3.4** 캘린더 필터링
  - 프로젝트별
  - 이벤트 타입별
  - 담당자별

#### 3.4 리포트 기능 (3일)
- [ ] **3.4.1** 크리티컬 패스 리포트 (`CriticalPath.tsx`)
  - 크리티컬 태스크 목록
  - 여유 시간(Slack) 표시
  - 리스크 분석
- [ ] **3.4.2** 진행 현황 리포트 (`ProgressReport.tsx`)
  - 전체 진행률
  - 상태별 태스크 분포
  - 담당자별 작업량
  - 차트 시각화 (Recharts)
- [ ] **3.4.3** 지연 분석 리포트 (`DelayAnalysis.tsx`)
  - 지연된 태스크 목록
  - 지연 원인 분석
  - Enabler 지연 영향
- [ ] **3.4.4** 익스포트 기능 (`ExportDialog.tsx`)
  - CSV 익스포트
  - Excel 익스포트 (선택)
  - PDF 리포트 (선택)

#### 완료 기준
- ✅ 간트 차트 정상 렌더링 및 인터랙션 작동
- ✅ 의존성 그래프 정상 작동
- ✅ 캘린더 이벤트 표시 정상
- ✅ 크리티컬 패스 계산 정확도 검증
- ✅ 리포트 데이터 정확성 검증
- ✅ 성능 테스트 통과 (1000개 태스크)

---

### Phase 4: 통합 테스트 및 최적화 (1-2주)
**기간**: 12-13주차
**목표**: 시스템 안정화 및 성능 최적화
**상태**: 🔴 미시작

#### 4.1 통합 테스트 (3일)
- [ ] **4.1.1** 엔드투엔드 테스트 시나리오
  - 프로젝트 생성 → 태스크 추가 → 의존성 설정 → 간트 차트 확인
  - Enabler 추가 → 영향 분석 → 지연 시뮬레이션
  - 캘린더 이벤트 확인 → 리포트 생성 → 익스포트
- [ ] **4.1.2** 크로스 브라우저 테스트
  - Chrome, Edge, Firefox에서 동작 확인
- [ ] **4.1.3** 에러 시나리오 테스트
  - 네트워크 오류 처리
  - 잘못된 입력 처리
  - 빈 데이터 처리

#### 4.2 성능 최적화 (4일)
- [ ] **4.2.1** 프론트엔드 최적화
  - 코드 스플리팅 (React.lazy)
  - 메모이제이션 (useMemo, useCallback)
  - 가상 스크롤링 (react-window)
  - 이미지 최적화
- [ ] **4.2.2** 백엔드 최적화
  - 쿼리 최적화 (N+1 문제 해결)
  - 인덱스 추가
  - 캐싱 전략 (선택)
- [ ] **4.2.3** 번들 크기 최적화
  - Tree shaking
  - 불필요한 라이브러리 제거
  - 빌드 최적화
- [ ] **4.2.4** 성능 벤치마크
  - Lighthouse 스코어 90+ 달성
  - 첫 로딩 시간 < 2초
  - API 응답 시간 < 100ms

#### 4.3 버그 수정 및 리팩토링 (3일)
- [ ] **4.3.1** 발견된 버그 수정
  - 이슈 트래킹 및 우선순위 지정
  - 버그 수정 및 테스트
- [ ] **4.3.2** 코드 리팩토링
  - 중복 코드 제거
  - 함수 분리 및 모듈화
  - 네이밍 개선
- [ ] **4.3.3** 코드 리뷰 및 품질 개선
  - ESLint/Black 규칙 준수
  - 타입 안정성 강화
  - 주석 및 문서화

#### 4.4 보안 강화 (2일)
- [ ] **4.4.1** 입력 검증 강화
  - SQL Injection 방지
  - XSS 방지
  - CSRF 보호 (선택)
- [ ] **4.4.2** 데이터 보호
  - SQLite DB 파일 권한 설정
  - 민감 정보 암호화 (선택)
- [ ] **4.4.3** 보안 스캔
  - 의존성 취약점 점검 (npm audit, safety)
  - OWASP Top 10 점검

#### 완료 기준
- ✅ 모든 E2E 테스트 통과
- ✅ Lighthouse 스코어 90 이상
- ✅ 성능 벤치마크 목표 달성
- ✅ 보안 취약점 0건
- ✅ 코드 커버리지 80% 이상

---

### Phase 5: 배포 패키지 및 문서화 (1-2주)
**기간**: 14-15주차
**목표**: 폐쇄망 배포 준비 및 사용자 문서 작성
**상태**: 🔴 미시작

#### 5.1 폐쇄망 배포 패키지 준비 (4일)
- [ ] **5.1.1** Python 패키지 수집
  - `pip download -r requirements.txt -d deployment/packages/python-wheels`
  - 모든 의존성 wheel 파일 수집
- [ ] **5.1.2** Node.js 패키지 수집
  - `npm pack` 또는 `npm-offline-packager` 사용
  - 프론트엔드 빌드 파일 생성 (`npm run build`)
- [ ] **5.1.3** 데이터베이스 초기화 스크립트
  - `deployment/database/init.sql` 작성
  - 샘플 데이터 SQL 작성
- [ ] **5.1.4** 설치 스크립트 작성
  - **Windows**: `deployment/windows/install.bat`
    - Python/Node.js 설치 확인
    - 의존성 설치
    - 데이터베이스 초기화
    - 환경 변수 설정
  - **Linux**: `deployment/linux/install.sh`
    - 동일한 작업 수행
- [ ] **5.1.5** 실행 스크립트 작성
  - **Windows**: `start.bat` (백엔드 + 프론트엔드 동시 실행)
  - **Linux**: `start.sh`
- [ ] **5.1.6** 제거 스크립트 작성
  - **Windows**: `uninstall.bat`
  - **Linux**: `uninstall.sh`

#### 5.2 PyInstaller 실행 파일 생성 (선택) (2일)
- [ ] **5.2.1** PyInstaller 설정
  - `backend.spec` 파일 작성
  - 의존성 포함 설정
- [ ] **5.2.2** 실행 파일 빌드
  - Windows용 `.exe` 생성
  - Linux용 바이너리 생성
- [ ] **5.2.3** 테스트
  - 깨끗한 환경에서 실행 테스트

#### 5.3 문서 작성 (4일)
- [ ] **5.3.1** 설치 가이드 (`docs/installation-guide.md`)
  - 시스템 요구사항
  - 설치 단계 (스크린샷 포함)
  - 초기 설정
  - 문제 해결
- [ ] **5.3.2** 사용자 매뉴얼 (`docs/user-manual.md`)
  - 기능별 사용 방법
  - 화면 설명 (스크린샷)
  - 워크플로우 예시
  - FAQ
- [ ] **5.3.3** API 문서 (`docs/api-documentation.md`)
  - 엔드포인트 목록
  - 요청/응답 예시
  - 에러 코드
- [ ] **5.3.4** 아키텍처 문서 (`docs/architecture.md`)
  - 시스템 구조 다이어그램
  - 기술 스택 설명
  - 데이터베이스 스키마
- [ ] **5.3.5** 개발 가이드 (`docs/development-guide.md`)
  - 개발 환경 설정
  - 빌드 및 테스트 방법
  - 기여 가이드
- [ ] **5.3.6** README.md (최상단)
  - 프로젝트 소개
  - 빠른 시작 가이드
  - 라이선스 정보

#### 5.4 최종 검증 및 릴리스 (2일)
- [ ] **5.4.1** 폐쇄망 환경 시뮬레이션
  - 인터넷 연결 없이 설치 테스트
  - 모든 기능 정상 작동 확인
- [ ] **5.4.2** 체크리스트 검증
  - 모든 문서 완성도 확인
  - 모든 스크립트 동작 확인
  - 샘플 데이터 정상 로드 확인
- [ ] **5.4.3** 릴리스 노트 작성
  - 버전 1.0.0 릴리스 노트
  - 알려진 제한사항 명시
- [ ] **5.4.4** 배포 패키지 압축
  - 최종 배포 ZIP 파일 생성
  - 체크섬 생성

#### 완료 기준
- ✅ 폐쇄망 환경에서 설치 및 실행 성공
- ✅ 모든 문서 완성
- ✅ 설치 가이드에 따라 비개발자도 설치 가능
- ✅ 배포 패키지 크기 < 500MB
- ✅ 라이선스 파일 포함 및 오픈소스 준수

---

## 7. 품질 관리

### 7.1 코드 품질 기준

#### 백엔드
- **Type Hints**: 모든 함수에 타입 힌트 적용
- **Docstring**: 모든 공개 함수/클래스에 문서 작성
- **코드 스타일**: Black + isort 적용
- **복잡도**: Cyclomatic Complexity < 10
- **테스트 커버리지**: ≥ 80%

#### 프론트엔드
- **TypeScript**: `strict` 모드 활성화
- **ESLint**: Airbnb 스타일 가이드 기반
- **Prettier**: 일관된 코드 포맷팅
- **컴포넌트 크기**: < 300 LOC (권장)
- **테스트 커버리지**: ≥ 70%

### 7.2 코드 리뷰 프로세스
1. **자가 리뷰**: 커밋 전 체크리스트 확인
2. **자동 검증**: Git hooks (husky + lint-staged)
3. **정기 리뷰**: 주요 기능 완료 시 전체 리뷰

### 7.3 지속적 통합 (CI) - 선택사항
- GitHub Actions 또는 GitLab CI 설정
- 자동 테스트 실행
- 코드 품질 검사

---

## 8. 테스트 전략

### 8.1 테스트 피라미드

```
       /\
      /  \  E2E (10%)
     /----\
    / UI   \ Integration (20%)
   /--------\
  /   Unit   \ Unit Tests (70%)
 /____________\
```

### 8.2 백엔드 테스트

#### 단위 테스트 (70%)
- **대상**: 서비스 로직, 유틸리티 함수, 알고리즘
- **도구**: pytest, pytest-cov
- **예시**:
  - `test_critical_path.py` - CPM 알고리즘 정확도
  - `test_dependency_analyzer.py` - 의존성 분석 로직
  - `test_date_utils.py` - 날짜 계산 함수

#### 통합 테스트 (20%)
- **대상**: API 엔드포인트, 데이터베이스 연동
- **도구**: pytest + TestClient (FastAPI)
- **예시**:
  - `test_projects_api.py` - CRUD 작동 확인
  - `test_dependencies_validation.py` - 순환 의존성 검증

#### E2E 테스트 (10%)
- **대상**: 전체 워크플로우
- **도구**: Playwright (선택)
- **예시**:
  - 프로젝트 생성 → 태스크 추가 → 간트 차트 확인

### 8.3 프론트엔드 테스트

#### 단위 테스트 (70%)
- **대상**: 컴포넌트, 훅, 유틸리티
- **도구**: Jest, React Testing Library
- **예시**:
  - `TaskList.test.tsx` - 렌더링 및 이벤트 테스트
  - `useProjects.test.ts` - 커스텀 훅 테스트

#### 통합 테스트 (20%)
- **대상**: API 연동, 라우팅
- **도구**: MSW (Mock Service Worker)
- **예시**:
  - API 호출 → 데이터 렌더링 확인

#### E2E 테스트 (10%)
- **대상**: 사용자 시나리오
- **도구**: Playwright 또는 Cypress
- **예시**:
  - 로그인 → 프로젝트 생성 → 간트 차트 확인

### 8.4 성능 테스트
- **부하 테스트**: Locust 또는 k6 (선택)
- **프론트엔드 성능**: Lighthouse CI
- **목표**:
  - 1000개 태스크 처리 가능
  - API 응답 시간 < 100ms
  - 첫 로딩 시간 < 2초

---

## 9. 배포 전략

### 9.1 배포 아키텍처

#### 단일 서버 배포 (권장)
```
[사용자 PC/서버]
├── FastAPI Backend (Port 8000)
├── React Frontend (Static Files)
└── SQLite Database (File)
```

#### Docker 배포 (선택)
```
docker-compose up
├── backend 컨테이너 (Port 8000)
├── frontend 컨테이너 (Port 80)
└── 공유 볼륨 (SQLite DB)
```

### 9.2 배포 패키지 구조

```
project-manager-v1.0.0.zip
├── README.md
├── LICENSE
├── backend/
│   ├── app/ (소스 코드)
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   └── dist/ (빌드된 정적 파일)
├── deployment/
│   ├── windows/
│   │   ├── install.bat
│   │   ├── start.bat
│   │   └── uninstall.bat
│   ├── linux/
│   │   ├── install.sh
│   │   ├── start.sh
│   │   └── uninstall.sh
│   └── packages/
│       ├── python-wheels/ (pip 패키지들)
│       └── node-modules-cache/ (npm 패키지들)
├── data/ (빈 폴더 - 런타임 생성)
├── logs/ (빈 폴더 - 런타임 생성)
└── docs/
    ├── installation-guide.md
    ├── user-manual.md
    └── troubleshooting.md
```

### 9.3 설치 프로세스

#### Windows
```batch
1. 압축 해제
2. install.bat 실행 (관리자 권한)
   - Python/Node.js 설치 확인
   - 의존성 설치
   - DB 초기화
3. start.bat 실행
4. 브라우저에서 http://localhost:8000 접속
```

#### Linux
```bash
1. 압축 해제
2. chmod +x deployment/linux/*.sh
3. sudo ./deployment/linux/install.sh
4. ./deployment/linux/start.sh
5. 브라우저에서 http://localhost:8000 접속
```

### 9.4 업데이트 전략
- 마이너 버전 업데이트: 데이터베이스 마이그레이션 스크립트 제공
- 메이저 버전 업데이트: 데이터 백업 후 재설치

---

## 10. 위험 관리

### 10.1 기술적 위험

| 위험 | 확률 | 영향 | 대응 전략 |
|------|------|------|-----------|
| Frappe Gantt 성능 이슈 (1000+ 태스크) | 중 | 고 | 가상 스크롤링, 페이지네이션, 대체 라이브러리 검토 |
| SQLite 동시성 제한 | 낮 | 중 | WAL 모드 활성화, 쓰기 작업 큐잉 |
| 크리티컬 패스 알고리즘 복잡도 | 중 | 중 | 최적화, 캐싱, 비동기 처리 |
| 폐쇄망 환경 패키지 누락 | 중 | 고 | 철저한 테스트, 체크리스트 작성 |
| 브라우저 호환성 이슈 | 낮 | 중 | 크로스 브라우저 테스트, Polyfill 사용 |

### 10.2 일정 위험

| 위험 | 확률 | 영향 | 대응 전략 |
|------|------|------|-----------|
| Phase 1 지연 (백엔드) | 중 | 고 | 핵심 기능 우선, 선택 기능 연기 |
| Phase 3 복잡도 과소평가 | 높 | 중 | 간트 차트 단순화, MVP 먼저 구현 |
| 테스트 작성 시간 부족 | 중 | 고 | TDD 접근, 핵심 기능 우선 테스트 |
| 문서화 지연 | 중 | 중 | 개발과 병행하여 문서 작성 |

### 10.3 품질 위험

| 위험 | 확률 | 영향 | 대응 전략 |
|------|------|------|-----------|
| 테스트 커버리지 미달 | 중 | 고 | 자동화된 커버리지 체크, CI 통합 |
| 성능 목표 미달성 | 중 | 중 | 조기 성능 테스트, 프로파일링 |
| 보안 취약점 발견 | 낮 | 고 | 보안 스캔 도구 사용, 베스트 프랙티스 준수 |

---

## 11. 개발 진행 상황 추적

### 11.1 진행 상황 업데이트 규칙

이 개발 계획서는 **프로젝트의 실시간 진행 상황을 반영**합니다.

#### 업데이트 규칙
1. **Phase 상태 변경**
   - 🔴 미시작 → 🟡 진행 중 → 🟢 완료
   - Phase 시작/완료 시 상태와 날짜 업데이트

2. **작업 항목 체크**
   - 작업 완료 시 `[ ]` → `[x]` 체크
   - 완료 날짜 기록

3. **Git Commit 규칙**
   - 작업 항목 완료 시마다 커밋
   - 커밋 메시지 형식: `[Phase N] 작업 항목 설명`
   - 예: `[Phase 1] 1.1.1 SQLAlchemy 모델 정의 완료`

4. **주간 업데이트**
   - 매주 금요일 개발 계획서 업데이트 및 커밋
   - 다음 주 계획 정리

### 11.2 진행 상황 지표

#### Phase별 진행률
- **Phase 0**: 🟢 100% (5/5 완료, 1개 건너뛰기)
- **Phase 1**: 🟡 35% (7/20 완료)
- **Phase 2**: 🔴 0% (0/30 완료)
- **Phase 3**: 🔴 0% (0/25 완료)
- **Phase 4**: 🔴 0% (0/15 완료)
- **Phase 5**: 🔴 0% (0/20 완료)

**전체 진행률**: 🟡 10% (12/115 작업 항목 완료, 1개 건너뛰기)

### 11.3 마일스톤 추적

| 마일스톤 | 목표 날짜 | 실제 날짜 | 상태 |
|---------|----------|----------|------|
| M1: 백엔드 API 기본 구조 | 2주차 | - | 🔴 미시작 |
| M2: 데이터베이스 및 CRUD | 4주차 | - | 🔴 미시작 |
| M3: 프론트엔드 기본 UI | 7주차 | - | 🔴 미시작 |
| M4: 간트 차트 및 캘린더 | 10주차 | - | 🔴 미시작 |
| M5: 의존성 분석 및 크리티컬 패스 | 12주차 | - | 🔴 미시작 |
| M6: 배포 패키지 및 문서 | 15주차 | - | 🔴 미시작 |

### 11.4 주간 진행 기록

#### 1주차 (2025-10-30 ~ 2025-11-05)
- **계획**: Phase 0 완료
- **실제**:
  - 개발 계획서 작성 완료 (DEVELOPMENT_PLAN.md, README.md, GETTING_STARTED.md)
  - **Phase 0 완료**: 작업 0.1 ~ 0.5 완료 ✅
    - 0.1: Git 저장소 초기화 및 .gitignore 설정 완료
    - 0.2: 백엔드 Python 가상환경 설정 완료 (Python 3.10.12, FastAPI, SQLAlchemy 등)
    - 0.3: 프론트엔드 프로젝트 초기화 완료 (Node.js 20, React 19, Vite, MUI 7 등)
    - 0.4: 프로젝트 디렉토리 구조 생성 완료 (백엔드/프론트엔드/배포 구조 57개 디렉토리)
    - 0.5: 코드 품질 도구 설정 완료 (Black, Prettier, ESLint, mypy, flake8)
    - 0.6: Docker 설정 건너뛰기 (선택사항, 로컬 환경 구축 완료)
  - **Phase 1 시작**: 백엔드 핵심 기능 개발
    - 1.1.1: SQLAlchemy 모델 정의 완료 (Project, Task, Enabler, Dependency, EnablerImpact, CalendarEvent)
    - 1.1.2: Alembic 마이그레이션 설정 완료 (초기 마이그레이션, 6개 테이블 생성, 29개 인덱스)
    - 1.1.3: 데이터베이스 초기화 스크립트 완료 (init_db.py, create_sample_data.py)
    - 1.2.1: Pydantic Request/Response 스키마 작성 완료 (6개 모델, 18개 스키마 클래스)
    - 1.2.2: 데이터 검증 로직 구현 완료 (날짜, 진행률, Enum, 관계 필드 검증)
    - 1.3.1: Projects CRUD API 구현 완료 (5개 엔드포인트, 4개 파일 생성)
    - 1.3.2: Tasks CRUD API 구현 완료 (5개 엔드포인트, 프로젝트 관계 검증)
- **진행률**: Phase 0 100% (5/5), Phase 1 35% (7/20), 전체 10% (12/115)
- **이슈**:
  - WSL2 환경에서 npm/pip 설치 시 일부 지연 발생, 재시도로 해결
  - Alembic 초기화 시 data 디렉토리 미생성 오류 → 디렉토리 생성 후 해결
  - API 파일 생성 시 일부 인코딩 오류 → UTF-8 재작성으로 해결
- **다음 작업**: Phase 1.3.3 (Enablers CRUD API 구현)

---

## 12. 부록

### 12.1 참고 자료
- FastAPI 공식 문서: https://fastapi.tiangolo.com/
- React 공식 문서: https://react.dev/
- Material-UI 문서: https://mui.com/
- Frappe Gantt: https://frappe.io/gantt
- FullCalendar: https://fullcalendar.io/
- React-Flow: https://reactflow.dev/

### 12.2 관련 문서
- [프로젝트 구조](./docs/01_Idea/project-manager/PROJECT_STRUCTURE.md)
- [데이터베이스 스키마](./docs/01_Idea/project-manager/docs/database-schema.md)
- [시스템 아키텍처](./docs/01_Idea/project-manager/docs/architecture.md)

### 12.3 용어 정리
- **CPM**: Critical Path Method - 크리티컬 패스 분석 방법
- **Enabler**: 프로젝트 수행에 필요한 핵심 자원/문서/장비
- **Dependency**: 태스크 간 의존성 관계
  - **FS (Finish-Start)**: A가 끝나야 B가 시작
  - **SS (Start-Start)**: A가 시작하면 B도 시작
  - **FF (Finish-Finish)**: A가 끝나면 B도 끝남
  - **SF (Start-Finish)**: A가 시작하면 B가 끝남
- **Slack**: 태스크의 여유 시간 (LS - ES)
- **Milestone**: 프로젝트의 주요 체크포인트

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0.0 | 2025-10-30 | 초기 개발 계획서 작성 | Claude Code |

---

**문서 끝**
