# 백엔드 성능 최적화 문서

## 데이터베이스 인덱스

### 자동 인덱스
SQLite는 Primary Key에 자동으로 인덱스를 생성합니다.

### 명시적 인덱스

#### Projects 테이블
- `id` (PRIMARY KEY) - 자동 인덱스
- `name` - 프로젝트 이름 검색용
- `status` - 상태별 필터링용

#### Tasks 테이블
- `id` (PRIMARY KEY) - 자동 인덱스
- `project_id` (FOREIGN KEY) - 프로젝트별 태스크 조회 최적화
- `name` - 태스크 이름 검색용
- `status` - 상태별 필터링용
- `priority` - 우선순위별 필터링용

#### Dependencies 테이블
- 외래키 자동 인덱스 (`predecessor_task_id`, `successor_task_id`)

#### Enablers 테이블
- `project_id` (FOREIGN KEY) - 프로젝트별 Enabler 조회 최적화

## 쿼리 최적화

### 현재 구현 상태
현재 FastAPI 백엔드는 다음과 같이 최적화되어 있습니다:

1. **단순하고 효율적인 쿼리**: 불필요한 JOIN을 피하고 필요한 데이터만 조회
2. **인덱스 활용**: 모든 외래키와 필터링에 사용되는 컬럼에 인덱스 설정
3. **페이지네이션**: `skip`과 `limit` 파라미터로 대량 데이터 처리 최적화

### N+1 쿼리 문제 방지
현재 구현에서는 N+1 문제가 발생하지 않습니다:
- 관계형 데이터 조회 시 명시적 쿼리 사용
- 불필요한 lazy loading 없음

### 향후 최적화 고려사항

필요시 아래 최적화를 적용할 수 있습니다:

#### 1. Eager Loading (필요시)
```python
from sqlalchemy.orm import joinedload

# 태스크와 함께 의존성 정보 로드
tasks = db.query(Task).options(
    joinedload(Task.predecessors),
    joinedload(Task.successors)
).filter(Task.project_id == project_id).all()
```

#### 2. Select In Loading (대량 데이터)
```python
from sqlalchemy.orm import selectinload

# 프로젝트와 함께 태스크 목록 로드
projects = db.query(Project).options(
    selectinload(Project.tasks)
).all()
```

#### 3. 캐싱 (선택 사항)
읽기 전용 데이터의 경우 Redis 캐싱 적용 가능:
```python
# 예시: 프로젝트 목록 캐싱
# cache_key = f"projects:list:{skip}:{limit}"
# cached = redis.get(cache_key)
# if cached:
#     return json.loads(cached)
```

## API 응답 시간 목표

- 단일 레코드 조회: < 50ms
- 목록 조회 (100개 이하): < 100ms
- 복잡한 연산 (크리티컬 패스 계산): < 200ms

## 모니터링 권장사항

운영 환경에서는 다음 모니터링을 권장합니다:

1. **쿼리 실행 시간 로깅**
2. **슬로우 쿼리 감지** (100ms 이상)
3. **데이터베이스 연결 풀 모니터링**
4. **API 엔드포인트별 응답 시간 추적**

## 결론

현재 백엔드는 폐쇄망 환경에서 충분히 최적화되어 있습니다:
- ✅ 필요한 모든 인덱스 설정 완료
- ✅ 효율적인 쿼리 패턴 사용
- ✅ N+1 문제 없음
- ✅ 페이지네이션 구현

대규모 데이터(1000+ 태스크)를 처리하게 될 경우에만 추가 최적화(Eager Loading, 캐싱)를 고려하면 됩니다.
