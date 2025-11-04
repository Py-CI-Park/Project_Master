# 폐쇄망 프로젝트 관리 시스템 v2.0 개발 계획서

> **프로젝트명**: Closed Network Project Manager v2.0
> **버전**: 2.0.0
> **작성일**: 2025-11-04
> **최종 업데이트**: 2025-11-04
> **개발 상태**: 🔴 계획 단계 (v2.0 개발 준비)
> **기반 버전**: v1.0.0 (2025-11-04 릴리스)

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [v1.0에서 v2.0으로의 주요 변경사항](#2-v10에서-v20으로의-주요-변경사항)
3. [기술 스택 변경 및 추가](#3-기술-스택-변경-및-추가)
4. [시스템 아키텍처 개선](#4-시스템-아키텍처-개선)
5. [데이터베이스 설계 변경](#5-데이터베이스-설계-변경)
6. [개발 단계 및 일정](#6-개발-단계-및-일정)
7. [상세 개발 계획](#7-상세-개발-계획)
8. [품질 관리](#8-품질-관리)
9. [테스트 전략](#9-테스트-전략)
10. [배포 전략](#10-배포-전략)
11. [마이그레이션 전략](#11-마이그레이션-전략)
12. [개발 진행 상황 추적](#12-개발-진행-상황-추적)

---

## 1. 프로젝트 개요

### 1.1 v2.0 프로젝트 목적
v1.0의 성공적인 릴리스를 기반으로, **엔터프라이즈급 기능**과 **협업 기능**을 추가하여 다중 사용자 환경에서 사용 가능한 프로젝트 관리 시스템으로 발전

### 1.2 v2.0 핵심 신규 기능
- 🔐 **인증 및 권한 관리**: JWT 기반 인증, 역할 기반 접근 제어 (RBAC)
- 👥 **다중 사용자 지원**: 사용자 계정 관리, 팀 협업 기능
- 📊 **간트 차트 개선**: 향상된 시각화, 리소스 할당, 마일스톤 추적
- 📅 **캘린더 확장**: 이벤트 알림, 반복 일정, 외부 캘린더 통합
- 🔗 **의존성 관리 UI 개선**: 직관적인 드래그 앤 드롭, 순환 의존성 감지
- ⚡ **실시간 크리티컬 패스**: WebSocket 기반 실시간 업데이트
- 📎 **파일 첨부**: 태스크/프로젝트에 파일 첨부, 버전 관리
- 💬 **실시간 협업**: WebSocket 기반 실시간 알림, 채팅, 활동 피드
- 🌐 **다국어 지원**: 한국어, 영어 지원 (i18n)
- 📱 **모바일 반응형**: 태블릿, 모바일 최적화 UI

### 1.3 v2.0 비기능 요구사항
- **성능**: 10,000개 이상의 태스크 처리 가능 (10배 향상)
- **동시 접속**: 100명 이상의 동시 사용자 지원
- **응답성**: 모든 UI 작업 50ms 이내 응답 (2배 개선)
- **안정성**: 99.9% 이상의 업타임
- **보안**:
  - JWT 토큰 기반 인증
  - bcrypt 비밀번호 해싱
  - HTTPS 지원
  - Rate Limiting
  - CSRF 보호
- **확장성**:
  - PostgreSQL 지원 (SQLite → 선택적 PostgreSQL)
  - Redis 캐싱
  - 수평 확장 가능한 아키텍처
- **호환성**: v1.0 데이터베이스에서 자동 마이그레이션

### 1.4 프로젝트 범위

**v2.0 포함 사항**:
- 사용자 인증 및 권한 관리 시스템
- 다중 사용자 협업 기능
- 실시간 통신 (WebSocket)
- 파일 저장소 시스템
- 알림 시스템
- 다국어 지원 (i18n)
- 모바일 반응형 UI
- v1.0 → v2.0 자동 마이그레이션 도구

**v2.0 제외 사항 (v3.0 이후 고려)**:
- 클라우드 동기화
- 네이티브 모바일 앱
- AI 기반 일정 추천
- 외부 시스템 통합 (Jira, Slack 등)

---

## 2. v1.0에서 v2.0으로의 주요 변경사항

### 2.1 아키텍처 변경

#### 기존 (v1.0)
```
[React SPA] <--HTTP--> [FastAPI] <--> [SQLite]
```

#### 변경 (v2.0)
```
[React SPA] <--HTTP/WS--> [FastAPI] <--> [PostgreSQL/SQLite]
                              |
                              +----> [Redis Cache]
                              |
                              +----> [File Storage]
```

### 2.2 주요 기능 비교

| 기능 | v1.0 | v2.0 |
|------|------|------|
| 사용자 인증 | ❌ 없음 | ✅ JWT + RBAC |
| 다중 사용자 | ❌ 단일 사용자 | ✅ 다중 사용자 |
| 실시간 업데이트 | ❌ 폴링 | ✅ WebSocket |
| 파일 첨부 | ❌ 없음 | ✅ 파일 업로드 |
| 알림 | ❌ 없음 | ✅ 실시간 알림 |
| 다국어 | ❌ 한국어만 | ✅ 한/영 |
| 모바일 지원 | ⚠️ 부분 지원 | ✅ 완전 반응형 |
| 데이터베이스 | SQLite | SQLite/PostgreSQL |
| 캐싱 | ❌ 없음 | ✅ Redis |
| 성능 | 1K 태스크 | 10K 태스크 |
| 동시 접속 | ~10명 | ~100명 |

---

## 3. 기술 스택 변경 및 추가

### 3.1 Frontend 추가 기술

| 기술 | 버전 | 라이선스 | 용도 | 상태 |
|------|------|----------|------|------|
| **신규** react-i18next | 13.0+ | MIT | 다국어 지원 | 추가 |
| **신규** socket.io-client | 4.6+ | MIT | WebSocket 클라이언트 | 추가 |
| **신규** react-dropzone | 14.0+ | MIT | 파일 업로드 | 추가 |
| **신규** react-query | 5.0+ | MIT | 서버 상태 관리 | 추가 |
| **신규** react-hook-form | 7.0+ | MIT | 폼 관리 | 추가 |
| **기존** React | 18.2+ | MIT | UI 프레임워크 | 유지 |
| **기존** Material-UI | 6.0+ | MIT | UI 컴포넌트 | 유지 |
| **기존** Vite | 5.0+ | MIT | 빌드 도구 | 유지 |

### 3.2 Backend 추가 기술

| 기술 | 버전 | 라이선스 | 용도 | 상태 |
|------|------|----------|------|------|
| **신규** python-jose | 3.3+ | MIT | JWT 토큰 | 추가 |
| **신규** passlib[bcrypt] | 1.7+ | BSD | 비밀번호 해싱 | 추가 |
| **신규** python-socketio | 5.10+ | MIT | WebSocket 서버 | 추가 |
| **신규** redis | 5.0+ | MIT | 캐싱 | 추가 |
| **신규** aiofiles | 23.0+ | Apache 2.0 | 비동기 파일 처리 | 추가 |
| **신규** Pillow | 10.0+ | PIL | 이미지 처리 | 추가 |
| **신규** psycopg2-binary | 2.9+ | LGPL | PostgreSQL 드라이버 | 추가 (선택) |
| **기존** FastAPI | 0.109+ | MIT | 웹 프레임워크 | 유지 |
| **기존** SQLAlchemy | 2.0+ | MIT | ORM | 유지 |
| **기존** SQLite | 3.4+ | Public Domain | 데이터베이스 | 유지 (기본) |

### 3.3 인프라 추가

| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **신규** Redis | 7.0+ | 캐싱, 세션 저장소 | 추가 |
| **신규** PostgreSQL | 15.0+ | 데이터베이스 (선택) | 추가 (선택) |
| **신규** Nginx | 1.24+ | 리버스 프록시 (선택) | 추가 (선택) |

---

## 4. 시스템 아키텍처 개선

### 4.1 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  React 18 SPA                                               │
│  ├─ HTTP Client (Axios)                                     │
│  ├─ WebSocket Client (Socket.IO)                            │
│  ├─ State Management (Zustand + React Query)                │
│  └─ i18n (react-i18next)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP / WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
├─────────────────────────────────────────────────────────────┤
│  FastAPI + python-socketio                                  │
│  ├─ REST API Endpoints                                      │
│  ├─ WebSocket Handlers                                      │
│  ├─ Authentication Middleware (JWT)                         │
│  ├─ Rate Limiting                                           │
│  └─ CORS Configuration                                      │
└─────────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
┌──────────▼──────┐ ┌───────▼──────┐ ┌──────▼──────┐
│  Business Logic │ │ Real-time    │ │ File        │
│  Layer          │ │ Service      │ │ Storage     │
│  ├─ Auth       │ │ ├─ Socket.IO│ │ ├─ Upload   │
│  ├─ Projects   │ │ ├─ Events   │ │ ├─ Download │
│  ├─ Tasks      │ │ └─ Notify   │ │ └─ Versions │
│  ├─ Enablers   │ │              │ │             │
│  └─ Reports    │ │              │ │             │
└──────────┬──────┘ └──────────────┘ └─────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  SQLAlchemy 2.0 ORM                                         │
│  ├─ Repository Pattern                                      │
│  ├─ Unit of Work Pattern                                    │
│  └─ Query Optimization                                      │
└─────────────────────────────────────────────────────────────┘
           │
┌──────────┼──────────┬───────────────┐
│          │          │               │
▼          ▼          ▼               ▼
┌────────┐ ┌────────┐ ┌────────────┐ ┌──────────┐
│SQLite/ │ │ Redis  │ │ File       │ │ Temp     │
│Postgres│ │ Cache  │ │ Storage    │ │ Storage  │
└────────┘ └────────┘ └────────────┘ └──────────┘
```

### 4.2 인증 흐름

```
┌──────┐                ┌──────────┐              ┌──────────┐
│Client│                │  FastAPI │              │PostgreSQL│
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │ POST /api/v1/auth/login │                         │
   ├────────────────────────>│                         │
   │  {username, password}   │                         │
   │                         │ SELECT user             │
   │                         ├────────────────────────>│
   │                         │                         │
   │                         │<────────────────────────┤
   │                         │ user data               │
   │                         │                         │
   │                         │ verify password (bcrypt)│
   │                         │                         │
   │<────────────────────────┤                         │
   │ {access_token, refresh} │                         │
   │                         │                         │
   │ GET /api/v1/projects    │                         │
   ├────────────────────────>│                         │
   │ Header: Bearer <token>  │                         │
   │                         │ verify JWT              │
   │                         │                         │
   │                         │ check permissions       │
   │                         │                         │
   │                         │ SELECT projects         │
   │                         ├────────────────────────>│
   │                         │                         │
   │<────────────────────────┤<────────────────────────┤
   │ projects data           │                         │
```

### 4.3 실시간 통신 흐름

```
User A                    Server                    User B
  │                         │                         │
  │ WebSocket Connect       │                         │
  ├────────────────────────>│                         │
  │                         │<────────────────────────┤
  │                         │ WebSocket Connect       │
  │                         │                         │
  │ Update Task #123        │                         │
  ├────────────────────────>│                         │
  │                         │ Save to DB              │
  │                         │                         │
  │                         │ Emit: task_updated      │
  │<────────────────────────┼────────────────────────>│
  │ Receive update          │          Receive update │
  │                         │                         │
```

---

## 5. 데이터베이스 설계 변경

### 5.1 신규 테이블

#### users (사용자)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    avatar_url VARCHAR(255)
);
```

#### roles (역할)
```sql
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_roles (사용자-역할 연결)
```sql
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    project_id INTEGER,  -- NULL이면 전역 역할
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id, project_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

#### attachments (첨부파일)
```sql
CREATE TABLE attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entity_type VARCHAR(50) NOT NULL,  -- 'project', 'task', 'enabler'
    entity_id INTEGER NOT NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### notifications (알림)
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL,  -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### activity_logs (활동 로그)
```sql
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,  -- 'create', 'update', 'delete'
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    old_data JSON,
    new_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 5.2 기존 테이블 변경

#### projects (변경)
```sql
-- 추가 컬럼
ALTER TABLE projects ADD COLUMN created_by INTEGER REFERENCES users(id);
ALTER TABLE projects ADD COLUMN owner_id INTEGER REFERENCES users(id);
ALTER TABLE projects ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN archived_at TIMESTAMP;
```

#### tasks (변경)
```sql
-- 추가 컬럼
ALTER TABLE tasks ADD COLUMN assigned_to INTEGER REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN created_by INTEGER REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN estimated_hours DECIMAL(10, 2);
ALTER TABLE tasks ADD COLUMN actual_hours DECIMAL(10, 2);
```

#### enablers (변경)
```sql
-- 추가 컬럼
ALTER TABLE enablers ADD COLUMN owner_id INTEGER REFERENCES users(id);
ALTER TABLE enablers ADD COLUMN created_by INTEGER REFERENCES users(id);
```

### 5.3 ERD 다이어그램 (주요 관계)

```
users (1) ──< (N) projects (created_by)
users (1) ──< (N) projects (owner_id)
users (1) ──< (N) tasks (assigned_to)
users (1) ──< (N) tasks (created_by)
users (1) ──< (N) attachments (uploaded_by)
users (1) ──< (N) notifications (user_id)
users (N) ──< (N) roles (user_roles)
```

---

## 6. 개발 단계 및 일정

### 6.1 전체 일정 개요

```
Phase 6: 인증 시스템            [2주] ████████████████████████ (완료)
Phase 7: 사용자 관리            [2주] ████████████████████████ (완료)
Phase 8: 권한 관리              [1주] ░░░░░░░░░░░░░░░░████░░░░
Phase 9: 파일 시스템            [2주] ░░░░░░░░░░░░░░░░░░░░████
Phase 10: 실시간 통신           [2주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 11: 알림 시스템           [1주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 12: 다국어 지원           [1주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 13: UI/UX 개선            [2주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 14: 성능 최적화           [1주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 15: 테스트 및 문서화      [2주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 16: 마이그레이션 도구     [1주] ░░░░░░░░░░░░░░░░░░░░░░░░
Phase 17: 최종 검증 및 릴리스   [1주] ░░░░░░░░░░░░░░░░░░░░░░░░
─────────────────────────────────────────────────────────────
총 개발 기간: 18주 (약 4.5개월)
```

### 6.2 Phase별 상세 일정

| Phase | 기간 | 우선순위 | 의존성 | 목표 |
|-------|------|----------|--------|------|
| Phase 6: 인증 시스템 | 2주 | 최고 | 없음 | JWT 인증 구현 |
| Phase 7: 사용자 관리 | 2주 | 최고 | Phase 6 | 사용자 CRUD |
| Phase 8: 권한 관리 | 1주 | 높음 | Phase 7 | RBAC 구현 |
| Phase 9: 파일 시스템 | 2주 | 높음 | Phase 7 | 파일 업로드/다운로드 |
| Phase 10: 실시간 통신 | 2주 | 높음 | Phase 7 | WebSocket 구현 |
| Phase 11: 알림 시스템 | 1주 | 중간 | Phase 10 | 실시간 알림 |
| Phase 12: 다국어 지원 | 1주 | 중간 | 없음 | i18n 구현 |
| Phase 13: UI/UX 개선 | 2주 | 중간 | Phase 12 | 모바일 반응형 |
| Phase 14: 성능 최적화 | 1주 | 높음 | Phase 1-13 | 캐싱, 인덱싱 |
| Phase 15: 테스트 및 문서화 | 2주 | 최고 | Phase 1-14 | 품질 보증 |
| Phase 16: 마이그레이션 도구 | 1주 | 최고 | Phase 15 | v1 → v2 |
| Phase 17: 최종 검증 및 릴리스 | 1주 | 최고 | Phase 16 | 배포 준비 |

---

## 7. 상세 개발 계획

### Phase 6: 인증 시스템 (2주)

**상태**: 🟢 완료
**시작일**: 2025-11-04
**완료일**: 2025-11-04

#### 6.1 백엔드 인증 구현

**목표**: JWT 기반 인증 시스템 구축

**작업 항목**:
- [x] **6.1.1** JWT 토큰 생성 및 검증 (`backend/app/core/security.py`)
  - JWT 토큰 생성 함수
  - 토큰 검증 및 디코딩
  - 리프레시 토큰 구현

- [x] **6.1.2** 비밀번호 해싱 (`backend/app/core/security.py`)
  - bcrypt를 이용한 해싱
  - 비밀번호 검증 함수

- [x] **6.1.3** 인증 미들웨어 (`backend/app/api/deps.py`)
  - JWT 토큰 검증 미들웨어
  - 현재 사용자 추출 함수
  - 옵셔널 인증 (공개 API용)

- [x] **6.1.4** 인증 API 엔드포인트 (`backend/app/api/v1/endpoints/auth.py`)
  - `POST /api/v1/auth/register` - 사용자 등록
  - `POST /api/v1/auth/login` - 로그인
  - `POST /api/v1/auth/refresh` - 토큰 갱신
  - `POST /api/v1/auth/logout` - 로그아웃
  - `GET /api/v1/auth/me` - 현재 사용자 정보

- [x] **6.1.5** 데이터베이스 마이그레이션
  - User 모델을 alembic/env.py에 임포트
  - User 테이블 마이그레이션 생성 (alembic revision)
  - 마이그레이션 적용 (alembic upgrade head)
  - users 테이블 생성 완료 (id, username, email, hashed_password, full_name, is_active, is_superuser, created_at, updated_at, last_login, avatar_url)

**Pydantic 스키마** (`backend/app/schemas/auth.py`):
```python
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None
```

**테스트**:
- [ ] 단위 테스트: 토큰 생성/검증
- [ ] 단위 테스트: 비밀번호 해싱
- [ ] 통합 테스트: 로그인/로그아웃 플로우
- [ ] 보안 테스트: JWT 취약점 검사

**추정 시간**: 5일

#### 6.2 프론트엔드 인증 UI

**목표**: 로그인/회원가입 UI 구현

**작업 항목**:
- [x] **6.2.1** 로그인 페이지 (`frontend/src/pages/Auth/Login.tsx`)
  - 로그인 폼 (username, password)
  - 에러 처리
  - OAuth2 Password Flow
  - Material-UI 컴포넌트 사용

- [x] **6.2.2** 회원가입 페이지 (`frontend/src/pages/Auth/Register.tsx`)
  - 회원가입 폼 (username, email, password, full_name)
  - 비밀번호 강도 표시 (실시간 계산 및 시각화)
  - 폼 유효성 검증 (이메일 형식, 비밀번호 길이, 비밀번호 확인)
  - 성공 시 자동 리다이렉트

- [x] **6.2.3** 인증 상태 관리 (`frontend/src/stores/authStore.ts`)
  - Zustand 스토어 구현
  - persist 미들웨어로 localStorage 연동
  - 로그인/로그아웃 함수
  - 토큰 저장 (accessToken, refreshToken)
  - 사용자 정보 관리

- [x] **6.2.4** Protected Routes (`frontend/src/components/ProtectedRoute.tsx`)
  - 인증 필요 페이지 보호
  - 미인증 시 로그인 페이지로 리다이렉트
  - 원래 요청 페이지 정보 보존 (location state)

- [x] **6.2.5** Axios 인터셉터 (`frontend/src/api/axios.ts`)
  - 자동 Bearer 토큰 첨부 (Request Interceptor)
  - 401 에러 시 자동 토큰 갱신 (Response Interceptor)
  - 토큰 갱신 중 요청 큐 관리 (동시 요청 처리)
  - 갱신 실패 시 자동 로그아웃
  - 10초 타임아웃 설정

- [x] **6.2.6** 라우팅 설정 (`frontend/src/routes/index.tsx`)
  - 로그인/회원가입 페이지 라우트 추가
  - 기존 라우트에 ProtectedRoute 적용
  - Lazy loading 및 Suspense 적용

**테스트**:
- [ ] E2E 테스트: 로그인/로그아웃
- [ ] E2E 테스트: 회원가입
- [ ] E2E 테스트: Protected Routes
- [ ] E2E 테스트: 자동 토큰 갱신

**추정 시간**: 5일
**실제 소요 시간**: 4시간

---

### Phase 7: 사용자 관리 (2주)

**상태**: 🟢 완료
**시작일**: 2025-11-04
**완료일**: 2025-11-04
**의존성**: Phase 6 완료

#### 7.1 사용자 모델 및 CRUD

**목표**: 사용자 관리 백엔드 구현

**작업 항목**:
- [x] **7.1.1** User 모델 (`backend/app/models/user.py`)
  - SQLAlchemy 모델 정의
  - 관계 설정 (projects, tasks 등)

- [x] **7.1.2** User 스키마 (`backend/app/schemas/user.py`, `backend/app/schemas/auth.py`)
  - UserCreate, UserUpdate, UserInDB, UserPublic
  - 비밀번호 제외 로직
  - 인증 관련 스키마 (UserRegister, UserLogin, Token)

- [x] **7.1.3** User CRUD (`backend/app/crud/user.py`)
  - create_user()
  - get_user_by_id()
  - get_user_by_username()
  - get_user_by_email()
  - update_user()
  - delete_user()
  - list_users() (페이지네이션)
  - authenticate_user() (로그인 검증)
  - update_last_login()
  - count_users()

- [x] **7.1.4** User API 엔드포인트 (`backend/app/api/v1/endpoints/users.py`)
  - `GET /api/v1/users` - 사용자 목록 (관리자만, 페이지네이션)
  - `GET /api/v1/users/me` - 내 정보
  - `PUT /api/v1/users/me` - 내 정보 수정
  - `GET /api/v1/users/{id}` - 사용자 상세 (관리자 또는 본인)
  - `PUT /api/v1/users/{id}` - 사용자 수정 (관리자 또는 본인)
  - `DELETE /api/v1/users/{id}` - 사용자 삭제 (관리자만, 자기 자신 제외)

**추정 시간**: 5일

#### 7.2 사용자 관리 UI

**목표**: 사용자 관리 프론트엔드 구현

**작업 항목**:
- [x] **7.2.1** 사용자 목록 페이지 (`frontend/src/pages/Users/UserList.tsx`)
  - 테이블 형태로 사용자 표시 (관리자 전용)
  - 검색 기능 (사용자명, 이메일)
  - 페이지네이션 (5/10/25/50 rows per page)
  - 사용자 상세/수정/삭제 버튼
  - 권한 및 상태 Chip 표시

- [x] **7.2.2** 사용자 상세 페이지 (`frontend/src/pages/Users/UserDetail.tsx`)
  - 사용자 정보 상세 표시
  - 아바타 및 권한 뱃지
  - 활동 로그 섹션 (향후 구현)
  - 할당된 태스크 섹션 (향후 구현)

- [x] **7.2.3** 사용자 수정 폼 (`frontend/src/pages/Users/UserForm.tsx`)
  - 프로필 수정 (email, full_name)
  - 권한 변경 (is_active, is_superuser)
  - 관리자 전용 기능
  - 자신의 계정 비활성화 방지

- [x] **7.2.4** 내 프로필 페이지 (`frontend/src/pages/Profile/MyProfile.tsx`)
  - 현재 사용자 정보 표시 및 수정
  - 프로필 정보 업데이트 (email, full_name)
  - 수정 모드 토글
  - 계정 정보 표시 (읽기 전용)

- [x] **7.2.5** 비밀번호 변경 컴포넌트 (`frontend/src/components/Profile/ChangePassword.tsx`)
  - 현재 비밀번호 확인
  - 새 비밀번호 입력 및 검증
  - 비밀번호 강도 표시 (실시간)
  - 비밀번호 일치 확인

- [x] **7.2.6** 라우팅 설정 (`frontend/src/routes/index.tsx`)
  - /profile - 내 프로필
  - /users - 사용자 목록 (관리자 전용)
  - /users/:userId - 사용자 상세
  - /users/:userId/edit - 사용자 수정 (관리자 전용)

**추정 시간**: 5일
**실제 소요 시간**: 6시간

---

### Phase 8: 권한 관리 (1주)

**상태**: 🟢 완료
**시작일**: 2025-11-04
**완료일**: 2025-11-04
**의존성**: Phase 7 완료

#### 8.1 RBAC 백엔드 (완료)

**목표**: 역할 기반 접근 제어 구현

**작업 항목**:
- [x] **8.1.1** Role 및 UserRole 모델 (`backend/app/models/role.py`)
  - Role 모델: id, name, description, permissions (JSON), created_at
  - UserRole 모델: user_id, role_id, project_id (nullable), assigned_at
  - has_permission() 메서드 구현
  - Relationship 설정 완료
  - models/__init__.py에 export 추가

- [x] **8.1.2** Role 스키마 (`backend/app/schemas/role.py`)
  - RoleCreate, RoleUpdate, RolePublic
  - UserRoleCreate, UserRolePublic, UserRoleWithDetails
  - PermissionCheck, PermissionCheckResponse
  - DEFAULT_ROLES 정의 (Admin, Project Manager, Team Member, Viewer)

- [x] **8.1.3** Role CRUD 함수 (`backend/app/crud/role.py`)
  - Role CRUD: create_role(), get_role(), list_roles(), update_role(), delete_role()
  - UserRole CRUD: assign_role_to_user(), remove_role_from_user(), get_user_roles()
  - 권한 체크: user_has_role(), user_has_permission(), get_user_permissions()
  - 프로젝트 멤버: get_project_members()

- [x] **8.1.4** 권한 체크 데코레이터 (`backend/app/api/deps.py`)
  - require_permission(permission, project_id) 팩토리 함수
  - require_role(role_name, project_id) 팩토리 함수
  - get_user_permissions_dep() 의존성
  - 슈퍼유저 자동 권한 부여 로직

- [x] **8.1.5** Role API 엔드포인트 (`backend/app/api/v1/endpoints/roles.py`)
  - `GET /api/v1/roles` - 역할 목록
  - `POST /api/v1/roles` - 역할 생성 (관리자 전용)
  - `GET /api/v1/roles/{id}` - 역할 상세
  - `PUT /api/v1/roles/{id}` - 역할 수정 (관리자 전용)
  - `DELETE /api/v1/roles/{id}` - 역할 삭제 (관리자 전용)
  - `POST /api/v1/roles/{id}/assign` - 사용자에게 역할 할당 (관리자 전용)
  - `DELETE /api/v1/roles/{id}/revoke` - 역할 제거 (관리자 전용)
  - `GET /api/v1/roles/users/{id}/roles` - 사용자 역할 조회
  - `GET /api/v1/roles/users/me/permissions` - 내 권한 조회
  - `POST /api/v1/roles/check-permission` - 권한 확인
  - `GET /api/v1/roles/projects/{id}/members` - 프로젝트 멤버 조회
  - API 라우터 등록 완료 (`backend/app/api/v1/__init__.py`)

- [x] **8.1.6** 기본 역할 초기화 스크립트 (`backend/app/core/init_roles.py`)
  - init_default_roles() 함수: DEFAULT_ROLES 자동 생성
  - init_roles_on_startup() 함수: 시작 시 호출
  - 멱등성 보장 (이미 존재하는 역할은 건너뜀)
  - 실패 시에도 애플리케이션 계속 실행

- [x] **8.1.7** 데이터베이스 마이그레이션
  - Alembic 마이그레이션 생성: `1b89f8956d22_add_roles_and_user_roles_tables`
  - roles 테이블 생성 (id, name, description, permissions, created_at)
  - user_roles 테이블 생성 (user_id, role_id, project_id, assigned_at)
  - 인덱스 및 외래 키 설정 완료
  - 마이그레이션 적용 완료 (`alembic upgrade head`)

**추정 시간**: 3일
**실제 소요 시간**: 3시간

#### 8.2 권한 UI (완료)

**목표**: 권한 관리 UI

**작업 항목**:
- [x] **8.2.1** 역할 관리 페이지 (`frontend/src/pages/Roles/`)
  - RoleList.tsx: 역할 목록 테이블 (관리자 전용)
  - RoleForm.tsx: 역할 생성/수정 폼
  - 역할별 아이콘 및 색상 표시 (Admin, Project Manager, Team Member, Viewer)
  - 역할 삭제 확인 다이얼로그
  - 권한 개수 표시 및 생성일 표시

- [x] **8.2.2** 권한 편집기 (`frontend/src/components/Roles/PermissionEditor.tsx`)
  - 5개 권한 카테고리별 체크박스 (프로젝트, 태스크, 이네이블러, 사용자, 역할)
  - 카테고리별 전체 선택/해제 기능
  - 전체 권한 선택/해제 버튼
  - 선택된 권한 개수 요약 표시
  - Indeterminate 체크박스 지원

- [x] **8.2.3** 프로젝트 멤버 관리 (`frontend/src/components/Projects/ProjectMembers.tsx`)
  - 프로젝트별 멤버 목록 테이블
  - 멤버 추가 다이얼로그 (사용자 선택 + 역할 선택)
  - 멤버 역할 제거 기능
  - 중복 멤버 추가 방지
  - 관리자 전용 멤버 추가/제거 버튼

- [x] **8.2.4** 라우팅 및 네비게이션 (`frontend/src/routes/index.tsx`, `frontend/src/components/Layout/Sidebar.tsx`)
  - /roles - 역할 목록
  - /roles/new - 역할 생성
  - /roles/:roleId/edit - 역할 수정
  - 사이드바에 관리자 전용 메뉴 섹션 추가 (사용자 관리, 역할 관리)
  - useAuthStore.is_superuser로 관리자 메뉴 표시 제어

**추정 시간**: 2일
**실제 소요 시간**: 4시간

---

### Phase 9: 파일 시스템 (2주)

**상태**: ✅ 완료
**시작일**: 2025-11-04
**완료일**: 2025-11-04
**의존성**: Phase 7 완료

#### 9.1 파일 저장소 백엔드 (완료)

**목표**: 파일 업로드/다운로드/관리 시스템

**작업 항목**:
- [x] **9.1.1** Attachment 모델 (`backend/app/models/attachment.py`)
  - SQLAlchemy 모델 정의: id, filename, stored_filename, file_path, file_size, content_type
  - entity_type, entity_id로 엔티티 연결
  - uploaded_by 외래 키로 User 연결
  - file_size_mb, file_extension 프로퍼티 메서드 구현

- [x] **9.1.2** 파일 저장소 서비스 (`backend/app/services/file_storage.py`)
  - FileStorageService 클래스 구현
  - 로컬 파일 시스템 저장 (`./data/uploads`)
  - 파일 크기 제한 (기본 10MB) 검증
  - 허용 파일 타입 검증 (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, md, png, jpg, jpeg, gif, svg, webp, zip 등)
  - UUID 기반 안전한 파일명 생성
  - MIME 타입 자동 감지 (mimetypes 모듈)
  - 파일 카테고리 분류 (image, document, archive, other)

- [x] **9.1.3** Attachment 스키마 (`backend/app/schemas/attachment.py`)
  - AttachmentCreate, AttachmentUpdate, AttachmentPublic
  - AttachmentListResponse, AttachmentUploadResponse
  - 파일 메타데이터 검증 및 직렬화

- [x] **9.1.4** Attachment CRUD (`backend/app/crud/attachment.py`)
  - create_attachment(), get_attachment(), get_attachment_by_stored_filename()
  - get_attachments_by_entity(), count_attachments_by_entity()
  - get_attachments_by_user(), update_attachment(), delete_attachment()
  - get_all_attachments(), count_all_attachments()

- [x] **9.1.5** 파일 API 엔드포인트 (`backend/app/api/v1/endpoints/attachments.py`)
  - `POST /api/v1/attachments/upload` - 파일 업로드 (Multipart Form)
  - `GET /api/v1/attachments/{id}` - 파일 메타데이터 조회
  - `GET /api/v1/attachments/{id}/download` - 파일 다운로드 (FileResponse)
  - `GET /api/v1/attachments` - 엔티티별 파일 목록 (쿼리 파라미터: entity_type, entity_id)
  - `PATCH /api/v1/attachments/{id}` - 파일 설명 수정
  - `DELETE /api/v1/attachments/{id}` - 파일 및 메타데이터 삭제

- [x] **9.1.6** API 라우터 등록
  - `app/api/v1/__init__.py`에 attachments_router 등록
  - `/api/v1/attachments` prefix로 엔드포인트 노출

**추정 시간**: 5일
**실제 소요 시간**: 3시간

#### 9.2 파일 업로드 UI (완료)

**목표**: 파일 첨부 UI 구현

**작업 항목**:
- [x] **9.2.1** 파일 업로드 컴포넌트 (`frontend/src/components/Common/FileUpload.tsx`)
  - 드래그 앤 드롭 파일 업로드 지원
  - 업로드 진행률 표시 (LinearProgress)
  - 이미지 파일 미리보기 기능
  - 파일 크기 및 확장자 검증
  - 백엔드 API 연동 (multipart/form-data)

- [x] **9.2.2** 첨부파일 목록 컴포넌트 (`frontend/src/components/Common/AttachmentList.tsx`)
  - 테이블 형식 파일 목록 표시
  - 파일 타입별 아이콘 표시
  - 파일 크기 포맷팅 (MB 단위)
  - 다운로드 버튼 (Blob URL 생성)
  - 삭제 버튼 (확인 대화상자 포함)
  - 업로드 일시 표시

- [x] **9.2.3** 파일 유틸리티 (`frontend/src/utils/fileUtils.ts`)
  - 파일 크기 포맷팅 함수
  - 파일 확장자 추출
  - 파일 타입 판별 (이미지, 비디오, 오디오, 문서 등)
  - 파일 아이콘 매핑
  - 허용된 확장자 검증
  - MIME 타입 변환

- [x] **9.2.4** 태스크 상세 페이지 통합 (`frontend/src/pages/Tasks/TaskDetail.tsx`)
  - 첨부파일 섹션 추가 (파일 업로드 + 목록)
  - 업로드 완료 시 목록 자동 새로고침
  - entity_type="task", entity_id=taskId로 연결

- [x] **9.2.5** 프로젝트 상세 페이지 통합 (`frontend/src/pages/ProjectDetail/ProjectDetail.tsx`)
  - "첨부파일" 탭 추가 (7번째 탭)
  - 파일 업로드 + 목록 컴포넌트 통합
  - entity_type="project", entity_id=projectId로 연결

- [x] **9.2.6** Common 컴포넌트 export (`frontend/src/components/Common/index.ts`)
  - FileUpload, AttachmentList 컴포넌트 export
  - Attachment 타입 export

**추정 시간**: 5일
**실제 소요 시간**: 2시간

---

### Phase 10: 실시간 통신 (2주)

**상태**: 🟢 완료
**시작일**: 2025-11-05
**완료일**: 2025-11-05
**의존성**: Phase 7 완료

#### 10.1 WebSocket 백엔드 ✅

**목표**: 실시간 통신 인프라 구축

**작업 항목**:
- [x] **10.1.1** Socket.IO 서버 설정
  - `backend/app/websocket/__init__.py` ✅ (2025-11-05)
  - FastAPI + python-socketio 통합
  - AsyncServer 생성 및 ASGI 통합
  - CORS 설정 (개발 환경 "*")

- [x] **10.1.2** WebSocket 이벤트 핸들러
  - `backend/app/websocket/handlers.py` ✅ (2025-11-05)
  - 연결/연결 해제 (`connect`, `disconnect`)
  - 방(room) 관리 (`join_project`, `leave_project`)
  - JWT 토큰 인증 검증 (`verify_token` 통합)
  - 사용자 세션 관리 (`connected_users` 딕셔너리)
  - 헬퍼 함수 (`get_connected_users`, `get_users_in_project`)

- [x] **10.1.3** 실시간 이벤트 브로드캐스트
  - `backend/app/websocket/events.py` ✅ (2025-11-05)
  - Task 이벤트: `task_created`, `task_updated`, `task_deleted`
  - Project 이벤트: `project_updated`
  - Dependency 이벤트: `dependency_created`, `dependency_deleted`
  - Attachment 이벤트: `attachment_uploaded`, `attachment_deleted`
  - 프로젝트별 room 기반 브로드캐스팅 (`project_{project_id}`)

- [x] **10.1.4** main.py 통합
  - `backend/app/main.py` ✅ (2025-11-05)
  - WebSocket 서버 초기화 (`init_socketio`)
  - 이벤트 핸들러 임포트 및 등록
  - API 버전 2.0.0으로 업그레이드

- [ ] **10.1.5** Redis 백엔드 (선택)
  - 다중 서버 환경 지원
  - Socket.IO Redis 어댑터

**구현 파일**:
- `backend/requirements.txt` - python-socketio==5.11.0, python-engineio==4.9.0 추가
- `backend/app/websocket/__init__.py` - Socket.IO 서버 초기화 (43 lines)
- `backend/app/websocket/handlers.py` - 이벤트 핸들러 (268 lines)
- `backend/app/websocket/events.py` - 브로드캐스트 함수 (235 lines)
- `backend/app/main.py` - WebSocket 통합 (modified)

**추정 시간**: 5일
**실제 소요 시간**: 1일

#### 10.2 WebSocket 프론트엔드 ✅

**목표**: 실시간 UI 업데이트

**작업 항목**:
- [x] **10.2.1** Socket.IO 클라이언트 설정
  - `frontend/src/services/websocket.ts` ✅ (2025-11-05)
  - 자동 재연결 (reconnection 설정)
  - JWT 토큰 인증 (auth 파라미터)
  - 연결 상태 관리 (ConnectionStatus enum)
  - 프로젝트 room 참여/퇴장 기능
  - 이벤트 리스너 등록/해제 기능
  - 싱글톤 패턴으로 서비스 구현

- [x] **10.2.2** 실시간 이벤트 리스너
  - `frontend/src/hooks/useWebSocket.ts` ✅ (2025-11-05)
  - `frontend/src/hooks/useProjectWebSocket.ts` ✅ (2025-11-05)
  - Task 이벤트: task_created, task_updated, task_deleted → 자동 fetchTasks
  - Project 이벤트: project_updated → 프로젝트 정보 갱신 준비
  - Dependency 이벤트: dependency_created, dependency_deleted → 자동 fetchDependencies
  - Attachment 이벤트: attachment_uploaded, attachment_deleted → 첨부파일 목록 갱신
  - 자동 연결/해제 관리
  - 프로젝트 자동 참여/퇴장

- [x] **10.2.3** 온라인 사용자 표시 및 연결 상태 UI
  - `frontend/src/pages/ProjectDetail/ProjectDetail.tsx` ✅ (2025-11-05)
  - 연결 상태 표시 Chip (실시간 연결됨 / 오프라인)
  - WiFi 아이콘으로 시각적 표시
  - 색상 코딩 (success / default)
  - useProjectWebSocket 훅 통합
  - 모든 실시간 이벤트 리스너 등록

**구현 파일**:
- `frontend/package.json` - socket.io-client==4.8.1 추가
- `frontend/src/services/websocket.ts` - Socket.IO 클라이언트 서비스 (305 lines)
- `frontend/src/hooks/useWebSocket.ts` - WebSocket React Hook (269 lines)
- `frontend/src/hooks/index.ts` - useWebSocket export 추가
- `frontend/src/pages/ProjectDetail/ProjectDetail.tsx` - WebSocket 통합 (modified)

**추정 시간**: 5일
**실제 소요 시간**: 1일

---

### Phase 11: 알림 시스템 (1주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD
**의존성**: Phase 10 완료

#### 11.1 알림 백엔드

**목표**: 알림 생성 및 관리

**작업 항목**:
- [ ] **11.1.1** Notification 모델
  - `backend/app/models/notification.py`

- [ ] **11.1.2** 알림 서비스
  - `backend/app/services/notification.py`
  - 알림 생성
  - 알림 읽음 처리
  - 알림 삭제

- [ ] **11.1.3** 알림 API
  - `GET /api/v1/notifications` - 내 알림 목록
  - `PUT /api/v1/notifications/{id}/read` - 읽음 처리
  - `DELETE /api/v1/notifications/{id}` - 삭제
  - `PUT /api/v1/notifications/read-all` - 전체 읽음

**추정 시간**: 3일

#### 11.2 알림 UI

**목표**: 알림 UI 구현

**작업 항목**:
- [ ] **11.2.1** 알림 드롭다운
  - `frontend/src/components/Layout/NotificationDropdown.tsx`
  - 헤더에 알림 아이콘
  - 읽지 않은 알림 개수 표시

- [ ] **11.2.2** 알림 목록
  - 알림 목록 표시
  - 읽음/읽지 않음 구분
  - 클릭 시 관련 페이지로 이동

**추정 시간**: 2일

---

### Phase 12: 다국어 지원 (1주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD

#### 12.1 i18n 설정

**목표**: 한국어, 영어 지원

**작업 항목**:
- [ ] **12.1.1** react-i18next 설정
  - `frontend/src/i18n/config.ts`
  - 언어 감지 및 저장

- [ ] **12.1.2** 번역 파일 작성
  - `frontend/src/i18n/locales/ko.json` (한국어)
  - `frontend/src/i18n/locales/en.json` (영어)

- [ ] **12.1.3** 언어 전환 UI
  - 헤더에 언어 선택 드롭다운

- [ ] **12.1.4** 백엔드 에러 메시지 다국어
  - Accept-Language 헤더 처리
  - 에러 메시지 번역

**추정 시간**: 5일

---

### Phase 13: UI/UX 개선 (2주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD
**의존성**: Phase 12 완료

#### 13.1 모바일 반응형

**목표**: 태블릿, 모바일 최적화

**작업 항목**:
- [ ] **13.1.1** 반응형 레이아웃
  - 모든 페이지 모바일 최적화
  - 햄버거 메뉴
  - 터치 제스처 지원

- [ ] **13.1.2** 간트 차트 모바일 최적화
  - 스와이프 네비게이션
  - 확대/축소

- [ ] **13.1.3** 캘린더 모바일 최적화

**추정 시간**: 5일

#### 13.2 UX 개선

**목표**: 사용성 개선

**작업 항목**:
- [ ] **13.2.1** 로딩 상태 개선
  - 스켈레톤 UI
  - 프로그레스 바

- [ ] **13.2.2** 에러 처리 개선
  - 사용자 친화적 에러 메시지
  - 재시도 버튼

- [ ] **13.2.3** 키보드 단축키
  - 자주 사용하는 작업에 단축키

**추정 시간**: 5일

---

### Phase 14: 성능 최적화 (1주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD
**의존성**: Phase 1-13 완료

#### 14.1 백엔드 성능

**목표**: 응답 속도 개선

**작업 항목**:
- [ ] **14.1.1** Redis 캐싱
  - 자주 조회되는 데이터 캐싱
  - 캐시 무효화 전략

- [ ] **14.1.2** 데이터베이스 인덱스
  - 느린 쿼리 분석
  - 인덱스 추가

- [ ] **14.1.3** N+1 쿼리 최적화
  - Eager Loading
  - Select In Loading

**추정 시간**: 3일

#### 14.2 프론트엔드 성능

**목표**: 로딩 속도 개선

**작업 항목**:
- [ ] **14.2.1** 코드 스플리팅
  - React.lazy()
  - 동적 임포트

- [ ] **14.2.2** 이미지 최적화
  - WebP 형식
  - Lazy Loading

- [ ] **14.2.3** React Query 최적화
  - 캐싱 전략
  - Stale Time 설정

**추정 시간**: 2일

---

### Phase 15: 테스트 및 문서화 (2주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD
**의존성**: Phase 1-14 완료

#### 15.1 테스트

**목표**: 80% 이상 테스트 커버리지

**작업 항목**:
- [ ] **15.1.1** 백엔드 단위 테스트
  - 모든 CRUD 함수
  - 서비스 로직

- [ ] **15.1.2** 백엔드 통합 테스트
  - API 엔드포인트
  - WebSocket

- [ ] **15.1.3** 프론트엔드 테스트
  - 컴포넌트 테스트
  - E2E 테스트

- [ ] **15.1.4** 보안 테스트
  - 인증/권한 테스트
  - SQL Injection
  - XSS

**추정 시간**: 7일

#### 15.2 문서화

**목표**: 완전한 문서 제공

**작업 항목**:
- [ ] **15.2.1** API 문서 업데이트
  - Swagger UI
  - 새 엔드포인트 문서화

- [ ] **15.2.2** 사용자 매뉴얼 업데이트
  - v2.0 신규 기능
  - 마이그레이션 가이드

- [ ] **15.2.3** 개발 가이드 업데이트
  - 아키텍처 변경 사항
  - 개발 환경 설정

**추정 시간**: 3일

---

### Phase 16: 마이그레이션 도구 (1주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD
**의존성**: Phase 15 완료

#### 16.1 데이터 마이그레이션

**목표**: v1.0 → v2.0 자동 마이그레이션

**작업 항목**:
- [ ] **16.1.1** 마이그레이션 스크립트
  - `backend/migrations/v1_to_v2.py`
  - 사용자 데이터 생성 (기본 admin)
  - 기존 데이터 보존

- [ ] **16.1.2** 마이그레이션 검증
  - 데이터 무결성 확인
  - 롤백 기능

- [ ] **16.1.3** 마이그레이션 가이드
  - 단계별 마이그레이션 절차
  - 백업 방법

**추정 시간**: 5일

---

### Phase 17: 최종 검증 및 릴리스 (1주)

**상태**: 🔴 미시작
**시작일**: TBD
**완료일**: TBD
**의존성**: Phase 16 완료

#### 17.1 최종 검증

**작업 항목**:
- [ ] **17.1.1** 전체 기능 테스트
- [ ] **17.1.2** 성능 테스트
- [ ] **17.1.3** 보안 감사
- [ ] **17.1.4** 문서 최종 검토

**추정 시간**: 3일

#### 17.2 릴리스

**작업 항목**:
- [ ] **17.2.1** 릴리스 노트 작성
- [ ] **17.2.2** 배포 패키지 생성
- [ ] **17.2.3** GitHub Release 생성
- [ ] **17.2.4** v2.0.0 태그

**추정 시간**: 2일

---

## 8. 품질 관리

### 8.1 코드 품질 기준

**백엔드**:
- 테스트 커버리지: ≥80%
- Pylint 점수: ≥9.0/10
- Type hints: 100%
- 함수 복잡도: ≤10

**프론트엔드**:
- 테스트 커버리지: ≥70%
- ESLint: 0 errors
- TypeScript strict mode
- 번들 크기: ≤500KB (initial)

### 8.2 코드 리뷰 프로세스

- 모든 PR은 리뷰 필수
- 리뷰 체크리스트:
  - 기능 동작 확인
  - 테스트 커버리지
  - 코드 스타일
  - 보안 취약점
  - 성능 이슈

---

## 9. 테스트 전략

### 9.1 백엔드 테스트

**단위 테스트** (pytest):
- 모든 CRUD 함수
- 서비스 로직
- 유틸리티 함수
- 목표: 80% 커버리지

**통합 테스트**:
- API 엔드포인트
- WebSocket 핸들러
- 데이터베이스 연동

**보안 테스트**:
- 인증/권한
- SQL Injection
- XSS/CSRF

### 9.2 프론트엔드 테스트

**컴포넌트 테스트** (React Testing Library):
- 모든 주요 컴포넌트
- 사용자 상호작용
- 목표: 70% 커버리지

**E2E 테스트** (Playwright):
- 로그인 플로우
- 프로젝트/태스크 생성
- 파일 업로드
- 실시간 업데이트

---

## 10. 배포 전략

### 10.1 폐쇄망 배포 (기본)

v1.0과 동일:
- Python wheel 파일
- 프론트엔드 빌드
- 설치 스크립트

**추가 사항**:
- Redis 설치 (선택)
- PostgreSQL 설치 (선택)

### 10.2 Docker 배포 (선택)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: project_manager
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

---

## 11. 마이그레이션 전략

### 11.1 데이터베이스 마이그레이션

**Alembic 마이그레이션**:
```bash
# v1.0 → v2.0 마이그레이션
alembic upgrade head
```

**자동 마이그레이션 스크립트**:
```python
# backend/migrations/v1_to_v2.py
def migrate_v1_to_v2():
    # 1. 백업 생성
    backup_database()

    # 2. 새 테이블 생성
    create_new_tables()

    # 3. 기존 데이터 마이그레이션
    migrate_projects()
    migrate_tasks()
    migrate_enablers()

    # 4. 기본 사용자 생성
    create_default_admin()

    # 5. 검증
    validate_migration()
```

### 11.2 롤백 전략

- 마이그레이션 전 자동 백업
- 롤백 스크립트 제공
- 검증 실패 시 자동 롤백

---

## 12. 개발 진행 상황 추적

### 12.1 Phase별 완료 현황

| Phase | 상태 | 시작일 | 완료일 | 진행률 |
|-------|------|--------|--------|--------|
| Phase 6: 인증 시스템 | 🟢 완료 | 2025-11-04 | 2025-11-04 | 100% |
| Phase 7: 사용자 관리 | 🟢 완료 | 2025-11-04 | 2025-11-04 | 100% |
| Phase 8: 권한 관리 | 🔴 미시작 | - | - | 0% |
| Phase 9: 파일 시스템 | 🔴 미시작 | - | - | 0% |
| Phase 10: 실시간 통신 | 🔴 미시작 | - | - | 0% |
| Phase 11: 알림 시스템 | 🔴 미시작 | - | - | 0% |
| Phase 12: 다국어 지원 | 🔴 미시작 | - | - | 0% |
| Phase 13: UI/UX 개선 | 🔴 미시작 | - | - | 0% |
| Phase 14: 성능 최적화 | 🔴 미시작 | - | - | 0% |
| Phase 15: 테스트 및 문서화 | 🔴 미시작 | - | - | 0% |
| Phase 16: 마이그레이션 도구 | 🔴 미시작 | - | - | 0% |
| Phase 17: 최종 검증 및 릴리스 | 🔴 미시작 | - | - | 0% |

### 12.2 전체 진행률

```
전체 진행률: 17% (2/12 Phase 완료)

███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 17%
```

---

## 📌 부록

### A. 참고 문서

- [v1.0 개발 계획서](./DEVELOPMENT_PLAN.md)
- [v1.0 CHANGELOG](./CHANGELOG.md)
- [API 문서](./docs/api-documentation.md)
- [아키텍처 문서](./docs/architecture.md)

### B. 기술 리서치

**인증 시스템**:
- [FastAPI JWT 인증](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [React 인증 플로우](https://auth0.com/blog/complete-guide-to-react-user-authentication/)

**WebSocket**:
- [FastAPI + Socket.IO](https://python-socketio.readthedocs.io/en/latest/server.html)
- [React + Socket.IO](https://socket.io/docs/v4/client-initialization/)

**다국어 지원**:
- [react-i18next](https://react.i18next.com/)

### C. 라이선스 검토

모든 신규 라이브러리는 MIT, BSD, Apache 2.0 등 오픈소스 라이선스를 사용하여 폐쇄망 배포에 문제가 없음을 확인했습니다.

---

**문서 버전**: 2.0.0
**최종 업데이트**: 2025-11-04
**작성자**: Claude Code
**상태**: 계획 단계

🤖 Generated with [Claude Code](https://claude.com/claude-code)
