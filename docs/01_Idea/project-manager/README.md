# 폐쇄망 프로젝트 관리 시스템 (Closed Network Project Manager)

## 개요
완전 오픈소스 기반의 폐쇄망 환경용 프로젝트/일정 관리 시스템
- 동적 간트 차트
- Key Enabler 추적 및 의존성 시각화
- 통합 캘린더 뷰
- 100% 오프라인 동작

## 기술 스택 (모두 오픈소스)

### Frontend
- **React 18** (MIT License)
- **TypeScript** (Apache 2.0)
- **Material-UI (MUI) v6** (MIT License)
- **Frappe Gantt** (MIT License) - 간트 차트
- **FullCalendar** (MIT License) - 캘린더
- **Recharts** (MIT License) - 추가 차트/그래프
- **React-Flow** (MIT License) - 의존성 그래프 시각화

### Backend
- **Python 3.11+**
- **FastAPI** (MIT License)
- **SQLAlchemy** (MIT License) - ORM
- **SQLite** (Public Domain) - 데이터베이스
- **Pydantic** (MIT License) - 데이터 검증
- **Uvicorn** (BSD License) - ASGI 서버

### 패키징 & 배포
- **PyInstaller** (GPL + 예외조항) - Python 실행파일 생성
- **Electron** (MIT License) - 데스크톱 앱 패키징 (선택사항)

## 프로젝트 구조

```
project-manager/
├── backend/                    # Python FastAPI 백엔드
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 앱 진입점
│   │   ├── config.py          # 설정 관리
│   │   ├── database.py        # DB 연결 및 세션
│   │   ├── models/            # SQLAlchemy 모델
│   │   │   ├── __init__.py
│   │   │   ├── project.py     # 프로젝트 모델
│   │   │   ├── task.py        # 태스크 모델
│   │   │   ├── enabler.py     # Key Enabler 모델
│   │   │   └── dependency.py  # 의존성 관계 모델
│   │   ├── schemas/           # Pydantic 스키마
│   │   │   ├── __init__.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── enabler.py
│   │   │   └── dependency.py
│   │   ├── api/               # API 라우터
│   │   │   ├── __init__.py
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   ├── enablers.py
│   │   │   ├── calendar.py
│   │   │   └── reports.py
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── __init__.py
│   │   │   ├── gantt_service.py      # 간트 차트 계산
│   │   │   ├── critical_path.py      # 크리티컬 패스 알고리즘
│   │   │   ├── dependency_analyzer.py # 의존성 분석
│   │   │   └── calendar_service.py   # 캘린더 데이터 처리
│   │   └── utils/             # 유틸리티
│   │       ├── __init__.py
│   │       ├── date_utils.py
│   │       └── export_utils.py  # CSV/Excel 익스포트
│   ├── tests/                 # 테스트
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   └── test_services.py
│   ├── requirements.txt       # Python 의존성
│   └── requirements-dev.txt   # 개발용 의존성
│
├── frontend/                  # React 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── index.tsx          # React 진입점
│   │   ├── App.tsx            # 메인 앱 컴포넌트
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── Gantt/
│   │   │   │   ├── GanttChart.tsx       # 간트 차트 메인
│   │   │   │   ├── TaskBar.tsx          # 태스크 바
│   │   │   │   ├── EnablerMarker.tsx    # Enabler 마커
│   │   │   │   └── DependencyLine.tsx   # 의존성 선
│   │   │   ├── Calendar/
│   │   │   │   ├── CalendarView.tsx     # 캘린더 메인
│   │   │   │   ├── EventModal.tsx       # 이벤트 상세
│   │   │   │   └── MilestoneCard.tsx    # 마일스톤 카드
│   │   │   ├── Project/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   └── ProjectDetail.tsx
│   │   │   ├── Task/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── TaskDetail.tsx
│   │   │   ├── Enabler/
│   │   │   │   ├── EnablerList.tsx
│   │   │   │   ├── EnablerForm.tsx
│   │   │   │   └── ImpactAnalysis.tsx   # 영향 분석 뷰
│   │   │   ├── Dependency/
│   │   │   │   ├── DependencyGraph.tsx  # React-Flow 기반
│   │   │   │   └── DependencyMatrix.tsx # 매트릭스 뷰
│   │   │   └── Reports/
│   │   │       ├── CriticalPath.tsx
│   │   │       ├── ProgressReport.tsx
│   │   │       └── ExportDialog.tsx
│   │   ├── services/          # API 클라이언트
│   │   │   ├── api.ts         # Axios 인스턴스
│   │   │   ├── projectService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── enablerService.ts
│   │   │   └── calendarService.ts
│   │   ├── hooks/             # Custom Hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useEnablers.ts
│   │   │   └── useCalendar.ts
│   │   ├── contexts/          # React Context
│   │   │   ├── ProjectContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── types/             # TypeScript 타입
│   │   │   ├── project.ts
│   │   │   ├── task.ts
│   │   │   ├── enabler.ts
│   │   │   └── dependency.ts
│   │   ├── utils/             # 유틸리티
│   │   │   ├── dateUtils.ts
│   │   │   ├── ganttUtils.ts
│   │   │   └── colorUtils.ts
│   │   └── styles/            # 스타일
│   │       ├── theme.ts       # MUI 테마
│   │       └── globalStyles.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts         # Vite 빌드 설정
│
├── deployment/                # 폐쇄망 배포 자료
│   ├── windows/
│   │   ├── install.bat        # Windows 설치 스크립트
│   │   ├── start.bat          # 실행 스크립트
│   │   └── uninstall.bat      # 제거 스크립트
│   ├── linux/
│   │   ├── install.sh         # Linux 설치 스크립트
│   │   ├── start.sh           # 실행 스크립트
│   │   └── uninstall.sh       # 제거 스크립트
│   ├── packages/              # 오프라인 패키지 저장소
│   │   ├── python-wheels/     # pip wheel 파일들
│   │   └── node-modules/      # npm 패키지들
│   └── database/
│       └── init.sql           # 초기 DB 스키마
│
├── docs/                      # 문서
│   ├── user-manual.md         # 사용자 매뉴얼
│   ├── api-documentation.md   # API 문서
│   ├── installation-guide.md  # 설치 가이드
│   └── architecture.md        # 시스템 아키텍처
│
└── docker/                    # Docker 설정 (선택사항)
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── docker-compose.yml
```

## 주요 기능별 파일 매핑

### 1. 간트 차트 기능
- Frontend: `frontend/src/components/Gantt/`
- Backend: `backend/app/services/gantt_service.py`
- API: `backend/app/api/tasks.py`

### 2. Key Enabler 관리
- Frontend: `frontend/src/components/Enabler/`
- Backend: `backend/app/models/enabler.py`
- Service: `backend/app/services/dependency_analyzer.py`

### 3. 캘린더 통합
- Frontend: `frontend/src/components/Calendar/`
- Backend: `backend/app/services/calendar_service.py`
- API: `backend/app/api/calendar.py`

### 4. 의존성 시각화
- Frontend: `frontend/src/components/Dependency/DependencyGraph.tsx`
- Backend: `backend/app/services/critical_path.py`

## 데이터베이스 스키마 개요

### 주요 테이블
1. **projects** - 프로젝트 기본 정보
2. **tasks** - 태스크/작업 항목
3. **enablers** - Key Enabler 항목
4. **dependencies** - 태스크 간 의존성
5. **enabler_impacts** - Enabler가 영향을 미치는 태스크 관계

## 개발 단계

### Phase 1: 백엔드 핵심 (1-3주)
- SQLAlchemy 모델 구현
- RESTful API 엔드포인트
- 크리티컬 패스 알고리즘

### Phase 2: 프론트엔드 기본 (4-6주)
- 간트 차트 컴포넌트
- 캘린더 뷰
- CRUD 폼

### Phase 3: 고급 기능 (7-8주)
- Enabler-Task 연결 시각화
- 의존성 그래프
- 리포트 생성

### Phase 4: 폐쇄망 배포 (9-10주)
- 설치 스크립트
- 오프라인 패키지 번들
- 사용자 매뉴얼

## 라이선스
이 프로젝트는 MIT License를 따릅니다.
모든 사용된 오픈소스 라이브러리는 상업적 사용이 가능한 라이선스입니다.
