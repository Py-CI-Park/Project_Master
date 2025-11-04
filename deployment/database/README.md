# 데이터베이스 초기화

프로젝트 관리 시스템의 데이터베이스를 초기화하는 방법을 안내합니다.

## 방법 1: Python 스크립트 사용 (권장)

Alembic 마이그레이션을 사용하여 데이터베이스를 초기화합니다.

### 사전 요구사항
- Python 3.10 이상
- 백엔드 의존성 패키지 설치 완료

### 실행 방법

```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상 환경 활성화 (Windows)
venv\Scripts\activate

# 가상 환경 활성화 (Linux/Mac)
source venv/bin/activate

# 데이터베이스 초기화 스크립트 실행
python ../deployment/database/init_db.py
```

## 방법 2: Alembic 직접 사용

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
alembic upgrade head
```

## 데이터베이스 위치

데이터베이스 파일은 다음 위치에 생성됩니다:
- `backend/project_master.db`

## 초기화 후 확인

데이터베이스가 정상적으로 생성되었는지 확인하려면:

```bash
cd backend
sqlite3 project_master.db ".tables"
```

다음 테이블들이 표시되어야 합니다:
- `projects` - 프로젝트 정보
- `tasks` - 태스크 정보
- `enablers` - Key Enabler 정보
- `alembic_version` - 마이그레이션 버전 정보

## 문제 해결

### 데이터베이스 파일이 이미 존재하는 경우
기존 데이터베이스를 삭제하고 다시 초기화하려면:

```bash
rm backend/project_master.db
python deployment/database/init_db.py
```

### 마이그레이션 오류가 발생하는 경우
Alembic 버전을 확인하고 초기화:

```bash
cd backend
alembic current
alembic upgrade head
```
