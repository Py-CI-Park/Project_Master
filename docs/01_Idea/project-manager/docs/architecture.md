# 시스템 아키텍처 문서

## 1. 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 브라우저                          │
│                    (Chrome, Edge, Firefox)                   │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  프론트엔드 (React SPA)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components                                          │   │
│  │  ├─ Gantt Chart (Frappe Gantt)                      │   │
│  │  ├─ Calendar (FullCalendar)                         │   │
│  │  ├─ Dependency Graph (React Flow)                   │   │
│  │  └─ Forms & Lists (Material-UI)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management (Zustand)                         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Client (Axios)                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ REST API (JSON)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  백엔드 (FastAPI)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes                                          │   │
│  │  ├─ /api/projects                                   │   │
│  │  ├─ /api/tasks                                      │   │
│  │  ├─ /api/enablers                                   │   │
│  │  ├─ /api/dependencies                               │   │
│  │  └─ /api/calendar                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic (Services)                          │   │
│  │  ├─ Critical Path Calculator                        │   │
│  │  ├─ Dependency Analyzer                             │   │
│  │  ├─ Gantt Data Generator                            │   │
│  │  └─ Calendar Event Manager                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Access Layer (SQLAlchemy ORM)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ SQL
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  데이터베이스 (SQLite)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  ├─ projects                                        │   │
│  │  ├─ tasks                                           │   │
│  │  ├─ enablers                                        │   │
│  │  ├─ dependencies                                    │   │
│  │  ├─ enabler_impacts                                 │   │
│  │  └─ calendar_events                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 2. 핵심 기능 흐름

### 2.1 간트 차트 렌더링 플로우

```
1. 사용자가 프로젝트 선택
   ↓
2. Frontend: GET /api/projects/{id}/gantt
   ↓
3. Backend: GanttService.generate_gantt_data()
   - 프로젝트의 모든 태스크 조회
   - 의존성 관계 계산
   - Enabler와의 연결 정보 포함
   - 크리티컬 패스 계산
   ↓
4. Backend: JSON 응답 반환
   {
     "tasks": [...],
     "dependencies": [...],
     "enablers": [...],
     "critical_path": [...]
   }
   ↓
5. Frontend: Frappe Gantt 라이브러리로 렌더링
   - 태스크 바 표시
   - Enabler 마커 오버레이
   - 의존성 화살표 그리기
   - 크리티컬 패스 강조
```

### 2.2 Enabler 영향 분석 플로우

```
1. 사용자가 Enabler 지연 입력
   ↓
2. Frontend: PUT /api/enablers/{id}
   {
     "status": "delayed",
     "actual_delivery_date": "2025-12-15"
   }
   ↓
3. Backend: DependencyAnalyzer.analyze_enabler_impact()
   - enabler_impacts 테이블에서 영향받는 태스크 조회
   - 각 태스크의 시작일과 비교
   - 연쇄적으로 영향받는 태스크 추적 (DFS)
   ↓
4. Backend: 영향 분석 결과 반환
   {
     "enabler_id": 1,
     "delayed_days": 10,
     "affected_tasks": [
       {
         "task_id": 5,
         "impact_type": "direct",
         "delay_days": 10
       },
       {
         "task_id": 8,
         "impact_type": "cascading",
         "delay_days": 10
       }
     ],
     "project_delay": 10
   }
   ↓
5. Frontend: 영향받는 태스크 시각화
   - 간트 차트에서 빨간색으로 강조
   - 경고 알림 표시
   - 조정 제안
```

### 2.3 크리티컬 패스 계산 알고리즘

```python
def calculate_critical_path(tasks, dependencies):
    """
    CPM (Critical Path Method) 알고리즘
    
    1. Topological Sort로 태스크 순서 정렬
    2. Forward Pass: 최조 시작 시간 (ES), 최조 완료 시간 (EF) 계산
    3. Backward Pass: 최지 시작 시간 (LS), 최지 완료 시간 (LF) 계산
    4. Slack 계산: Slack = LS - ES (또는 LF - EF)
    5. Slack이 0인 태스크들이 크리티컬 패스
    """
    
    # Step 1: 그래프 구성
    graph = build_dependency_graph(tasks, dependencies)
    
    # Step 2: Topological Sort
    sorted_tasks = topological_sort(graph)
    
    # Step 3: Forward Pass
    for task in sorted_tasks:
        task.ES = max([pred.EF for pred in task.predecessors], default=0)
        task.EF = task.ES + task.duration
    
    # Step 4: Backward Pass
    project_end = max([task.EF for task in tasks])
    for task in reversed(sorted_tasks):
        task.LF = min([succ.LS for succ in task.successors], default=project_end)
        task.LS = task.LF - task.duration
    
    # Step 5: 크리티컬 패스 식별
    critical_tasks = [task for task in tasks if task.LS == task.ES]
    
    return critical_tasks
```

## 3. 데이터 흐름

### 3.1 CRUD 작업 표준 플로우

```
CREATE:
Frontend Form → POST /api/{resource} → Service Layer → DB Insert → 201 Created

READ:
Component Mount → GET /api/{resource}/{id} → Service Layer → DB Select → 200 OK

UPDATE:
Frontend Form → PUT /api/{resource}/{id} → Service Layer → DB Update → 200 OK

DELETE:
User Action → DELETE /api/{resource}/{id} → Service Layer → DB Delete → 204 No Content
```

### 3.2 실시간 업데이트 전략

폐쇄망 환경에서는 WebSocket이 제한적일 수 있으므로, 폴링 방식 사용:

```javascript
// Frontend: useEffect with polling
useEffect(() => {
  const interval = setInterval(() => {
    fetchLatestData();
  }, 30000); // 30초마다 업데이트
  
  return () => clearInterval(interval);
}, []);
```

## 4. 보안 고려사항

### 4.1 폐쇄망 환경 보안

1. **인증/인가** (선택적 구현)
   - JWT 기반 토큰 인증
   - 로컬 사용자 DB 관리
   - 역할 기반 접근 제어 (RBAC)

2. **데이터 암호화**
   - SQLite DB 암호화 옵션 (SQLCipher)
   - 중요 필드 애플리케이션 레벨 암호화

3. **감사 로그**
   - 모든 변경 사항 로깅
   - 사용자 행동 추적

### 4.2 API 보안

```python
# Rate Limiting
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/projects")
@limiter.limit("100/minute")
async def get_projects():
    pass

# Input Validation
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    start_date: date
    end_date: date
    
    @validator('end_date')
    def end_after_start(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
```

## 5. 성능 최적화

### 5.1 데이터베이스 최적화

```sql
-- 적절한 인덱스 생성
CREATE INDEX idx_tasks_project_dates ON tasks(project_id, start_date, end_date);
CREATE INDEX idx_dependencies_both ON dependencies(predecessor_task_id, successor_task_id);

-- 쿼리 최적화: N+1 문제 해결
SELECT t.*, 
       GROUP_CONCAT(d.successor_task_id) as successors,
       GROUP_CONCAT(ei.enabler_id) as enablers
FROM tasks t
LEFT JOIN dependencies d ON t.id = d.predecessor_task_id
LEFT JOIN enabler_impacts ei ON t.id = ei.task_id
WHERE t.project_id = ?
GROUP BY t.id;
```

### 5.2 프론트엔드 최적화

```typescript
// 메모이제이션으로 불필요한 재렌더링 방지
const GanttChart = memo(({ tasks, dependencies }) => {
  const ganttData = useMemo(() => {
    return processGanttData(tasks, dependencies);
  }, [tasks, dependencies]);
  
  return <Gantt data={ganttData} />;
});

// 가상 스크롤링 (대량 태스크 처리)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={50}
>
  {TaskRow}
</FixedSizeList>
```

## 6. 확장성 고려

### 6.1 모듈화 설계

각 기능을 독립적인 모듈로 분리하여 향후 확장 용이:

```
- 간트 차트 모듈
- 캘린더 모듈
- 리포트 모듈
- 임포트/익스포트 모듈
- 사용자 관리 모듈 (선택)
```

### 6.2 플러그인 아키텍처 (향후)

```python
# 플러그인 인터페이스 정의
class ReportPlugin:
    def generate(self, project_id: int) -> bytes:
        raise NotImplementedError

# 플러그인 등록
plugins = {
    'pdf': PDFReportPlugin(),
    'excel': ExcelReportPlugin(),
    'word': WordReportPlugin()
}
```

## 7. 배포 아키텍처

### 7.1 단일 서버 배포 (권장)

```
┌─────────────────────────────────────┐
│     단일 서버 (Windows/Linux)       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Uvicorn (Backend)           │  │
│  │  Port: 8000                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Static File Server          │  │
│  │  (React Build)               │  │
│  │  Port: 5173                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  SQLite Database             │  │
│  │  File: data/db.sqlite        │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 7.2 Docker 배포 (선택)

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
  
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
```

## 8. 모니터링 및 로깅

```python
# 구조화된 로깅
import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("project_manager")
handler = RotatingFileHandler(
    'logs/app.log', 
    maxBytes=10_000_000,  # 10MB
    backupCount=5
)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# 성능 모니터링
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {duration:.3f}s")
    return response
```
