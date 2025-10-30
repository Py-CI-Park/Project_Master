"""
Gantt Chart Data Service

간트 차트 시각화를 위한 데이터 생성 서비스
- 태스크 데이터 변환 (Frappe Gantt 형식)
- Enabler 마커 데이터 생성
- 의존성 선 데이터 생성
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.dependency import Dependency
from app.models.enabler import Enabler
from app.models.project import Project
from app.models.task import Task


class GanttTask(BaseModel):
    """Gantt 차트 태스크 데이터"""

    id: str  # "task-{task_id}"
    name: str
    start: str  # ISO 8601 format: "2024-01-01"
    end: str  # ISO 8601 format: "2024-01-10"
    progress: float  # 0-100
    dependencies: str  # "task-1, task-2" (comma-separated)
    custom_class: str  # CSS class for styling
    task_id: int  # Original task ID
    status: str  # Task status
    priority: str  # Task priority
    assignee: Optional[str] = None
    color: Optional[str] = None


class GanttMarker(BaseModel):
    """Gantt 차트 마커 (Enabler 전달 일정 등)"""

    id: str  # "marker-{enabler_id}"
    name: str
    date: str  # ISO 8601 format: "2024-01-15"
    marker_type: str  # "enabler", "milestone", "event"
    enabler_id: Optional[int] = None
    enabler_type: Optional[str] = None
    status: Optional[str] = None
    criticality: Optional[str] = None
    color: Optional[str] = None


class GanttDependency(BaseModel):
    """Gantt 차트 의존성 선 데이터"""

    id: str  # "dep-{dependency_id}"
    source: str  # "task-1"
    target: str  # "task-2"
    dependency_type: str  # FS, SS, FF, SF
    lag_days: int


class GanttChartData(BaseModel):
    """Gantt 차트 전체 데이터"""

    project_id: int
    project_name: str
    tasks: List[GanttTask]
    markers: List[GanttMarker]
    dependencies: List[GanttDependency]
    view_mode: str = "Day"  # Day, Week, Month
    date_format: str = "YYYY-MM-DD"


def generate_gantt_data(
    project_id: int, db: Session, include_markers: bool = True
) -> GanttChartData:
    """
    Gantt 차트 데이터 생성

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션
        include_markers: Enabler 마커 포함 여부

    Returns:
        GanttChartData: Gantt 차트 렌더링용 데이터

    Raises:
        ValueError: 프로젝트를 찾을 수 없는 경우
    """
    # 프로젝트 조회
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"프로젝트 ID {project_id}를 찾을 수 없습니다.")

    # 프로젝트의 태스크, 의존성, Enabler 조회
    tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.start_date).all()

    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .all()
    )

    # Gantt 태스크 데이터 변환
    gantt_tasks = _convert_tasks_to_gantt(tasks, dependencies)

    # Gantt 의존성 데이터 생성
    gantt_dependencies = _convert_dependencies_to_gantt(dependencies)

    # Gantt 마커 데이터 생성
    gantt_markers = []
    if include_markers:
        enablers = db.query(Enabler).filter(Enabler.project_id == project_id).all()
        gantt_markers = _convert_enablers_to_markers(enablers)

    return GanttChartData(
        project_id=project_id,
        project_name=project.name,
        tasks=gantt_tasks,
        markers=gantt_markers,
        dependencies=gantt_dependencies,
    )


def _convert_tasks_to_gantt(tasks: List[Task], dependencies: List[Dependency]) -> List[GanttTask]:
    """
    태스크를 Gantt 차트 형식으로 변환

    Args:
        tasks: 태스크 리스트
        dependencies: 의존성 리스트

    Returns:
        GanttTask 리스트
    """
    # 의존성 맵 구축 (successor -> predecessors)
    dependency_map = {}
    for dep in dependencies:
        if dep.successor_task_id not in dependency_map:
            dependency_map[dep.successor_task_id] = []
        dependency_map[dep.successor_task_id].append(dep.predecessor_task_id)

    gantt_tasks = []
    for task in tasks:
        # 날짜 처리
        start_date = task.start_date if task.start_date else date.today()
        end_date = task.end_date if task.end_date else start_date

        # 의존성 문자열 생성
        predecessors = dependency_map.get(task.id, [])
        dependencies_str = ", ".join([f"task-{pred_id}" for pred_id in predecessors])

        # Custom class (상태 및 우선순위 기반)
        custom_class = _get_task_custom_class(task)

        # 색상 결정
        color = task.color if task.color else _get_default_task_color(task)

        gantt_tasks.append(
            GanttTask(
                id=f"task-{task.id}",
                name=task.name,
                start=start_date.isoformat(),
                end=end_date.isoformat(),
                progress=task.progress or 0.0,
                dependencies=dependencies_str,
                custom_class=custom_class,
                task_id=task.id,
                status=task.status,
                priority=task.priority or "medium",
                assignee=task.assignee,
                color=color,
            )
        )

    return gantt_tasks


def _convert_enablers_to_markers(enablers: List[Enabler]) -> List[GanttMarker]:
    """
    Enabler를 Gantt 차트 마커로 변환

    Args:
        enablers: Enabler 리스트

    Returns:
        GanttMarker 리스트
    """
    gantt_markers = []

    for enabler in enablers:
        # 전달 예정일이 있는 경우에만 마커 생성
        if enabler.delivery_date:
            # 색상 결정 (상태 및 중요도 기반)
            color = _get_enabler_marker_color(enabler)

            gantt_markers.append(
                GanttMarker(
                    id=f"marker-{enabler.id}",
                    name=enabler.name,
                    date=enabler.delivery_date.isoformat(),
                    marker_type="enabler",
                    enabler_id=enabler.id,
                    enabler_type=enabler.type,
                    status=enabler.status,
                    criticality=enabler.criticality,
                    color=color,
                )
            )

    return gantt_markers


def _convert_dependencies_to_gantt(dependencies: List[Dependency]) -> List[GanttDependency]:
    """
    의존성을 Gantt 차트 의존성 선 데이터로 변환

    Args:
        dependencies: 의존성 리스트

    Returns:
        GanttDependency 리스트
    """
    gantt_dependencies = []

    for dep in dependencies:
        gantt_dependencies.append(
            GanttDependency(
                id=f"dep-{dep.id}",
                source=f"task-{dep.predecessor_task_id}",
                target=f"task-{dep.successor_task_id}",
                dependency_type=dep.dependency_type,
                lag_days=dep.lag_days,
            )
        )

    return gantt_dependencies


def _get_task_custom_class(task: Task) -> str:
    """
    태스크 상태 및 속성 기반 CSS 클래스 결정

    Args:
        task: 태스크

    Returns:
        CSS class 문자열
    """
    classes = []

    # 상태 기반 클래스
    if task.status == "completed":
        classes.append("bar-completed")
    elif task.status == "in_progress":
        classes.append("bar-in-progress")
    elif task.status == "blocked":
        classes.append("bar-blocked")
    elif task.status == "not_started":
        classes.append("bar-not-started")

    # 우선순위 기반 클래스
    if task.priority == "critical":
        classes.append("bar-critical")
    elif task.priority == "high":
        classes.append("bar-high")

    # 마일스톤 여부
    if task.is_milestone:
        classes.append("bar-milestone")

    return " ".join(classes) if classes else "bar-task"


def _get_default_task_color(task: Task) -> str:
    """
    태스크 기본 색상 결정

    Args:
        task: 태스크

    Returns:
        색상 코드 (HEX)
    """
    # 우선순위 기반 색상
    if task.priority == "critical":
        return "#E74C3C"  # Red
    elif task.priority == "high":
        return "#F39C12"  # Orange
    elif task.priority == "medium":
        return "#3498DB"  # Blue
    elif task.priority == "low":
        return "#95A5A6"  # Gray

    # 상태 기반 색상
    if task.status == "completed":
        return "#27AE60"  # Green
    elif task.status == "in_progress":
        return "#3498DB"  # Blue
    elif task.status == "blocked":
        return "#E74C3C"  # Red
    else:
        return "#95A5A6"  # Gray


def _get_enabler_marker_color(enabler: Enabler) -> str:
    """
    Enabler 마커 색상 결정

    Args:
        enabler: Enabler

    Returns:
        색상 코드 (HEX)
    """
    # 상태 기반 색상
    if enabler.status == "delivered":
        return "#27AE60"  # Green
    elif enabler.status == "delayed":
        return "#E74C3C"  # Red
    elif enabler.status == "in_progress":
        return "#F39C12"  # Orange
    elif enabler.status == "requested":
        return "#3498DB"  # Blue
    elif enabler.status == "cancelled":
        return "#95A5A6"  # Gray

    # 중요도 기반 색상
    if enabler.criticality == "critical":
        return "#E74C3C"  # Red
    elif enabler.criticality == "high":
        return "#F39C12"  # Orange
    elif enabler.criticality == "medium":
        return "#3498DB"  # Blue
    elif enabler.criticality == "low":
        return "#95A5A6"  # Gray

    return "#95A5A6"  # Default Gray


def get_gantt_view_data(
    project_id: int,
    db: Session,
    view_mode: str = "Day",
    date_range: Optional[Dict[str, str]] = None,
) -> GanttChartData:
    """
    Gantt 차트 뷰 데이터 생성 (필터링 및 뷰 모드 적용)

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션
        view_mode: 뷰 모드 ("Day", "Week", "Month", "Year")
        date_range: 날짜 범위 필터 {"start": "2024-01-01", "end": "2024-12-31"}

    Returns:
        GanttChartData: 필터링된 Gantt 차트 데이터

    Raises:
        ValueError: 프로젝트를 찾을 수 없거나 잘못된 뷰 모드
    """
    if view_mode not in ["Day", "Week", "Month", "Year"]:
        raise ValueError("view_mode는 'Day', 'Week', 'Month', 'Year' 중 하나여야 합니다.")

    # 기본 Gantt 데이터 생성
    gantt_data = generate_gantt_data(project_id, db)
    gantt_data.view_mode = view_mode

    # 날짜 범위 필터링
    if date_range:
        start_filter = datetime.fromisoformat(date_range["start"]).date()
        end_filter = datetime.fromisoformat(date_range["end"]).date()

        # 태스크 필터링
        filtered_tasks = []
        for task in gantt_data.tasks:
            task_start = datetime.fromisoformat(task.start).date()
            task_end = datetime.fromisoformat(task.end).date()

            # 태스크가 날짜 범위와 겹치는 경우만 포함
            if task_end >= start_filter and task_start <= end_filter:
                filtered_tasks.append(task)

        gantt_data.tasks = filtered_tasks

        # 마커 필터링
        filtered_markers = []
        for marker in gantt_data.markers:
            marker_date = datetime.fromisoformat(marker.date).date()
            if start_filter <= marker_date <= end_filter:
                filtered_markers.append(marker)

        gantt_data.markers = filtered_markers

    return gantt_data
