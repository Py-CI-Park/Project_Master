# 프로젝트 디렉토리 구조 완전 가이드

## 전체 구조 개요

```
project-manager/
│
├── README.md                           # 프로젝트 개요 및 시작 가이드
├── .gitignore                          # Git 제외 파일 목록
├── LICENSE                             # MIT 라이선스
│
├── backend/                            # Python FastAPI 백엔드
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI 앱 진입점
│   │   ├── config.py                   # 환경 설정
│   │   ├── database.py                 # DB 연결 설정
│   │   │
│   │   ├── models/                     # SQLAlchemy 데이터 모델
│   │   │   ├── __init__.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── enabler.py
│   │   │   ├── dependency.py
│   │   │   └── calendar_event.py
│   │   │
│   │   ├── schemas/                    # Pydantic 스키마 (요청/응답)
│   │   │   ├── __init__.py
│   │   │   ├── project.py
│   │   │   ├── task.py
│   │   │   ├── enabler.py
│   │   │   ├── dependency.py
│   │   │   └── calendar.py
│   │   │
│   │   ├── api/                        # API 엔드포인트
│   │   │   ├── __init__.py
│   │   │   ├── projects.py             # 프로젝트 CRUD
│   │   │   ├── tasks.py                # 태스크 CRUD
│   │   │   ├── enablers.py             # Enabler CRUD
│   │   │   ├── dependencies.py         # 의존성 관리
│   │   │   ├── calendar.py             # 캘린더 API
│   │   │   └── reports.py              # 리포트 생성
│   │   │
│   │   ├── services/                   # 비즈니스 로직
│   │   │   ├── __init__.py
│   │   │   ├── gantt_service.py        # 간트 차트 데이터 생성
│   │   │   ├── critical_path.py        # CPM 알고리즘
│   │   │   ├── dependency_analyzer.py  # 의존성 분석
│   │   │   └── calendar_service.py     # 캘린더 이벤트 관리
│   │   │
│   │   └── utils/                      # 유틸리티 함수
│   │       ├── __init__.py
│   │       ├── date_utils.py           # 날짜 계산
│   │       └── export_utils.py         # CSV/Excel 익스포트
│   │
│   ├── alembic/                        # DB 마이그레이션
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/                          # 백엔드 테스트
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   ├── test_services.py
│   │   └── conftest.py
│   │
│   ├── requirements.txt                # Python 의존성
│   ├── requirements-dev.txt            # 개발 의존성
│   └── .env.example                    # 환경 변수 예제
│
├── frontend/                           # React TypeScript 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── index.tsx                   # React 진입점
│   │   ├── App.tsx                     # 메인 앱
│   │   ├── vite-env.d.ts               # Vite 타입 정의
│   │   │
│   │   ├── components/                 # React 컴포넌트
│   │   │   │
│   │   │   ├── Layout/                 # 레이아웃 컴포넌트
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   │
│   │   │   ├── Gantt/                  # 간트 차트 관련
│   │   │   │   ├── GanttChart.tsx      # 메인 차트
│   │   │   │   ├── TaskBar.tsx         # 태스크 바
│   │   │   │   ├── EnablerMarker.tsx   # Enabler 마커
│   │   │   │   ├── DependencyLine.tsx  # 의존성 선
│   │   │   │   ├── Timeline.tsx        # 타임라인
│   │   │   │   └── GanttToolbar.tsx    # 툴바
│   │   │   │
│   │   │   ├── Calendar/               # 캘린더 뷰
│   │   │   │   ├── CalendarView.tsx    # 메인 캘린더
│   │   │   │   ├── MonthView.tsx       # 월 뷰
│   │   │   │   ├── WeekView.tsx        # 주 뷰
│   │   │   │   ├── DayView.tsx         # 일 뷰
│   │   │   │   ├── EventModal.tsx      # 이벤트 모달
│   │   │   │   └── MilestoneCard.tsx   # 마일스톤 카드
│   │   │   │
│   │   │   ├── Project/                # 프로젝트 관리
│   │   │   │   ├── ProjectList.tsx     # 프로젝트 목록
│   │   │   │   ├── ProjectCard.tsx     # 프로젝트 카드
│   │   │   │   ├── ProjectForm.tsx     # 생성/수정 폼
│   │   │   │   └── ProjectDetail.tsx   # 상세 보기
│   │   │   │
│   │   │   ├── Task/                   # 태스크 관리
│   │   │   │   ├── TaskList.tsx        # 태스크 목록
│   │   │   │   ├── TaskCard.tsx        # 태스크 카드
│   │   │   │   ├── TaskForm.tsx        # 생성/수정 폼
│   │   │   │   ├── TaskDetail.tsx      # 상세 보기
│   │   │   │   └── TaskBoard.tsx       # 칸반 보드
│   │   │   │
│   │   │   ├── Enabler/                # Enabler 관리
│   │   │   │   ├── EnablerList.tsx     # Enabler 목록
│   │   │   │   ├── EnablerCard.tsx     # Enabler 카드
│   │   │   │   ├── EnablerForm.tsx     # 생성/수정 폼
│   │   │   │   ├── EnablerDetail.tsx   # 상세 보기
│   │   │   │   └── ImpactAnalysis.tsx  # 영향 분석
│   │   │   │
│   │   │   ├── Dependency/             # 의존성 시각화
│   │   │   │   ├── DependencyGraph.tsx # React Flow 그래프
│   │   │   │   ├── DependencyMatrix.tsx # 매트릭스 뷰
│   │   │   │   └── DependencyEditor.tsx # 편집기
│   │   │   │
│   │   │   ├── Reports/                # 리포트
│   │   │   │   ├── CriticalPath.tsx    # 크리티컬 패스
│   │   │   │   ├── ProgressReport.tsx  # 진행 리포트
│   │   │   │   ├── DelayAnalysis.tsx   # 지연 분석
│   │   │   │   └── ExportDialog.tsx    # 익스포트 다이얼로그
│   │   │   │
│   │   │   └── Common/                 # 공통 컴포넌트
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── DatePicker.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Loading.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   │
│   │   ├── services/                   # API 클라이언트
│   │   │   ├── api.ts                  # Axios 인스턴스
│   │   │   ├── projectService.ts       # 프로젝트 API
│   │   │   ├── taskService.ts          # 태스크 API
│   │   │   ├── enablerService.ts       # Enabler API
│   │   │   ├── dependencyService.ts    # 의존성 API
│   │   │   ├── calendarService.ts      # 캘린더 API
│   │   │   └── reportService.ts        # 리포트 API
│   │   │
│   │   ├── hooks/                      # Custom React Hooks
│   │   │   ├── useProjects.ts          # 프로젝트 훅
│   │   │   ├── useTasks.ts             # 태스크 훅
│   │   │   ├── useEnablers.ts          # Enabler 훅
│   │   │   ├── useDependencies.ts      # 의존성 훅
│   │   │   ├── useCalendar.ts          # 캘린더 훅
│   │   │   └── useGantt.ts             # 간트 차트 훅
│   │   │
│   │   ├── contexts/                   # React Context
│   │   │   ├── ProjectContext.tsx      # 프로젝트 컨텍스트
│   │   │   ├── ThemeContext.tsx        # 테마 컨텍스트
│   │   │   └── AuthContext.tsx         # 인증 컨텍스트
│   │   │
│   │   ├── types/                      # TypeScript 타입 정의
│   │   │   ├── project.ts              # 프로젝트 타입
│   │   │   ├── task.ts                 # 태스크 타입
│   │   │   ├── enabler.ts              # Enabler 타입
│   │   │   ├── dependency.ts           # 의존성 타입
│   │   │   ├── calendar.ts             # 캘린더 타입
│   │   │   └── common.ts               # 공통 타입
│   │   │
│   │   ├── utils/                      # 유틸리티
│   │   │   ├── dateUtils.ts            # 날짜 유틸
│   │   │   ├── ganttUtils.ts           # 간트 유틸
│   │   │   ├── colorUtils.ts           # 색상 유틸
│   │   │   ├── formatUtils.ts          # 포맷 유틸
│   │   │   └── validation.ts           # 검증 유틸
│   │   │
│   │   └── styles/                     # 스타일
│   │       ├── theme.ts                # MUI 테마
│   │       ├── globalStyles.ts         # 전역 스타일
│   │       └── variables.css           # CSS 변수
│   │
│   ├── package.json                    # npm 의존성
│   ├── package-lock.json
│   ├── tsconfig.json                   # TypeScript 설정
│   ├── tsconfig.node.json
│   ├── vite.config.ts                  # Vite 빌드 설정
│   ├── .eslintrc.cjs                   # ESLint 설정
│   └── .prettierrc                     # Prettier 설정
│
├── deployment/                         # 배포 관련
│   │
│   ├── windows/                        # Windows 배포
│   │   ├── install.bat                 # 설치 스크립트
│   │   ├── start.bat                   # 실행 스크립트
│   │   ├── stop.bat                    # 중지 스크립트
│   │   └── uninstall.bat               # 제거 스크립트
│   │
│   ├── linux/                          # Linux 배포
│   │   ├── install.sh                  # 설치 스크립트
│   │   ├── start.sh                    # 실행 스크립트
│   │   ├── stop.sh                     # 중지 스크립트
│   │   └── uninstall.sh                # 제거 스크립트
│   │
│   ├── packages/                       # 오프라인 패키지
│   │   ├── python-wheels/              # pip wheel 파일들
│   │   │   ├── fastapi-0.109.0-py3-none-any.whl
│   │   │   ├── uvicorn-0.27.0-py3-none-any.whl
│   │   │   └── ... (기타 wheel 파일들)
│   │   │
│   │   ├── node-modules-cache/         # npm 캐시
│   │   │   └── ... (npm 패키지들)
│   │   │
│   │   ├── python-installer/           # Python 설치 파일
│   │   │   ├── python-3.11.x-amd64.exe (Windows)
│   │   │   └── python-3.11.x.tar.gz (Linux)
│   │   │
│   │   └── node-installer/             # Node.js 설치 파일
│   │       ├── node-v18.x.x-x64.msi (Windows)
│   │       └── node-v18.x.x-linux-x64.tar.xz (Linux)
│   │
│   └── database/                       # DB 초기화
│       ├── init.sql                    # 초기 스키마
│       └── sample_data.sql             # 샘플 데이터
│
├── docs/                               # 문서
│   ├── README.md                       # 문서 목차
│   ├── architecture.md                 # 시스템 아키텍처
│   ├── database-schema.md              # DB 스키마
│   ├── api-documentation.md            # API 문서
│   ├── user-manual.md                  # 사용자 매뉴얼
│   ├── installation-guide.md           # 설치 가이드
│   ├── development-guide.md            # 개발 가이드
│   └── troubleshooting.md              # 문제 해결
│
├── docker/                             # Docker 설정 (선택)
│   ├── Dockerfile.backend              # 백엔드 Dockerfile
│   ├── Dockerfile.frontend             # 프론트엔드 Dockerfile
│   ├── docker-compose.yml              # Docker Compose
│   └── .dockerignore
│
├── data/                               # 런타임 데이터 (생성됨)
│   ├── project_manager.db              # SQLite DB
│   └── backups/                        # DB 백업
│
└── logs/                               # 로그 파일 (생성됨)
    ├── app.log                         # 애플리케이션 로그
    ├── error.log                       # 에러 로그
    └── access.log                      # 액세스 로그
```

## 주요 디렉토리 설명

### `/backend`
Python FastAPI로 작성된 RESTful API 백엔드. 비즈니스 로직, 데이터베이스 처리, 알고리즘 구현을 담당합니다.

### `/frontend`
React + TypeScript로 작성된 SPA 프론트엔드. 사용자 인터페이스, 데이터 시각화, 사용자 상호작용을 담당합니다.

### `/deployment`
폐쇄망 환경 배포를 위한 설치 스크립트와 오프라인 패키지 저장소입니다.

### `/docs`
프로젝트 문서화 자료. 기술 문서, 사용자 매뉴얼, 설치 가이드 등이 포함됩니다.

## 파일 개수 통계

- 백엔드 Python 파일: ~40개
- 프론트엔드 TypeScript/TSX 파일: ~80개
- 설정 파일: ~15개
- 문서 파일: ~10개
- 배포 스크립트: ~10개

**총 파일 수: 약 150-200개**

## 코드 라인 수 예상

- 백엔드: ~5,000-7,000 LOC
- 프론트엔드: ~10,000-15,000 LOC
- 테스트: ~2,000-3,000 LOC
- 설정/문서: ~1,000 LOC

**총 코드 라인 수: 약 18,000-26,000 LOC**

## 다음 단계

1. 각 파일의 상세 구현 코드 작성
2. API 엔드포인트 정의 및 구현
3. UI 컴포넌트 개발
4. 테스트 코드 작성
5. 문서화 완료
6. 폐쇄망 배포 패키지 준비
