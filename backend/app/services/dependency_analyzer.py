"""
Dependency Analyzer Service

태스크 의존성 분석 서비스
- 의존성 그래프 생성
- 순환 의존성 검증
- 영향 분석 (DFS)
"""

from collections import defaultdict, deque
from typing import Any, Dict, List, Set, Tuple

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.dependency import Dependency
from app.models.task import Task


class DependencyNode(BaseModel):
    """의존성 그래프 노드"""

    task_id: int
    task_name: str
    predecessors: List[int]  # 선행 태스크 ID 목록
    successors: List[int]  # 후속 태스크 ID 목록


class DependencyGraphResult(BaseModel):
    """의존성 그래프 결과"""

    project_id: int
    nodes: List[DependencyNode]
    edges: List[Dict[str, Any]]  # 시각화용 엣지 정보


class CircularDependencyCheck(BaseModel):
    """순환 의존성 검증 결과"""

    has_circular: bool
    circular_path: List[int]  # 순환 경로 (task_id 리스트)
    error_message: str = ""


class ImpactAnalysisResult(BaseModel):
    """영향 분석 결과"""

    source_task_id: int
    source_task_name: str
    impacted_tasks: List[Dict[str, Any]]  # 영향받는 태스크 목록
    impact_depth: Dict[int, int]  # {task_id: depth} - 영향 깊이


def generate_dependency_graph(project_id: int, db: Session) -> DependencyGraphResult:
    """
    의존성 그래프 생성

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션

    Returns:
        DependencyGraphResult: 의존성 그래프 데이터

    Raises:
        ValueError: 프로젝트를 찾을 수 없는 경우
    """
    # 프로젝트의 태스크와 의존성 조회
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    if not tasks:
        return DependencyGraphResult(project_id=project_id, nodes=[], edges=[])

    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .all()
    )

    # 그래프 구조 구축
    task_dict = {task.id: task for task in tasks}
    predecessors_map = defaultdict(list)
    successors_map = defaultdict(list)

    for dep in dependencies:
        predecessors_map[dep.successor_task_id].append(dep.predecessor_task_id)
        successors_map[dep.predecessor_task_id].append(dep.successor_task_id)

    # 노드 생성
    nodes = []
    for task in tasks:
        nodes.append(
            DependencyNode(
                task_id=task.id,
                task_name=task.name,
                predecessors=predecessors_map.get(task.id, []),
                successors=successors_map.get(task.id, []),
            )
        )

    # 엣지 생성 (시각화용)
    edges = []
    for dep in dependencies:
        pred_task = task_dict.get(dep.predecessor_task_id)
        succ_task = task_dict.get(dep.successor_task_id)

        if pred_task and succ_task:
            edges.append(
                {
                    "id": f"edge-{dep.id}",
                    "source": dep.predecessor_task_id,
                    "target": dep.successor_task_id,
                    "source_name": pred_task.name,
                    "target_name": succ_task.name,
                    "dependency_type": dep.dependency_type,
                    "lag_days": dep.lag_days,
                }
            )

    return DependencyGraphResult(project_id=project_id, nodes=nodes, edges=edges)


def check_circular_dependency(
    new_predecessor_id: int, new_successor_id: int, db: Session
) -> CircularDependencyCheck:
    """
    순환 의존성 검증

    새로운 의존성을 추가할 때 순환이 발생하는지 검증합니다.

    Args:
        new_predecessor_id: 새로운 선행 태스크 ID
        new_successor_id: 새로운 후속 태스크 ID
        db: 데이터베이스 세션

    Returns:
        CircularDependencyCheck: 순환 의존성 검증 결과
    """
    # 태스크 조회
    predecessor = db.query(Task).filter(Task.id == new_predecessor_id).first()
    successor = db.query(Task).filter(Task.id == new_successor_id).first()

    if not predecessor or not successor:
        return CircularDependencyCheck(
            has_circular=False,
            circular_path=[],
            error_message="태스크를 찾을 수 없습니다.",
        )

    # 동일한 프로젝트인지 확인
    if predecessor.project_id != successor.project_id:
        return CircularDependencyCheck(
            has_circular=False,
            circular_path=[],
            error_message="서로 다른 프로젝트의 태스크입니다.",
        )

    project_id = predecessor.project_id

    # 현재 의존성 조회
    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .all()
    )

    # 그래프 구축 (새로운 의존성 포함)
    graph = defaultdict(list)
    for dep in dependencies:
        graph[dep.predecessor_task_id].append(dep.successor_task_id)

    # 새로운 의존성 추가
    graph[new_predecessor_id].append(new_successor_id)

    # DFS로 순환 검증
    visited = set()
    rec_stack = set()
    path = []

    def dfs(node: int) -> bool:
        """DFS로 순환 검증"""
        visited.add(node)
        rec_stack.add(node)
        path.append(node)

        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
            elif neighbor in rec_stack:
                # 순환 발견
                cycle_start = path.index(neighbor)
                circular_path = path[cycle_start:] + [neighbor]
                return True

        path.pop()
        rec_stack.remove(node)
        return False

    # 새로운 successor부터 DFS 시작
    if dfs(new_successor_id):
        # 순환 경로에서 new_predecessor_id가 포함되어 있는지 확인
        if new_predecessor_id in path:
            cycle_start = path.index(new_predecessor_id)
            circular_path = path[cycle_start:] + [new_predecessor_id]

            # 태스크 이름 조회
            task_names = []
            for task_id in circular_path:
                task = db.query(Task).filter(Task.id == task_id).first()
                if task:
                    task_names.append(f"{task.name}(ID:{task_id})")

            error_msg = f"순환 의존성이 감지되었습니다: {' → '.join(task_names)}"

            return CircularDependencyCheck(
                has_circular=True, circular_path=circular_path, error_message=error_msg
            )

    return CircularDependencyCheck(has_circular=False, circular_path=[])


def analyze_task_impact(task_id: int, db: Session) -> ImpactAnalysisResult:
    """
    태스크 변경 영향 분석

    특정 태스크가 변경되었을 때 영향받는 모든 후속 태스크를 분석합니다.
    (BFS 방식으로 의존성 체인 추적)

    Args:
        task_id: 분석 대상 태스크 ID
        db: 데이터베이스 세션

    Returns:
        ImpactAnalysisResult: 영향 분석 결과

    Raises:
        ValueError: 태스크를 찾을 수 없는 경우
    """
    # 태스크 조회
    source_task = db.query(Task).filter(Task.id == task_id).first()
    if not source_task:
        raise ValueError(f"태스크 ID {task_id}를 찾을 수 없습니다.")

    project_id = source_task.project_id

    # 프로젝트의 모든 의존성 조회
    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .all()
    )

    # 그래프 구축 (successor 방향)
    graph = defaultdict(list)
    for dep in dependencies:
        graph[dep.predecessor_task_id].append(dep.successor_task_id)

    # BFS로 영향받는 태스크 추적
    visited = set()
    queue = deque([(task_id, 0)])  # (task_id, depth)
    impact_depth = {}
    impacted_tasks = []

    while queue:
        current_id, depth = queue.popleft()

        if current_id in visited:
            continue

        visited.add(current_id)

        # 시작 태스크는 제외
        if current_id != task_id:
            impact_depth[current_id] = depth

            # 태스크 정보 조회
            task = db.query(Task).filter(Task.id == current_id).first()
            if task:
                impacted_tasks.append(
                    {
                        "task_id": task.id,
                        "task_name": task.name,
                        "depth": depth,
                        "status": task.status,
                        "start_date": task.start_date.isoformat() if task.start_date else None,
                        "end_date": task.end_date.isoformat() if task.end_date else None,
                    }
                )

        # 후속 태스크 탐색
        for successor_id in graph.get(current_id, []):
            if successor_id not in visited:
                queue.append((successor_id, depth + 1))

    return ImpactAnalysisResult(
        source_task_id=task_id,
        source_task_name=source_task.name,
        impacted_tasks=impacted_tasks,
        impact_depth=impact_depth,
    )


def get_dependency_chain(task_id: int, db: Session, direction: str = "forward") -> List[int]:
    """
    의존성 체인 조회

    특정 태스크의 의존성 체인을 조회합니다.

    Args:
        task_id: 태스크 ID
        db: 데이터베이스 세션
        direction: 조회 방향 ("forward": 후속 태스크, "backward": 선행 태스크)

    Returns:
        의존성 체인의 task_id 리스트 (정렬된 순서)

    Raises:
        ValueError: 태스크를 찾을 수 없거나 잘못된 방향 지정
    """
    if direction not in ["forward", "backward"]:
        raise ValueError("direction은 'forward' 또는 'backward'여야 합니다.")

    # 태스크 조회
    source_task = db.query(Task).filter(Task.id == task_id).first()
    if not source_task:
        raise ValueError(f"태스크 ID {task_id}를 찾을 수 없습니다.")

    project_id = source_task.project_id

    # 프로젝트의 모든 의존성 조회
    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .all()
    )

    # 그래프 구축
    graph = defaultdict(list)
    if direction == "forward":
        for dep in dependencies:
            graph[dep.predecessor_task_id].append(dep.successor_task_id)
    else:  # backward
        for dep in dependencies:
            graph[dep.successor_task_id].append(dep.predecessor_task_id)

    # DFS로 체인 추적
    visited = set()
    chain = []

    def dfs(node: int):
        if node in visited:
            return
        visited.add(node)
        chain.append(node)

        for neighbor in graph.get(node, []):
            dfs(neighbor)

    dfs(task_id)

    return chain
