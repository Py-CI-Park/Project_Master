# 폐쇄망 프로젝트 관리 시스템

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![React](https://img.shields.io/badge/react-18+-61dafb)
![FastAPI](https://img.shields.io/badge/fastapi-0.109+-009688)

**완전 오픈소스 기반, 100% 오프라인 동작하는 프로젝트/일정 관리 시스템**

[기능 소개](#-주요-기능) • [빠른 시작](#-빠른-시작) • [문서](#-문서) • [기여](#-기여-방법)

</div>

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 규칙](#-개발-규칙)
- [문서](#-문서)
- [테스트](#-테스트)
- [배포](#-배포)
- [라이선스](#-라이선스)
- [기여 방법](#-기여-방법)
- [문의](#-문의)

---

## 🎯 프로젝트 소개

**폐쇄망 프로젝트 관리 시스템(Closed Network Project Manager)**은 인터넷 연결이 제한된 폐쇄망 환경에서 프로젝트와 일정을 효율적으로 관리하기 위한 **완전 오픈소스 웹 애플리케이션**입니다.

### 왜 이 프로젝트인가?

- 🔒 **폐쇄망 환경**: 보안이 중요한 환경에서도 완전 오프라인 동작
- 🆓 **100% 무료**: 모든 구성 요소가 오픈소스, 상업적 사용 가능
- 🚀 **간편한 설치**: 복잡한 서버 설정 없이 단일 실행 파일 또는 간단한 스크립트로 설치
- 📊 **강력한 시각화**: 동적 간트 차트, 의존성 그래프, 통합 캘린더
- 🧩 **Key Enabler 관리**: 프로젝트 성공의 핵심 요소를 추적하고 영향 분석

### 핵심 가치

> "폐쇄망 환경에서도 최신 프로젝트 관리 도구의 편리함을"

---

## ✨ 주요 기능

### 1. 동적 간트 차트
- 📈 실시간 태스크 시각화
- 🖱️ 드래그 앤 드롭으로 일정 조정
- 🎨 상태별, 우선순위별 색상 코딩
- ⚡ 크리티컬 패스 자동 계산 및 강조

### 2. Key Enabler 관리
- 🔑 프로젝트 성공의 핵심 요소 추적 (문서, 장비, 자원, 승인 등)
- 📍 간트 차트에 Enabler 전달일 마커 표시
- ⚠️ Enabler 지연 시 영향받는 태스크 자동 분석
- 📊 영향도 시각화 및 경고 알림

### 3. 의존성 시각화
- 🕸️ 태스크 간 의존성 그래프 (React-Flow 기반)
- 🔗 FS, SS, FF, SF 네 가지 의존성 타입 지원
- 🔍 영향 분석: 한 태스크 변경 시 연쇄 영향 확인
- 🚫 순환 의존성 자동 검증

### 4. 통합 캘린더
- 📅 월/주/일 뷰 지원
- 🎯 마일스톤, 태스크 시작/종료일, Enabler 전달일 통합 표시
- 🏷️ 이벤트 타입별 색상 구분
- 🔔 중요 일정 하이라이트

### 5. 크리티컬 패스 분석
- 🧮 CPM (Critical Path Method) 알고리즘 기반
- ⏱️ 각 태스크의 여유 시간(Slack) 계산
- 🚦 프로젝트 지연 위험 자동 감지
- 📉 리스크 평가 및 리포트

### 6. 리포트 및 익스포트
- 📊 진행 현황 대시보드
- 📈 지연 분석 리포트
- 💾 CSV/Excel 익스포트
- 🖨️ PDF 리포트 생성 (선택)

---

## 🛠️ 기술 스택

### Frontend
```
React 18 + JavaScript (ES6+)
├── UI: Material-UI (MUI) v5
├── 간트 차트: Frappe Gantt
├── 캘린더: FullCalendar
├── 그래프: React-Flow + Recharts
├── 빌드: Vite
├── 상태 관리: Zustand
└── HTTP 클라이언트: Axios
```

### Backend
```
Python 3.10+ + FastAPI 0.109+
├── ORM: SQLAlchemy 2.0
├── 검증: Pydantic v2
├── DB: SQLite 3.x
├── 서버: Uvicorn
└── 마이그레이션: Alembic
```

### 개발 도구
- **테스트**: pytest, Jest, React Testing Library
- **코드 품질**: ESLint, Prettier, Black, mypy
- **문서**: Markdown, Swagger/OpenAPI
- **버전 관리**: Git

> 모든 라이브러리는 상업적 사용이 가능한 오픈소스 라이선스(MIT, Apache, BSD, PSF)를 따릅니다.

---

## 🚀 빠른 시작

### 시스템 요구사항

- **운영체제**: Windows 10/11 또는 Linux (Ubuntu 20.04+, CentOS 8+)
- **Python**: 3.10 이상
- **메모리**: 최소 4GB RAM (8GB 권장)
- **디스크**: 최소 2GB 여유 공간 (프로그램 + 데이터)
- **네트워크**: 필요 없음 (폐쇄망 지원)

### 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd Project_Master
```

#### 2. 백엔드 설정
```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 데이터베이스 초기화
python -m app.database
alembic upgrade head

# 개발 서버 실행
uvicorn app.main:app --reload
```

#### 3. 프론트엔드 설정
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

#### 4. 브라우저에서 접속
```
http://localhost:5173
```

백엔드 API 문서는 `http://localhost:8000/docs`에서 확인 가능합니다.

---

## 📂 프로젝트 구조

```
Project_Master/
├── README.md                    # 📄 이 파일
├── DEVELOPMENT_PLAN.md          # 📋 상세 개발 계획서
├── LICENSE                      # ⚖️ MIT 라이선스
│
├── backend/                     # 🐍 Python FastAPI 백엔드
│   ├── app/
│   │   ├── main.py              # FastAPI 진입점
│   │   ├── database.py          # 데이터베이스 설정
│   │   ├── models/              # SQLAlchemy ORM 모델
│   │   ├── schemas/             # Pydantic 스키마
│   │   ├── api/v1/              # REST API 엔드포인트 (v1)
│   │   └── crud/                # CRUD 작업
│   ├── migrations/              # Alembic 마이그레이션
│   ├── tests/                   # 백엔드 테스트
│   ├── requirements.txt         # Python 운영 의존성
│   ├── requirements-dev.txt     # Python 개발 의존성
│   ├── project_master.db        # SQLite 데이터베이스 (런타임 생성)
│   └── SECURITY.md              # 보안 취약점 분석
│
├── frontend/                    # ⚛️ React 프론트엔드
│   ├── src/
│   │   ├── components/          # React 컴포넌트
│   │   │   ├── common/          # 공통 컴포넌트
│   │   │   ├── projects/        # 프로젝트 관련
│   │   │   ├── tasks/           # 태스크 관련
│   │   │   └── enablers/        # Enabler 관련
│   │   ├── services/            # API 서비스 (Axios)
│   │   ├── stores/              # 상태 관리 (Zustand)
│   │   ├── utils/               # 유틸리티 함수
│   │   └── main.jsx             # React 진입점
│   ├── dist/                    # 프로덕션 빌드 (빌드 시 생성)
│   ├── package.json             # npm 의존성
│   └── vite.config.js           # Vite 설정
│
├── deployment/                  # 🚀 폐쇄망 배포 자료
│   ├── packages/
│   │   └── python-wheels/       # Python 패키지 wheel 파일 (28개)
│   ├── frontend-build/          # React 프로덕션 빌드
│   ├── database/
│   │   ├── init_db.py           # DB 초기화 스크립트
│   │   └── README.md            # DB 초기화 안내
│   ├── windows/
│   │   ├── install.bat          # Windows 설치 스크립트
│   │   └── start.bat            # Windows 실행 스크립트
│   ├── linux/
│   │   ├── install.sh           # Linux 설치 스크립트
│   │   ├── start.sh             # Linux 실행 스크립트
│   │   └── stop.sh              # Linux 종료 스크립트
│   └── README.md                # 배포 가이드
│
└── docs/                        # 📚 문서
    ├── 01_Idea/                 # 초기 아이디어 및 기획 문서
    ├── installation-guide.md    # 설치 가이드 (Windows/Linux)
    ├── api-documentation.md     # API 레퍼런스 문서
    ├── architecture.md          # 시스템 아키텍처 문서
    └── development-guide.md     # 개발 가이드
```

자세한 아키텍처는 [아키텍처 문서](docs/architecture.md)를 참고하세요.

---

## 📜 개발 규칙

### 핵심 원칙

> 이 프로젝트는 **DEVELOPMENT_PLAN.md**를 기반으로 체계적으로 개발됩니다.

### 1. 개발 계획서 기반 개발

- ✅ 모든 개발은 [`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md)에 정의된 Phase와 작업 항목을 따릅니다.
- ✅ Phase 및 작업 항목 순서를 준수하여 순차적으로 진행합니다.
- ✅ 계획에 없는 기능은 계획서에 추가 후 개발합니다.

### 2. 실시간 진행 상황 반영

- 📊 **개발 계획서는 프로젝트의 실시간 진행 상황을 반영하는 생명체입니다.**
- 📊 작업 항목 완료 시 `[ ]` → `[x]` 체크 및 완료 날짜 기록
- 📊 Phase 상태 변경: 🔴 미시작 → 🟡 진행 중 → 🟢 완료
- 📊 매주 금요일 개발 진행률 업데이트

### 3. Git Commit 규칙

#### Commit 메시지 형식
```
[Phase N] 작업 항목 번호 및 설명

상세 설명 (선택)
```

#### 예시
```
[Phase 1] 1.1.1 SQLAlchemy 모델 정의 완료

- projects, tasks, enablers 모델 구현
- 관계 설정 및 제약조건 추가
- 테스트 케이스 작성
```

#### Commit 주기
- ✅ **작업 항목 완료 시마다 커밋** (최소 단위)
- ✅ **개발 계획서 업데이트와 함께 커밋**
- ✅ **의미 있는 단위로 커밋** (너무 크거나 작지 않게)

#### Commit 전 체크리스트
- [ ] 코드 품질 검사 통과 (ESLint, Black)
- [ ] 관련 테스트 작성 및 통과
- [ ] DEVELOPMENT_PLAN.md 업데이트 (작업 항목 체크)
- [ ] 의미 있는 커밋 메시지 작성

### 4. 브랜치 전략

```
main (또는 master)
  ├── feature/phase-0-setup          # Phase별 브랜치
  ├── feature/phase-1-backend
  ├── feature/phase-2-frontend
  ├── feature/phase-3-advanced
  ├── feature/phase-4-testing
  └── feature/phase-5-deployment
```

- `main` 브랜치는 항상 안정적인 상태 유지
- 각 Phase는 별도 브랜치에서 개발
- Phase 완료 시 `main`으로 머지

### 5. 코드 리뷰 및 품질 관리

- ✅ **자가 리뷰**: 커밋 전 체크리스트 확인
- ✅ **자동 검증**: Git hooks (husky + lint-staged) 활용
- ✅ **테스트 커버리지**: 백엔드 ≥ 80%, 프론트엔드 ≥ 70%
- ✅ **문서화**: 주요 함수/클래스에 docstring/주석 작성

### 6. 이슈 및 버그 관리

- 🐛 버그 발견 시 이슈 등록 (우선순위 지정)
- 🐛 버그 수정 후 재현 테스트 케이스 작성
- 🐛 `bugfix/설명` 형식의 브랜치 사용

---

## 📚 문서

### 개발 문서
- [개발 계획서](DEVELOPMENT_PLAN.md) - **가장 중요!** 전체 개발 계획 및 진행 상황
- [아키텍처 문서](docs/architecture.md) - 시스템 아키텍처 및 기술 스택
- [개발 가이드](docs/development-guide.md) - 개발 환경 설정 및 기여 방법
- [API 문서](docs/api-documentation.md) - REST API 레퍼런스

### 사용자 문서
- [설치 가이드](docs/installation-guide.md) - Windows/Linux 설치 방법 및 문제 해결
- [배포 가이드](deployment/README.md) - 폐쇄망 배포 상세 정보
- [보안 문서](backend/SECURITY.md) - 보안 취약점 분석 및 대응 방안

### 추가 문서 (개발 예정)
- 사용자 매뉴얼 - 기능별 사용 방법
- 문제 해결 가이드 - FAQ 및 트러블슈팅

---

## 🧪 테스트

### 백엔드 테스트

```bash
cd backend

# 전체 테스트 실행
pytest

# 커버리지 확인
pytest --cov=app --cov-report=html

# 특정 테스트 실행
pytest tests/test_critical_path.py
```

### 프론트엔드 테스트

```bash
cd frontend

# 전체 테스트 실행
npm test

# 커버리지 확인
npm run test:coverage

# Watch 모드
npm test -- --watch
```

### 테스트 전략
- **단위 테스트** (70%): 개별 함수/컴포넌트 테스트
- **통합 테스트** (20%): API 연동, 데이터 흐름 테스트
- **E2E 테스트** (10%): 사용자 시나리오 테스트

---

## 📦 배포

### 폐쇄망 환경 배포

이 시스템은 외부 네트워크 없이 완전히 오프라인으로 동작하도록 설계되었습니다.

#### Windows 설치 및 실행
```batch
# 1. 배포 패키지 압축 해제
# (Project_Master 디렉토리)

# 2. 설치
cd Project_Master
deployment\windows\install.bat

# 3. 서버 실행
deployment\windows\start.bat

# 4. 브라우저에서 접속
# 프론트엔드: http://localhost:5173
# 백엔드 API: http://localhost:8000
# API 문서: http://localhost:8000/docs
```

#### Linux 설치 및 실행
```bash
# 1. 배포 패키지 압축 해제
# (Project_Master 디렉토리)

# 2. 설치 스크립트 실행 권한 부여
cd Project_Master
chmod +x deployment/linux/*.sh

# 3. 설치
./deployment/linux/install.sh

# 4. 서버 실행 (백그라운드)
./deployment/linux/start.sh

# 5. 브라우저에서 접속
# 프론트엔드: http://localhost:5173
# 백엔드 API: http://localhost:8000

# 서버 종료 (필요 시)
./deployment/linux/stop.sh
```

자세한 내용은 [설치 가이드](docs/installation-guide.md) 및 [배포 가이드](deployment/README.md)를 참고하세요.

### 배포 패키지 구성

- **Python 패키지**: 28개의 wheel 파일 (오프라인 설치용)
- **데이터베이스**: SQLite (별도 서버 불필요)
- **프론트엔드**: 정적 빌드 파일
- **스크립트**: 자동 설치 및 실행 스크립트 (Windows/Linux)

---

## ⚖️ 라이선스

이 프로젝트는 **MIT License**를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

### 사용된 오픈소스 라이브러리

모든 사용된 라이브러리는 상업적 사용이 가능한 오픈소스 라이선스입니다:

- React, Material-UI, Frappe Gantt, FullCalendar, React-Flow, Recharts: **MIT License**
- TypeScript: **Apache 2.0 License**
- Python, FastAPI, SQLAlchemy, Pydantic: **MIT License**
- Uvicorn: **BSD License**
- SQLite: **Public Domain**

---

## 🤝 기여 방법

이 프로젝트에 기여하고 싶으신가요? 환영합니다! 🎉

### 기여 프로세스

1. **Fork** 이 저장소
2. **Feature 브랜치** 생성 (`git checkout -b feature/amazing-feature`)
3. **개발 계획서 확인** 후 작업 항목 선택
4. **코드 작성** 및 **테스트** 추가
5. **Commit** (`git commit -m '[Phase N] 작업 설명'`)
6. **Push** (`git push origin feature/amazing-feature`)
7. **Pull Request** 생성

### 기여 가이드라인

- ✅ [개발 규칙](#-개발-규칙) 준수
- ✅ 코드 품질 검사 통과
- ✅ 테스트 작성 및 커버리지 유지
- ✅ 의미 있는 커밋 메시지 작성
- ✅ DEVELOPMENT_PLAN.md 업데이트

### 기여할 수 있는 영역

- 🐛 버그 수정
- ✨ 새로운 기능 추가
- 📝 문서 개선
- 🧪 테스트 추가
- 🎨 UI/UX 개선
- 🌐 다국어 지원 (향후)

---

## 📞 문의

- **이슈**: [GitHub Issues](../../issues)
- **문서**: [프로젝트 문서](docs/)
- **개발 계획**: [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)

---

## 🌟 스타 히스토리

프로젝트가 마음에 드신다면 ⭐ Star를 눌러주세요!

---

<div align="center">

**Made with ❤️ for Closed Network Environments**

© 2025 Closed Network Project Manager

</div>
