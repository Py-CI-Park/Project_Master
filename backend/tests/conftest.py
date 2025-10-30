"""
Pytest Configuration and Fixtures

테스트 공통 설정 및 재사용 가능한 fixtures 정의
"""

from datetime import date, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.dependency import Dependency
from app.models.enabler import Enabler
from app.models.project import Project
from app.models.task import Task


@pytest.fixture(scope="function")
def db_session():
    """
    테스트용 인메모리 SQLite 데이터베이스 세션

    각 테스트 함수마다 독립적인 데이터베이스 생성
    테스트 종료 후 자동으로 정리됨
    """
    # 인메모리 SQLite 데이터베이스 생성
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)

    # 세션 생성
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    yield session

    # 테스트 후 정리
    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture
def sample_project(db_session):
    """
    샘플 프로젝트 생성

    Returns:
        Project: 테스트용 프로젝트 객체
    """
    project = Project(
        name="테스트 프로젝트",
        description="단위 테스트용 샘플 프로젝트",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        status="in_progress",
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def sample_tasks(db_session, sample_project):
    """
    샘플 태스크 목록 생성

    Returns:
        List[Task]: 5개의 태스크 리스트
    """
    tasks = [
        Task(
            name="태스크 1",
            description="첫 번째 태스크",
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            duration_days=5,
            status="not_started",
            priority="high",
            progress=0.0,
            is_milestone=False,
        ),
        Task(
            name="태스크 2",
            description="두 번째 태스크",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=6),
            end_date=date.today() + timedelta(days=10),
            duration_days=5,
            status="not_started",
            priority="medium",
            progress=0.0,
            is_milestone=False,
        ),
        Task(
            name="태스크 3",
            description="세 번째 태스크",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=11),
            end_date=date.today() + timedelta(days=15),
            duration_days=5,
            status="not_started",
            priority="medium",
            progress=0.0,
            is_milestone=False,
        ),
        Task(
            name="마일스톤 1",
            description="첫 번째 마일스톤",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=15),
            end_date=date.today() + timedelta(days=15),
            duration_days=1,
            status="not_started",
            priority="critical",
            progress=0.0,
            is_milestone=True,
        ),
        Task(
            name="태스크 4",
            description="네 번째 태스크",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=16),
            end_date=date.today() + timedelta(days=20),
            duration_days=5,
            status="not_started",
            priority="low",
            progress=0.0,
            is_milestone=False,
        ),
    ]

    for task in tasks:
        db_session.add(task)

    db_session.commit()

    # 모든 태스크 refresh
    for task in tasks:
        db_session.refresh(task)

    return tasks


@pytest.fixture
def sample_dependencies(db_session, sample_tasks):
    """
    샘플 의존성 관계 생성

    태스크 1 → 태스크 2 → 태스크 3 → 마일스톤 1 → 태스크 4

    Returns:
        List[Dependency]: 4개의 의존성 리스트
    """
    dependencies = [
        Dependency(
            predecessor_task_id=sample_tasks[0].id,  # 태스크 1
            successor_task_id=sample_tasks[1].id,  # 태스크 2
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=sample_tasks[1].id,  # 태스크 2
            successor_task_id=sample_tasks[2].id,  # 태스크 3
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=sample_tasks[2].id,  # 태스크 3
            successor_task_id=sample_tasks[3].id,  # 마일스톤 1
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=sample_tasks[3].id,  # 마일스톤 1
            successor_task_id=sample_tasks[4].id,  # 태스크 4
            dependency_type="FS",
            lag_days=0,
        ),
    ]

    for dep in dependencies:
        db_session.add(dep)

    db_session.commit()

    # 모든 의존성 refresh
    for dep in dependencies:
        db_session.refresh(dep)

    return dependencies


@pytest.fixture
def sample_enablers(db_session, sample_project):
    """
    샘플 Enabler 목록 생성

    Returns:
        List[Enabler]: 3개의 Enabler 리스트
    """
    enablers = [
        Enabler(
            name="서버 인프라",
            description="개발 서버 구축",
            type="Infrastructure",
            project_id=sample_project.id,
            planned_delivery_date=date.today() + timedelta(days=7),
            status="requested",
            criticality="critical",
        ),
        Enabler(
            name="API 문서",
            description="REST API 문서 작성",
            type="Documentation",
            project_id=sample_project.id,
            planned_delivery_date=date.today() + timedelta(days=14),
            status="in_progress",
            criticality="high",
        ),
        Enabler(
            name="테스트 데이터",
            description="샘플 테스트 데이터 준비",
            type="Data",
            project_id=sample_project.id,
            planned_delivery_date=date.today() + timedelta(days=21),
            status="delivered",
            criticality="medium",
        ),
    ]

    for enabler in enablers:
        db_session.add(enabler)

    db_session.commit()

    # 모든 Enabler refresh
    for enabler in enablers:
        db_session.refresh(enabler)

    return enablers


@pytest.fixture
def complex_task_graph(db_session, sample_project):
    """
    복잡한 태스크 그래프 생성 (크리티컬 패스 테스트용)

    태스크 구조:
        A (5일) ─┬─→ C (3일) ─┐
                 │             ├─→ E (2일) → F (1일)
        B (7일) ─┴─→ D (4일) ─┘

    크리티컬 패스: B → D → E → F (14일)

    Returns:
        Tuple[List[Task], List[Dependency]]: (태스크 리스트, 의존성 리스트)
    """
    tasks = [
        Task(
            name="Task A",
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=4),
            duration_days=5,
            status="not_started",
            priority="medium",
        ),
        Task(
            name="Task B",
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=6),
            duration_days=7,
            status="not_started",
            priority="high",
        ),
        Task(
            name="Task C",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=7),
            duration_days=3,
            status="not_started",
            priority="medium",
        ),
        Task(
            name="Task D",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=7),
            end_date=date.today() + timedelta(days=10),
            duration_days=4,
            status="not_started",
            priority="high",
        ),
        Task(
            name="Task E",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=11),
            end_date=date.today() + timedelta(days=12),
            duration_days=2,
            status="not_started",
            priority="critical",
        ),
        Task(
            name="Task F",
            project_id=sample_project.id,
            start_date=date.today() + timedelta(days=13),
            end_date=date.today() + timedelta(days=13),
            duration_days=1,
            status="not_started",
            priority="critical",
            is_milestone=True,
        ),
    ]

    for task in tasks:
        db_session.add(task)
    db_session.commit()
    for task in tasks:
        db_session.refresh(task)

    dependencies = [
        Dependency(
            predecessor_task_id=tasks[0].id,  # A → C
            successor_task_id=tasks[2].id,
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=tasks[1].id,  # B → C
            successor_task_id=tasks[2].id,
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=tasks[1].id,  # B → D
            successor_task_id=tasks[3].id,
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=tasks[2].id,  # C → E
            successor_task_id=tasks[4].id,
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=tasks[3].id,  # D → E
            successor_task_id=tasks[4].id,
            dependency_type="FS",
            lag_days=0,
        ),
        Dependency(
            predecessor_task_id=tasks[4].id,  # E → F
            successor_task_id=tasks[5].id,
            dependency_type="FS",
            lag_days=0,
        ),
    ]

    for dep in dependencies:
        db_session.add(dep)
    db_session.commit()
    for dep in dependencies:
        db_session.refresh(dep)

    return tasks, dependencies
