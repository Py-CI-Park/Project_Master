# Database Schema Design

## 테이블 구조

### 1. projects (프로젝트)
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',  -- active, completed, on_hold
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. tasks (태스크/작업)
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER,
    progress FLOAT DEFAULT 0.0,  -- 0-100
    status VARCHAR(50) DEFAULT 'not_started',  -- not_started, in_progress, completed, delayed
    priority VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, critical
    assignee VARCHAR(100),
    is_milestone BOOLEAN DEFAULT FALSE,
    color VARCHAR(7),  -- Hex color for visualization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 3. enablers (Key Enabler)
```sql
CREATE TABLE enablers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50),  -- document, equipment, resource, approval, etc.
    planned_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, delivered, delayed
    criticality VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, critical
    responsible_person VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 4. dependencies (태스크 간 의존성)
```sql
CREATE TABLE dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    predecessor_task_id INTEGER NOT NULL,
    successor_task_id INTEGER NOT NULL,
    dependency_type VARCHAR(20) DEFAULT 'FS',  -- FS(Finish-Start), SS(Start-Start), FF(Finish-Finish), SF(Start-Finish)
    lag_days INTEGER DEFAULT 0,  -- 지연/선행 일수 (음수 가능)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (predecessor_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (successor_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(predecessor_task_id, successor_task_id)
);
```

### 5. enabler_impacts (Enabler가 태스크에 미치는 영향)
```sql
CREATE TABLE enabler_impacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enabler_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    impact_type VARCHAR(50) DEFAULT 'required',  -- required, optional, enhancing
    impact_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enabler_id) REFERENCES enablers(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(enabler_id, task_id)
);
```

### 6. calendar_events (캘린더 이벤트)
```sql
CREATE TABLE calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    task_id INTEGER,
    enabler_id INTEGER,
    event_type VARCHAR(50),  -- task_start, task_end, milestone, enabler_delivery, meeting
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    all_day BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (enabler_id) REFERENCES enablers(id) ON DELETE SET NULL
);
```

## 인덱스 설계

```sql
-- 프로젝트별 조회 성능 향상
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_enablers_project_id ON enablers(project_id);
CREATE INDEX idx_calendar_events_project_id ON calendar_events(project_id);

-- 날짜 기반 조회 성능 향상
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);
CREATE INDEX idx_enablers_delivery_date ON enablers(planned_delivery_date);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);

-- 의존성 조회 성능 향상
CREATE INDEX idx_dependencies_predecessor ON dependencies(predecessor_task_id);
CREATE INDEX idx_dependencies_successor ON dependencies(successor_task_id);

-- Enabler 영향 조회 성능 향상
CREATE INDEX idx_enabler_impacts_enabler ON enabler_impacts(enabler_id);
CREATE INDEX idx_enabler_impacts_task ON enabler_impacts(task_id);
```

## 주요 관계

### 1:N 관계
- Project → Tasks (한 프로젝트는 여러 태스크를 가짐)
- Project → Enablers (한 프로젝트는 여러 Enabler를 가짐)

### N:N 관계
- Task ↔ Task (dependencies를 통한 다대다 의존성)
- Enabler ↔ Task (enabler_impacts를 통한 다대다 영향 관계)

## 주요 쿼리 패턴

### 크리티컬 패스 계산
```python
# 모든 의존성을 따라가며 최장 경로 계산
# Topological Sort + Dynamic Programming 활용
```

### Enabler 지연 시 영향받는 태스크 조회
```sql
SELECT t.* 
FROM tasks t
JOIN enabler_impacts ei ON t.id = ei.task_id
JOIN enablers e ON ei.enabler_id = e.id
WHERE e.id = ? 
  AND e.status = 'delayed'
  AND t.start_date <= e.actual_delivery_date;
```

### 특정 기간의 캘린더 이벤트 조회
```sql
SELECT * FROM calendar_events
WHERE project_id = ?
  AND event_date BETWEEN ? AND ?
ORDER BY event_date, start_time;
```

## 데이터 무결성 규칙

1. **날짜 검증**: end_date >= start_date
2. **진행률 검증**: 0 <= progress <= 100
3. **순환 의존성 방지**: 의존성 추가 시 그래프에 사이클이 생기지 않도록 검증
4. **Enabler 전달일 검증**: actual_delivery_date는 과거 또는 현재만 가능
