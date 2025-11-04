"""
Calendar Service

캘린더 이벤트 자동 생성 서비스
- 태스크 시작/종료 이벤트 자동 생성
- 마일스톤 이벤트 생성
- Enabler 전달 일정 이벤트 생성
- 기간별 이벤트 조회
"""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.enabler import Enabler
from app.models.project import Project
from app.models.task import Task


class CalendarEvent(BaseModel):
    """캘린더 이벤트 데이터"""

    id: str  # "event-{type}-{id}"
    title: str  # 이벤트 제목
    date: str  # ISO 8601 format: "2024-01-01"
    event_type: str  # "task_start", "task_end", "milestone", "enabler_delivery"
    color: str  # HEX color code
    description: Optional[str] = None
    all_day: bool = True

    # 연관 데이터
    task_id: Optional[int] = None
    enabler_id: Optional[int] = None
    project_id: int

    # 추가 메타데이터
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee: Optional[str] = None


class CalendarData(BaseModel):
    """캘린더 전체 데이터"""

    project_id: int
    project_name: str
    events: List[CalendarEvent]
    start_date: str  # ISO 8601
    end_date: str  # ISO 8601


def generate_calendar_events(
    project_id: int,
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> CalendarData:
    """
    캘린더 이벤트 자동 생성

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션
        start_date: 조회 시작일 (선택, 기본값: 프로젝트 최소 날짜)
        end_date: 조회 종료일 (선택, 기본값: 프로젝트 최대 날짜)

    Returns:
        CalendarData: 캘린더 이벤트 데이터

    Raises:
        ValueError: 프로젝트를 찾을 수 없는 경우
    """
    # 프로젝트 조회
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"프로젝트 ID {project_id}를 찾을 수 없습니다.")

    # 프로젝트의 모든 태스크와 Enabler 조회
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    enablers = db.query(Enabler).filter(Enabler.project_id == project_id).all()

    # 이벤트 생성
    events = []

    # 태스크 이벤트 생성
    task_events = _generate_task_events(tasks)
    events.extend(task_events)

    # Enabler 이벤트 생성
    enabler_events = _generate_enabler_events(enablers)
    events.extend(enabler_events)

    # 날짜 범위 필터링
    if start_date or end_date:
        events = _filter_events_by_date(events, start_date, end_date)

    # 날짜별 정렬
    events.sort(key=lambda e: e.date)

    # 전체 날짜 범위 계산
    if events:
        all_dates = [datetime.fromisoformat(e.date).date() for e in events]
        calculated_start = min(all_dates)
        calculated_end = max(all_dates)
    else:
        calculated_start = date.today()
        calculated_end = date.today()

    return CalendarData(
        project_id=project_id,
        project_name=project.name,
        events=events,
        start_date=calculated_start.isoformat(),
        end_date=calculated_end.isoformat(),
    )


def _generate_task_events(tasks: List[Task]) -> List[CalendarEvent]:
    """
    태스크 기반 이벤트 생성

    Args:
        tasks: 태스크 리스트

    Returns:
        CalendarEvent 리스트 (시작, 종료, 마일스톤 이벤트)
    """
    events = []

    for task in tasks:
        # 마일스톤 이벤트 (우선순위)
        if task.is_milestone and task.end_date:
            events.append(
                CalendarEvent(
                    id=f"event-milestone-{task.id}",
                    title=f"🎯 {task.name}",
                    date=task.end_date.isoformat(),
                    event_type="milestone",
                    color=_get_milestone_color(task),
                    description=f"마일스톤: {task.name}",
                    task_id=task.id,
                    project_id=task.project_id,
                    priority=task.priority,
                    status=task.status,
                    assignee=task.assignee,
                )
            )
        else:
            # 태스크 시작 이벤트
            if task.start_date:
                events.append(
                    CalendarEvent(
                        id=f"event-task-start-{task.id}",
                        title=f"▶️ {task.name}",
                        date=task.start_date.isoformat(),
                        event_type="task_start",
                        color=_get_task_start_color(task),
                        description=f"시작: {task.name}",
                        task_id=task.id,
                        project_id=task.project_id,
                        priority=task.priority,
                        status=task.status,
                        assignee=task.assignee,
                    )
                )

            # 태스크 종료 이벤트
            if task.end_date:
                events.append(
                    CalendarEvent(
                        id=f"event-task-end-{task.id}",
                        title=f"✅ {task.name}",
                        date=task.end_date.isoformat(),
                        event_type="task_end",
                        color=_get_task_end_color(task),
                        description=f"완료: {task.name}",
                        task_id=task.id,
                        project_id=task.project_id,
                        priority=task.priority,
                        status=task.status,
                        assignee=task.assignee,
                    )
                )

    return events


def _generate_enabler_events(enablers: List[Enabler]) -> List[CalendarEvent]:
    """
    Enabler 전달 일정 이벤트 생성

    Args:
        enablers: Enabler 리스트

    Returns:
        CalendarEvent 리스트 (전달 일정 이벤트)
    """
    events = []

    for enabler in enablers:
        # 전달 예정일이 있는 경우에만 이벤트 생성
        if enabler.planned_delivery_date:
            events.append(
                CalendarEvent(
                    id=f"event-enabler-{enabler.id}",
                    title=f"📦 {enabler.name}",
                    date=enabler.planned_delivery_date.date().isoformat(),
                    event_type="enabler_delivery",
                    color=_get_enabler_color(enabler),
                    description=f"Enabler 전달: {enabler.name} ({enabler.type})",
                    enabler_id=enabler.id,
                    project_id=enabler.project_id,
                    priority=enabler.criticality,
                    status=enabler.status,
                )
            )

    return events


def _filter_events_by_date(
    events: List[CalendarEvent],
    start_date: Optional[date],
    end_date: Optional[date],
) -> List[CalendarEvent]:
    """
    날짜 범위로 이벤트 필터링

    Args:
        events: 이벤트 리스트
        start_date: 시작일 (선택)
        end_date: 종료일 (선택)

    Returns:
        필터링된 이벤트 리스트
    """
    filtered_events = []

    for event in events:
        event_date = datetime.fromisoformat(event.date).date()

        # 시작일 체크
        if start_date and event_date < start_date:
            continue

        # 종료일 체크
        if end_date and event_date > end_date:
            continue

        filtered_events.append(event)

    return filtered_events


def _get_milestone_color(task: Task) -> str:
    """
    마일스톤 색상 결정

    Args:
        task: 태스크

    Returns:
        색상 코드 (HEX)
    """
    # 우선순위 기반 색상
    if task.priority == "critical":
        return "#C0392B"  # Dark Red
    elif task.priority == "high":
        return "#E67E22"  # Dark Orange
    elif task.priority == "medium":
        return "#2980B9"  # Dark Blue
    elif task.priority == "low":
        return "#7F8C8D"  # Dark Gray

    # 상태 기반 색상
    if task.status == "completed":
        return "#27AE60"  # Green
    elif task.status == "in_progress":
        return "#F39C12"  # Orange
    else:
        return "#34495E"  # Dark Gray


def _get_task_start_color(task: Task) -> str:
    """
    태스크 시작 이벤트 색상 결정

    Args:
        task: 태스크

    Returns:
        색상 코드 (HEX)
    """
    # 우선순위 기반 색상 (밝은 톤)
    if task.priority == "critical":
        return "#E74C3C"  # Red
    elif task.priority == "high":
        return "#F39C12"  # Orange
    elif task.priority == "medium":
        return "#3498DB"  # Blue
    elif task.priority == "low":
        return "#95A5A6"  # Gray

    return "#3498DB"  # Default Blue


def _get_task_end_color(task: Task) -> str:
    """
    태스크 종료 이벤트 색상 결정

    Args:
        task: 태스크

    Returns:
        색상 코드 (HEX)
    """
    # 상태 기반 색상
    if task.status == "completed":
        return "#27AE60"  # Green
    elif task.status == "in_progress":
        return "#F39C12"  # Orange
    elif task.status == "blocked":
        return "#E74C3C"  # Red
    else:
        return "#95A5A6"  # Gray


def _get_enabler_color(enabler: Enabler) -> str:
    """
    Enabler 이벤트 색상 결정

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

    return "#9B59B6"  # Default Purple


def get_events_by_date_range(
    project_id: int,
    db: Session,
    start_date: date,
    end_date: date,
) -> List[CalendarEvent]:
    """
    특정 날짜 범위의 이벤트 조회

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션
        start_date: 시작일
        end_date: 종료일

    Returns:
        CalendarEvent 리스트

    Raises:
        ValueError: 프로젝트를 찾을 수 없거나 날짜 범위가 잘못된 경우
    """
    if start_date > end_date:
        raise ValueError("시작일은 종료일보다 이전이어야 합니다.")

    calendar_data = generate_calendar_events(
        project_id=project_id,
        db=db,
        start_date=start_date,
        end_date=end_date,
    )

    return calendar_data.events


def get_events_by_month(
    project_id: int,
    db: Session,
    year: int,
    month: int,
) -> List[CalendarEvent]:
    """
    특정 월의 이벤트 조회

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션
        year: 연도
        month: 월 (1-12)

    Returns:
        CalendarEvent 리스트

    Raises:
        ValueError: 프로젝트를 찾을 수 없거나 월이 잘못된 경우
    """
    if not (1 <= month <= 12):
        raise ValueError("월은 1-12 사이여야 합니다.")

    # 해당 월의 시작일과 종료일 계산
    start_date = date(year, month, 1)

    # 다음 월의 첫날 - 1일 = 해당 월의 마지막 날
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    # 종료일을 해당 월의 마지막 날로 조정
    from datetime import timedelta

    end_date = end_date - timedelta(days=1)

    return get_events_by_date_range(
        project_id=project_id,
        db=db,
        start_date=start_date,
        end_date=end_date,
    )
