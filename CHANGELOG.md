# Changelog

프로젝트 관리 시스템의 모든 주요 변경사항이 이 파일에 문서화됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

---

## [1.0.0] - 2025-11-04

### 🎉 첫 번째 공식 릴리스

폐쇄망 환경에서 동작하는 프로젝트 관리 시스템의 첫 번째 안정 버전입니다.

### ✨ 주요 기능

#### 백엔드 (FastAPI)
- **REST API**: 프로젝트, 태스크, Enabler 관리를 위한 완전한 RESTful API
- **데이터베이스**: SQLite 기반 경량 데이터베이스
- **ORM**: SQLAlchemy 2.0을 활용한 데이터 모델링
- **검증**: Pydantic v2를 통한 강력한 입력 검증
- **마이그레이션**: Alembic을 이용한 데이터베이스 스키마 관리
- **자동 문서화**: Swagger UI 및 ReDoc 지원

#### 프론트엔드 (React)
- **프로젝트 관리**: 프로젝트 생성, 수정, 삭제, 조회
- **태스크 관리**: 프로젝트별 태스크 관리
- **Enabler 관리**: 프로젝트 지원 활동 관리
- **반응형 UI**: Material-UI (MUI) v5 기반 현대적인 사용자 인터페이스
- **상태 관리**: Zustand를 통한 효율적인 클라이언트 상태 관리
- **HTTP 클라이언트**: Axios 기반 API 통신

#### 폐쇄망 배포
- **오프라인 설치**: 인터넷 연결 없이 완전한 설치 가능
- **Python 패키지**: 28개의 wheel 파일 포함
- **프론트엔드 빌드**: 사전 빌드된 정적 파일 포함
- **자동화 스크립트**: Windows 및 Linux용 설치/실행/종료 스크립트
- **데이터베이스 초기화**: 자동 DB 스키마 생성 스크립트

### 📚 문서

#### 사용자 문서
- **설치 가이드** (`docs/installation-guide.md`)
  - Windows 및 Linux 설치 방법
  - 시스템 요구사항
  - 7가지 일반적인 문제 해결 시나리오
- **배포 가이드** (`deployment/README.md`)
  - 폐쇄망 배포 상세 정보
  - 배포 패키지 구성

#### 개발자 문서
- **API 문서** (`docs/api-documentation.md`)
  - 모든 REST API 엔드포인트 레퍼런스
  - 요청/응답 예시 (cURL, Python, JavaScript)
  - 에러 코드 및 검증 규칙
- **아키텍처 문서** (`docs/architecture.md`)
  - 전체 시스템 아키텍처 다이어그램
  - 백엔드/프론트엔드/데이터베이스 구조
  - 기술 스택 상세 설명
  - 데이터베이스 ERD 및 스키마
- **개발 가이드** (`docs/development-guide.md`)
  - 개발 환경 설정
  - 빌드 및 테스트 방법
  - 코딩 규칙 및 Git 워크플로우
  - 디버깅 가이드
  - 기여 프로세스
- **보안 문서** (`backend/SECURITY.md`)
  - 보안 취약점 분석
  - 대응 방안

### 🛠️ 기술 스택

#### 백엔드
- Python 3.10+
- FastAPI 0.109+
- SQLAlchemy 2.0
- Pydantic v2
- Uvicorn
- Alembic
- SQLite 3.x

#### 프론트엔드
- React 18
- JavaScript (ES6+)
- Vite
- Material-UI (MUI) v5
- Zustand
- Axios
- React Router

### 🔧 시스템 요구사항

#### 최소 요구사항
- **운영체제**: Windows 10+ 또는 Ubuntu 20.04+, CentOS 8+
- **Python**: 3.10 이상
- **메모리**: 4GB RAM
- **디스크**: 2GB 여유 공간

#### 권장 요구사항
- **CPU**: Intel Core i5 이상
- **메모리**: 8GB RAM
- **디스크**: 5GB 여유 공간

### 📦 배포 패키지

- **Python 패키지**: 28개 wheel 파일 (약 50MB)
- **프론트엔드 빌드**: 정적 파일 (약 5MB)
- **데이터베이스**: SQLite (런타임 생성)
- **문서**: 설치 가이드, API 문서, 아키텍처 문서 등
- **스크립트**: 자동 설치 및 실행 스크립트

### 🎯 주요 엔드포인트

#### 프로젝트 API
- `GET /api/v1/projects` - 프로젝트 목록 조회
- `POST /api/v1/projects` - 프로젝트 생성
- `GET /api/v1/projects/{id}` - 프로젝트 상세 조회
- `PUT /api/v1/projects/{id}` - 프로젝트 수정
- `DELETE /api/v1/projects/{id}` - 프로젝트 삭제

#### 태스크 API
- `GET /api/v1/projects/{project_id}/tasks` - 태스크 목록 조회
- `POST /api/v1/projects/{project_id}/tasks` - 태스크 생성
- `GET /api/v1/tasks/{id}` - 태스크 상세 조회
- `PUT /api/v1/tasks/{id}` - 태스크 수정
- `DELETE /api/v1/tasks/{id}` - 태스크 삭제

#### Enabler API
- `GET /api/v1/projects/{project_id}/enablers` - Enabler 목록 조회
- `POST /api/v1/projects/{project_id}/enablers` - Enabler 생성
- `GET /api/v1/enablers/{id}` - Enabler 상세 조회
- `PUT /api/v1/enablers/{id}` - Enabler 수정
- `DELETE /api/v1/enablers/{id}` - Enabler 삭제

### 🔒 보안

#### 구현된 보안 기능
- **입력 검증**: Pydantic을 통한 모든 입력 데이터 검증
- **SQL 인젝션 방지**: SQLAlchemy ORM 사용
- **CORS 설정**: 프론트엔드 origin만 허용
- **에러 처리**: 내부 오류 정보 노출 최소화

#### 향후 보안 강화 계획 (v2.0)
- JWT 기반 인증 시스템
- 역할 기반 접근 제어 (RBAC)
- 비밀번호 해싱 (bcrypt)
- HTTPS 지원
- Rate Limiting

### ⚠️ 알려진 제한사항

#### 기능적 제한
- **인증 시스템**: 현재 버전에서는 인증 기능이 구현되지 않음 (v2.0 예정)
- **사용자 관리**: 다중 사용자 지원 없음 (단일 사용자 환경)
- **파일 업로드**: 파일 첨부 기능 미구현
- **간트 차트**: 시각화 기능 미구현 (향후 추가 예정)
- **캘린더**: 통합 캘린더 미구현 (향후 추가 예정)
- **의존성 관리**: 태스크 간 의존성 기능 미구현
- **실시간 업데이트**: WebSocket 기반 실시간 동기화 미지원

#### 기술적 제한
- **데이터베이스**: SQLite 사용으로 동시 쓰기 제한
- **확장성**: 단일 서버 구성으로 수평 확장 제한
- **파일 백업**: 자동 백업 기능 없음 (수동 백업 필요)
- **다국어 지원**: 한국어 UI만 지원

#### 성능 제한
- **프로젝트 수**: 최대 1,000개 권장
- **태스크 수**: 프로젝트당 최대 10,000개 권장
- **동시 접속**: 10명 이하 권장

### 🚀 설치 방법

#### Windows
```batch
# 배포 패키지 압축 해제 후
cd Project_Master
deployment\windows\install.bat
deployment\windows\start.bat
```

#### Linux
```bash
# 배포 패키지 압축 해제 후
cd Project_Master
chmod +x deployment/linux/*.sh
./deployment/linux/install.sh
./deployment/linux/start.sh
```

### 🌐 접속 주소

설치 및 실행 후 다음 주소로 접속:
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:8000
- **API 문서 (Swagger)**: http://localhost:8000/docs
- **API 문서 (ReDoc)**: http://localhost:8000/redoc

### 📋 체크리스트

#### 배포 완료 사항
- [x] 백엔드 API 구현 완료
- [x] 프론트엔드 UI 구현 완료
- [x] 데이터베이스 스키마 정의
- [x] 폐쇄망 배포 패키지 준비
  - [x] Python wheel 파일 (28개)
  - [x] 프론트엔드 빌드 파일
  - [x] 설치 스크립트 (Windows/Linux)
  - [x] 실행 스크립트 (Windows/Linux)
  - [x] 데이터베이스 초기화 스크립트
- [x] 문서 작성 완료
  - [x] 설치 가이드
  - [x] API 문서
  - [x] 아키텍처 문서
  - [x] 개발 가이드
  - [x] 보안 문서
- [x] README.md 작성
- [x] 릴리스 노트 작성

### 🔄 업그레이드 경로

이 버전은 첫 번째 릴리스이므로 업그레이드 경로가 없습니다.

### 🎓 참고 자료

- [설치 가이드](docs/installation-guide.md)
- [API 문서](docs/api-documentation.md)
- [아키텍처 문서](docs/architecture.md)
- [개발 가이드](docs/development-guide.md)
- [배포 가이드](deployment/README.md)
- [보안 문서](backend/SECURITY.md)

### 🤝 기여

기여 방법은 [개발 가이드](docs/development-guide.md)의 기여 섹션을 참고하세요.

### 📄 라이선스

이 프로젝트는 MIT License를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

### 🙏 감사의 말

이 프로젝트는 다음 오픈소스 라이브러리를 사용합니다:
- FastAPI, SQLAlchemy, Pydantic, Uvicorn, Alembic (Python)
- React, Material-UI, Zustand, Axios, React Router (JavaScript)

모든 기여자와 오픈소스 커뮤니티에 감사드립니다.

---

## [Unreleased]

### 계획된 기능 (v2.0)
- 사용자 인증 및 권한 관리
- 간트 차트 시각화
- 통합 캘린더
- 태스크 의존성 관리
- 크리티컬 패스 분석
- 파일 첨부 기능
- 실시간 협업 (WebSocket)
- 다국어 지원 (영어)
- 모바일 반응형 개선

### 개선 예정 (v1.1)
- 사용자 매뉴얼 추가
- 샘플 데이터 제공
- 설치 동영상 가이드
- 성능 최적화
- 에러 처리 개선

---

**릴리스 정보**
- **버전**: 1.0.0
- **릴리스 날짜**: 2025-11-04
- **릴리스 타입**: 초기 릴리스 (Initial Release)
- **지원 플랫폼**: Windows 10+, Linux (Ubuntu 20.04+, CentOS 8+)
- **Python 버전**: 3.10+
- **Node.js 요구사항**: 개발 환경에만 필요 (사용자 환경 불필요)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
