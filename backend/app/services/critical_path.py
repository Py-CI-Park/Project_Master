"""
Critical Path Method (CPM) Service

프로젝트의 크리티컬 패스를 계산하는 서비스
- Topological Sort (위상 정렬)
- Forward Pass (최조 시작/완료 시간 계산)
- Backward Pass (최후 시작/완료 시간 계산)
- Slack 계산 (여유 시간)
- Critical Path 식별
"""

from collections import defaultdict, deque
from datetime import date, timedelta
from typing import Dict, List, Optional, Set, Tuple

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.dependency import Dependency
from app.models.project import Project
from app.models.task import Task


class TaskSchedule(BaseModel):
    """태스크 일정 정보"""

    task_id: int
    task_name: str
    duration_days: int
    earliest_start: date
    earliest_finish: date
    latest_start: date
    latest_finish: date
    total_slack: int
    free_slack: int
    is_critical: bool


class CriticalPathResult(BaseModel):
    """크리티컬 패스 계산 결과"""

    project_id: int
    project_name: str
    tasks: List[TaskSchedule]
    critical_path: List[int]  # task_ids in order
    project_duration: int  # in days
    has_circular_dependency: bool
    error_message: Optional[str] = None


def calculate_critical_path(project_id: int, db: Session) -> CriticalPathResult:
    """
    프로젝트의 크리티컬 패스 계산

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션

    Returns:
        CriticalPathResult: 크리티컬 패스 계산 결과

    Raises:
        ValueError: 프로젝트를 찾을 수 없거나 태스크가 없는 경우
    """
    # 프로젝트 조회
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"프로젝트 ID {project_id}를 찾을 수 없습니다.")

    # 프로젝트의 태스크와 의존성 조회
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    if not tasks:
        raise ValueError(f"프로젝트 ID {project_id}에 태스크가 없습니다.")

    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .all()
    )

    # 의존성 그래프 구축
    graph, reverse_graph = _build_dependency_graph(tasks, dependencies)

    # Topological Sort (순환 의존성 검증)
    try:
        sorted_task_ids = _topological_sort(tasks, graph)
    except ValueError as e:
        return CriticalPathResult(
            project_id=project_id,
            project_name=project.name,
            tasks=[],
            critical_path=[],
            project_duration=0,
            has_circular_dependency=True,
            error_message=str(e),
        )

    # Forward Pass (ES, EF 계산)
    forward_results = _forward_pass(tasks, dependencies, sorted_task_ids, graph)

    # Backward Pass (LS, LF 계산)
    backward_results = _backward_pass(
        tasks, dependencies, sorted_task_ids, forward_results, reverse_graph
    )

    # Slack 계산
    slack_results = _calculate_slack(forward_results, backward_results)

    # Critical Path 식별
    critical_path = _identify_critical_path(sorted_task_ids, slack_results)

    # 결과 생성
    task_dict = {task.id: task for task in tasks}
    task_schedules = []

    for task_id in sorted_task_ids:
        task = task_dict[task_id]
        es, ef = forward_results[task_id]
        ls, lf = backward_results[task_id]
        total_slack, free_slack = slack_results[task_id]

        task_schedules.append(
            TaskSchedule(
                task_id=task_id,
                task_name=task.name,
                duration_days=task.duration_days or 1,
                earliest_start=es,
                earliest_finish=ef,
                latest_start=ls,
                latest_finish=lf,
                total_slack=total_slack,
                free_slack=free_slack,
                is_critical=(task_id in critical_path),
            )
        )

    # 프로젝트 총 소요 기간 계산
    if task_schedules:
        project_duration = max(schedule.earliest_finish for schedule in task_schedules)
        project_start = min(schedule.earliest_start for schedule in task_schedules)
        duration_days = (project_duration - project_start).days + 1
    else:
        duration_days = 0

    return CriticalPathResult(
        project_id=project_id,
        project_name=project.name,
        tasks=task_schedules,
        critical_path=critical_path,
        project_duration=duration_days,
        has_circular_dependency=False,
    )


def _build_dependency_graph(
    tasks: List[Task], dependencies: List[Dependency]
) -> Tuple[Dict[int, List[Tuple[int, Dependency]]], Dict[int, List[Tuple[int, Dependency]]]]:
    """
    의존성 그래프 구축

    Args:
        tasks: 태스크 리스트
        dependencies: 의존성 리스트

    Returns:
        graph: {task_id: [(successor_id, dependency), ...]}
        reverse_graph: {task_id: [(predecessor_id, dependency), ...]}
    """
    graph = defaultdict(list)  # predecessor -> successors
    reverse_graph = defaultdict(list)  # successor -> predecessors

    # 모든 태스크를 그래프에 포함
    for task in tasks:
        if task.id not in graph:
            graph[task.id] = []
        if task.id not in reverse_graph:
            reverse_graph[task.id] = []

    # 의존성 추가
    for dep in dependencies:
        graph[dep.predecessor_task_id].append((dep.successor_task_id, dep))
        reverse_graph[dep.successor_task_id].append((dep.predecessor_task_id, dep))

    return dict(graph), dict(reverse_graph)


def _topological_sort(
    tasks: List[Task], graph: Dict[int, List[Tuple[int, Dependency]]]
) -> List[int]:
    """
    위상 정렬 (Topological Sort) - Kahn's Algorithm

    Args:
        tasks: 태스크 리스트
        graph: 의존성 그래프

    Returns:
        정렬된 task_id 리스트

    Raises:
        ValueError: 순환 의존성이 있는 경우
    """
    # In-degree 계산
    in_degree = {task.id: 0 for task in tasks}
    for task_id in graph:
        for successor_id, _ in graph[task_id]:
            in_degree[successor_id] = in_degree.get(successor_id, 0) + 1

    # In-degree가 0인 노드들로 시작
    queue = deque([task_id for task_id, degree in in_degree.items() if degree == 0])
    sorted_tasks = []

    while queue:
        task_id = queue.popleft()
        sorted_tasks.append(task_id)

        # 후속 태스크들의 in-degree 감소
        for successor_id, _ in graph.get(task_id, []):
            in_degree[successor_id] -= 1
            if in_degree[successor_id] == 0:
                queue.append(successor_id)

    # 순환 의존성 검증
    if len(sorted_tasks) != len(tasks):
        raise ValueError("순환 의존성(Circular Dependency)이 감지되었습니다.")

    return sorted_tasks


def _forward_pass(
    tasks: List[Task],
    dependencies: List[Dependency],
    sorted_task_ids: List[int],
    graph: Dict[int, List[Tuple[int, Dependency]]],
) -> Dict[int, Tuple[date, date]]:
    """
    Forward Pass: 최조 시작 시간(ES)과 최조 완료 시간(EF) 계산

    Args:
        tasks: 태스크 리스트
        dependencies: 의존성 리스트
        sorted_task_ids: 위상 정렬된 task_id 리스트
        graph: 의존성 그래프

    Returns:
        {task_id: (earliest_start, earliest_finish)}
    """
    task_dict = {task.id: task for task in tasks}
    results = {}

    # 프로젝트 시작일 (가장 빠른 태스크 시작일 또는 오늘)
    project_start = date.today()
    for task in tasks:
        if task.start_date and task.start_date < project_start:
            project_start = task.start_date

    for task_id in sorted_task_ids:
        task = task_dict[task_id]
        duration = task.duration_days or 1

        # 선행 태스크가 없으면 프로젝트 시작일 또는 태스크 시작일
        if task_id not in [succ_id for _, successors in graph.items() for succ_id, _ in successors]:
            es = task.start_date if task.start_date else project_start
        else:
            # 모든 선행 태스크의 제약 조건 중 최대값
            es = project_start
            for pred_id, successors in graph.items():
                for succ_id, dep in successors:
                    if succ_id == task_id:
                        pred_es, pred_ef = results[pred_id]
                        # 의존성 타입에 따른 계산
                        if dep.dependency_type == "FS":  # Finish-Start
                            constraint = pred_ef + timedelta(days=dep.lag_days + 1)
                        elif dep.dependency_type == "SS":  # Start-Start
                            constraint = pred_es + timedelta(days=dep.lag_days)
                        elif dep.dependency_type == "FF":  # Finish-Finish
                            constraint = pred_ef + timedelta(days=dep.lag_days - duration + 1)
                        elif dep.dependency_type == "SF":  # Start-Finish
                            constraint = pred_es + timedelta(days=dep.lag_days - duration + 1)
                        else:
                            constraint = pred_ef + timedelta(days=dep.lag_days + 1)

                        if constraint > es:
                            es = constraint

        ef = es + timedelta(days=duration - 1)
        results[task_id] = (es, ef)

    return results


def _backward_pass(
    tasks: List[Task],
    dependencies: List[Dependency],
    sorted_task_ids: List[int],
    forward_results: Dict[int, Tuple[date, date]],
    reverse_graph: Dict[int, List[Tuple[int, Dependency]]],
) -> Dict[int, Tuple[date, date]]:
    """
    Backward Pass: 최후 시작 시간(LS)과 최후 완료 시간(LF) 계산

    Args:
        tasks: 태스크 리스트
        dependencies: 의존성 리스트
        sorted_task_ids: 위상 정렬된 task_id 리스트
        forward_results: Forward Pass 결과
        reverse_graph: 역방향 의존성 그래프

    Returns:
        {task_id: (latest_start, latest_finish)}
    """
    task_dict = {task.id: task for task in tasks}
    results = {}

    # 역순으로 처리
    for task_id in reversed(sorted_task_ids):
        task = task_dict[task_id]
        duration = task.duration_days or 1
        es, ef = forward_results[task_id]

        # 후속 태스크가 없으면 EF = LF
        if task_id not in reverse_graph or not reverse_graph[task_id]:
            lf = ef
        else:
            # 모든 후속 태스크의 제약 조건 중 최소값
            lf = ef
            min_constraint = None

            for succ_id, dep in [(s, d) for s_list in [reverse_graph[task_id]] for s, d in s_list]:
                if succ_id in results:
                    succ_ls, succ_lf = results[succ_id]

                    # 의존성 타입에 따른 계산
                    if dep.dependency_type == "FS":  # Finish-Start
                        constraint = succ_ls - timedelta(days=dep.lag_days + 1)
                    elif dep.dependency_type == "SS":  # Start-Start
                        constraint = (
                            succ_ls - timedelta(days=dep.lag_days) + timedelta(days=duration - 1)
                        )
                    elif dep.dependency_type == "FF":  # Finish-Finish
                        constraint = succ_lf - timedelta(days=dep.lag_days)
                    elif dep.dependency_type == "SF":  # Start-Finish
                        constraint = (
                            succ_lf - timedelta(days=dep.lag_days) + timedelta(days=duration - 1)
                        )
                    else:
                        constraint = succ_ls - timedelta(days=dep.lag_days + 1)

                    if min_constraint is None or constraint < min_constraint:
                        min_constraint = constraint

            if min_constraint is not None:
                lf = min_constraint

        ls = lf - timedelta(days=duration - 1)
        results[task_id] = (ls, lf)

    return results


def _calculate_slack(
    forward_results: Dict[int, Tuple[date, date]],
    backward_results: Dict[int, Tuple[date, date]],
) -> Dict[int, Tuple[int, int]]:
    """
    Slack (여유 시간) 계산

    Args:
        forward_results: Forward Pass 결과
        backward_results: Backward Pass 결과

    Returns:
        {task_id: (total_slack, free_slack)}
    """
    results = {}

    for task_id in forward_results:
        es, ef = forward_results[task_id]
        ls, lf = backward_results[task_id]

        # Total Slack = LS - ES = LF - EF
        total_slack = (ls - es).days

        # Free Slack은 후속 태스크 고려 필요 (여기서는 Total Slack과 동일하게 계산)
        # 정확한 Free Slack은 후속 태스크의 ES를 고려해야 하지만,
        # 간단히 Total Slack으로 대체
        free_slack = total_slack

        results[task_id] = (total_slack, free_slack)

    return results


def _identify_critical_path(
    sorted_task_ids: List[int],
    slack_results: Dict[int, Tuple[int, int]],
) -> List[int]:
    """
    Critical Path 식별 (Slack이 0인 태스크들)

    Args:
        sorted_task_ids: 위상 정렬된 task_id 리스트
        slack_results: Slack 계산 결과

    Returns:
        Critical path에 속한 task_id 리스트
    """
    critical_path = []

    for task_id in sorted_task_ids:
        total_slack, _ = slack_results[task_id]
        if total_slack == 0:
            critical_path.append(task_id)

    return critical_path
