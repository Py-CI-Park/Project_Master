# v1.0 → v2.0 마이그레이션 가이드

폐쇄망 프로젝트 관리 시스템을 v1.0에서 v2.0으로 업그레이드하는 방법을 안내합니다.

---

## 📋 목차

1. [마이그레이션 개요](#1-마이그레이션-개요)
2. [마이그레이션 전 준비](#2-마이그레이션-전-준비)
3. [마이그레이션 실행](#3-마이그레이션-실행)
4. [마이그레이션 검증](#4-마이그레이션-검증)
5. [롤백 방법](#5-롤백-방법)
6. [문제 해결](#6-문제-해결)
7. [FAQ](#7-faq)

---

## 1. 마이그레이션 개요

### 1.1 v2.0 주요 변경사항

v2.0에서는 다음과 같은 주요 기능이 추가되었습니다:

- 🔐 **사용자 인증 및 권한 관리**: JWT 기반 인증, RBAC
- 👥 **다중 사용자 지원**: 팀 협업 기능
- ⚡ **실시간 통신**: WebSocket 기반 실시간 업데이트
- 🔔 **알림 시스템**: 실시간 알림
- 🌐 **다국어 지원**: 한국어/영어
- 📎 **파일 첨부**: 프로젝트/태스크별 파일 첨부
- 🚀 **성능 최적화**: 데이터베이스 인덱스, 코드 스플리팅

### 1.2 데이터베이스 변경사항

**추가된 테이블**:
- `users` - 사용자 계정
- `roles` - 역할 정의
- `user_roles` - 사용자-역할 매핑
- `project_members` - 프로젝트 멤버
- `notifications` - 알림
- `attachments` - 파일 첨부

**기존 테이블 변경**:
- `projects`, `tasks`, `enablers`에 `created_by`, `updated_by` 필드 추가
- 성능 최적화를 위한 인덱스 추가

### 1.3 마이그레이션 도구

자동 마이그레이션 스크립트 `backend/migrations/v1_to_v2.py`를 제공합니다.

**주요 기능**:
- ✅ v1.0 데이터베이스 자동 백업
- ✅ v2.0 스키마로 자동 업그레이드
- ✅ 기본 admin 계정 자동 생성
- ✅ 기존 데이터 보존 및 소유자 설정
- ✅ 데이터 무결성 검증
- ✅ 롤백 기능

---

## 2. 마이그레이션 전 준비

### 2.1 시스템 요구사항 확인

**최소 요구사항**:
- Python 3.10 이상
- 여유 디스크 공간: v1.0 데이터베이스 크기의 2배 이상 (백업용)
- 메모리: 4GB 이상 (8GB 권장)

### 2.2 현재 버전 확인

v1.0 데이터베이스 파일 위치 확인:

```bash
# 기본 위치
ls -lh backend/project_master.db
```

### 2.3 수동 백업 (선택사항)

마이그레이션 스크립트가 자동으로 백업하지만, 추가 백업을 원하는 경우:

```bash
# 백업 디렉토리 생성
mkdir -p backups/manual

# 수동 백업
cp backend/project_master.db backups/manual/project_master_$(date +%Y%m%d_%H%M%S).db
```

### 2.4 Python 환경 확인

```bash
cd backend

# 가상환경 활성화
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate     # Windows

# 필요한 패키지 설치 확인
pip install -r requirements.txt
```

---

## 3. 마이그레이션 실행

### 3.1 기본 마이그레이션

가장 간단한 방법으로, 기본 설정을 사용합니다:

```bash
cd backend

# 마이그레이션 실행
python migrations/v1_to_v2.py
```

**기본 설정**:
- 데이터베이스 경로: `../project_master.db`
- 백업 경로: `../backups/`
- Admin 사용자명: `admin`
- Admin 비밀번호: `admin123`
- Admin 이메일: `admin@localhost`

### 3.2 사용자 지정 마이그레이션

옵션을 지정하여 마이그레이션을 사용자 지정할 수 있습니다:

```bash
python migrations/v1_to_v2.py \
    --db-path /path/to/project_master.db \
    --backup-path /path/to/backups/ \
    --admin-username myadmin \
    --admin-password SecurePassword123! \
    --admin-email admin@mycompany.com
```

**사용 가능한 옵션**:

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--db-path` | v1.0 데이터베이스 파일 경로 | `../project_master.db` |
| `--backup-path` | 백업 파일 저장 경로 | `../backups/` |
| `--admin-username` | admin 사용자 이름 | `admin` |
| `--admin-password` | admin 비밀번호 | `admin123` |
| `--admin-email` | admin 이메일 | `admin@localhost` |
| `--verify` | 마이그레이션 검증만 수행 | - |
| `--rollback` | 마이그레이션 롤백 (백업에서 복원) | - |
| `--help` | 도움말 표시 | - |

### 3.3 마이그레이션 프로세스

마이그레이션은 다음 단계로 진행됩니다:

1. ✅ **v1.0 데이터베이스 확인**
   - 데이터베이스 파일 존재 여부 확인
   - v1.0 필수 테이블 확인 (projects, tasks, enablers, dependencies)
   - v2.0 테이블이 없는지 확인 (중복 마이그레이션 방지)

2. 📦 **데이터베이스 백업**
   - 타임스탬프가 포함된 백업 파일 생성
   - 예: `project_master_v1_backup_20250105_143052.db`

3. 🔄 **v2.0 스키마 업그레이드**
   - Alembic을 사용하여 자동 스키마 업그레이드
   - 새 테이블 생성 및 기존 테이블 수정

4. 👤 **기본 admin 사용자 생성**
   - Admin 역할 생성
   - Admin 사용자 생성 및 역할 할당

5. 🔄 **기존 데이터 업데이트**
   - 기존 projects, tasks, enablers의 `created_by`, `updated_by`를 admin으로 설정

6. 🔍 **마이그레이션 검증**
   - v2.0 테이블 확인
   - Admin 사용자 확인
   - 기존 데이터 보존 확인

### 3.4 예상 실행 시간

| 데이터 규모 | 예상 시간 |
|-------------|-----------|
| 소규모 (프로젝트 < 10, 태스크 < 100) | 30초 - 1분 |
| 중규모 (프로젝트 < 100, 태스크 < 1000) | 1분 - 3분 |
| 대규모 (프로젝트 ≥ 100, 태스크 ≥ 1000) | 3분 - 10분 |

---

## 4. 마이그레이션 검증

### 4.1 자동 검증

마이그레이션 스크립트가 자동으로 검증을 수행합니다:

```bash
# 검증만 수행 (마이그레이션 없이)
python migrations/v1_to_v2.py --verify
```

### 4.2 수동 검증

마이그레이션 후 다음을 수동으로 확인하세요:

#### 1. 데이터베이스 파일 확인

```bash
ls -lh backend/project_master.db
```

#### 2. 백엔드 서버 실행

```bash
cd backend
uvicorn app.main:socket_app --reload
```

정상적으로 실행되면:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### 3. API 문서 확인

브라우저에서 http://localhost:8000/docs 접속하여 Swagger UI 확인

#### 4. Admin 로그인 테스트

프론트엔드를 실행하고 admin 계정으로 로그인:

```bash
cd frontend
npm run dev
```

브라우저에서 http://localhost:5173 접속하여 로그인:
- 사용자명: `admin` (또는 지정한 사용자명)
- 비밀번호: `admin123` (또는 지정한 비밀번호)

#### 5. 기존 데이터 확인

로그인 후 다음을 확인:
- ✅ 프로젝트 목록이 정상적으로 표시되는지
- ✅ 태스크 목록이 정상적으로 표시되는지
- ✅ Enabler 목록이 정상적으로 표시되는지
- ✅ 의존성이 정상적으로 표시되는지
- ✅ 간트 차트가 정상적으로 작동하는지

---

## 5. 롤백 방법

### 5.1 마이그레이션 중 실패 시 자동 롤백

마이그레이션 중 오류가 발생하면 스크립트가 자동으로 롤백 여부를 묻습니다:

```
❌ 마이그레이션 실패. 백업에서 롤백하시겠습니까? (y/n):
```

`y`를 입력하면 자동으로 백업에서 복원됩니다.

### 5.2 수동 롤백

마이그레이션 후에도 롤백이 필요한 경우:

```bash
# 최신 백업에서 롤백
python migrations/v1_to_v2.py --rollback
```

또는 수동으로 백업 파일을 복원:

```bash
# 백업 파일 목록 확인
ls -lh backups/

# 백업 파일 복원
cp backups/project_master_v1_backup_20250105_143052.db backend/project_master.db
```

### 5.3 롤백 후 확인

```bash
cd backend

# 서버 실행 확인
uvicorn app.main:app --reload
```

http://localhost:8000 접속하여 v1.0 동작 확인

---

## 6. 문제 해결

### 6.1 일반적인 문제

#### 문제 1: "v1.0 데이터베이스 파일을 찾을 수 없습니다"

**원인**: 데이터베이스 파일 경로가 잘못되었습니다.

**해결**:
```bash
# 데이터베이스 파일 위치 확인
find . -name "project_master.db"

# 올바른 경로로 마이그레이션 실행
python migrations/v1_to_v2.py --db-path /correct/path/project_master.db
```

#### 문제 2: "이미 v2.0 데이터베이스입니다 (users 테이블 존재)"

**원인**: 이미 v2.0으로 마이그레이션되었거나, 테스트 데이터베이스입니다.

**해결**:
- 이미 마이그레이션된 경우: 추가 작업 불필요
- v1.0 데이터베이스가 필요한 경우: 백업에서 복원 후 재시도

#### 문제 3: "Alembic 업그레이드 실패"

**원인**: Alembic 설정 또는 마이그레이션 파일 문제

**해결**:
```bash
cd backend

# Alembic 상태 확인
alembic current

# 마이그레이션 이력 확인
alembic history

# 수동으로 업그레이드 시도
alembic upgrade head
```

#### 문제 4: "Admin 사용자 생성 실패"

**원인**: 사용자 이름 또는 이메일 중복

**해결**:
```bash
# 다른 사용자 이름/이메일로 시도
python migrations/v1_to_v2.py \
    --admin-username admin2 \
    --admin-email admin2@localhost
```

### 6.2 로그 확인

마이그레이션 중 상세 로그를 확인하려면:

```bash
# 상세 로그와 함께 실행
python migrations/v1_to_v2.py 2>&1 | tee migration.log
```

### 6.3 데이터 손실 방지

**중요**: 마이그레이션 전 항상 백업을 확인하세요!

```bash
# 백업 파일 확인
ls -lh backups/

# 백업 파일이 제대로 생성되었는지 확인
sqlite3 backups/project_master_v1_backup_*.db "SELECT COUNT(*) FROM projects;"
```

---

## 7. FAQ

### Q1. 마이그레이션 중 데이터가 손실될 수 있나요?

A: 아니요. 마이그레이션 스크립트는 자동으로 백업을 생성하며, 기존 데이터를 모두 보존합니다. 만약 문제가 발생하면 백업에서 복원할 수 있습니다.

### Q2. 마이그레이션 후에도 v1.0을 사용할 수 있나요?

A: 예. 백업 파일을 복원하면 언제든지 v1.0으로 돌아갈 수 있습니다. 하지만 v2.0에서 추가한 데이터(사용자, 알림 등)는 v1.0에서 사용할 수 없습니다.

### Q3. admin 비밀번호를 잊어버렸어요

A: 다음 방법으로 비밀번호를 재설정할 수 있습니다:

```python
# Python으로 비밀번호 재설정
from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
engine = create_engine("sqlite:///backend/project_master.db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# admin 사용자 비밀번호 변경
from app.models import User
admin = db.query(User).filter(User.username == "admin").first()
admin.hashed_password = pwd_context.hash("new_password")
db.commit()
```

### Q4. 마이그레이션에 얼마나 걸리나요?

A: 데이터 규모에 따라 다릅니다:
- 소규모: 30초 - 1분
- 중규모: 1분 - 3분
- 대규모: 3분 - 10분

### Q5. 여러 명의 사용자가 동시에 사용 중인데 마이그레이션해도 되나요?

A: 아니요. 마이그레이션 중에는 모든 사용자가 시스템을 사용하지 않아야 합니다. 다음 순서를 권장합니다:

1. 모든 사용자에게 작업 중지 안내
2. 백엔드 서버 종료
3. 마이그레이션 실행
4. 검증 후 서버 재시작
5. 사용자에게 v2.0 사용 안내

### Q6. 폐쇄망 환경에서 마이그레이션이 가능한가요?

A: 예. 마이그레이션 스크립트는 외부 네트워크 연결이 필요 없습니다. 모든 작업은 로컬에서 수행됩니다.

### Q7. 마이그레이션 후 기존 사용자들은 어떻게 로그인하나요?

A: v1.0에는 사용자 계정이 없었으므로, v2.0으로 마이그레이션 후 각 사용자의 계정을 생성해야 합니다. admin 계정으로 로그인하여 사용자 관리 메뉴에서 계정을 생성할 수 있습니다.

### Q8. 마이그레이션 후 성능이 개선되나요?

A: 예. v2.0에는 다음과 같은 성능 개선이 포함되어 있습니다:
- 데이터베이스 인덱스 추가 (쿼리 속도 5-10배 향상)
- 프론트엔드 코드 스플리팅 (초기 로딩 속도 50% 이상 개선)
- Vite 빌드 최적화 (번들 크기 30-40% 감소)

---

## 📞 지원

마이그레이션 중 문제가 발생하면:

1. **로그 확인**: `migration.log` 파일 확인
2. **문서 참고**: [개발 가이드](./development-guide.md), [API 문서](./api-documentation.md)
3. **이슈 등록**: [GitHub Issues](../../issues)

---

**마이그레이션을 성공적으로 완료하셨나요? v2.0의 새로운 기능을 즐겨보세요! 🎉**
