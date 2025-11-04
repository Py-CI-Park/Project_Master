"""
Model Tests

데이터베이스 모델 테스트
- CRUD 동작 검증
- 관계 및 외래 키 테스트
- 제약 조건 검증
"""

from datetime import date, timedelta

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.dependency import Dependency
from app.models.enabler import Enabler
from app.models.project import Project
from app.models.task import Task


class TestProjectModel:
    """Project 모델 테스트"""

    def test_create_project(self, db_session):
        """프로젝트 생성 테스트"""
        project = Project(
            name="신규 프로젝트",
            description="테스트 프로젝트입니다",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status="planned",
        )
        db_session.add(project)
        db_session.commit()
        db_session.refresh(project)

        assert project.id is not None
        assert project.name == "신규 프로젝트"
        assert project.status == "planned"
        assert project.created_at is not None
        assert project.updated_at is not None

    def test_project_name_required(self, db_session):
        """프로젝트 이름 필수 검증"""
        project = Project(
            description="이름 없는 프로젝트",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
        )
        db_session.add(project)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_project_update(self, db_session, sample_project):
        """프로젝트 수정 테스트"""
        original_updated_at = sample_project.updated_at

        sample_project.name = "수정된 프로젝트"
        sample_project.status = "completed"
        db_session.commit()
        db_session.refresh(sample_project)

        assert sample_project.name == "수정된 프로젝트"
        assert sample_project.status == "completed"
        # updated_at은 자동 업데이트되지 않음 (트리거 없음)

    def test_project_delete(self, db_session, sample_project):
        """프로젝트 삭제 테스트"""
        project_id = sample_project.id

        db_session.delete(sample_project)
        db_session.commit()

        deleted_project = db_session.query(Project).filter(Project.id == project_id).first()
        assert deleted_project is None

    def test_project_tasks_relationship(self, db_session, sample_project, sample_tasks):
        """프로젝트-태스크 관계 테스트"""
        # 프로젝트를 통해 태스크 조회
        db_session.refresh(sample_project)
        assert len(sample_project.tasks) == 5
        assert sample_project.tasks[0].name == "태스크 1"


class TestTaskModel:
    """Task 모델 테스트"""

    def test_create_task(self, db_session, sample_project):
        """태스크 생성 테스트"""
        task = Task(
            name="새로운 태스크",
            description="테스트 태스크",
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=3),
            duration_days=3,
            status="not_started",
            priority="medium",
            progress=0.0,
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.id is not None
        assert task.name == "새로운 태스크"
        assert task.project_id == sample_project.id
        assert task.duration_days == 3

    def test_task_name_required(self, db_session, sample_project):
        """태스크 이름 필수 검증"""
        task = Task(
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=3),
        )
        db_session.add(task)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_task_project_foreign_key(self, db_session):
        """태스크 프로젝트 외래 키 검증"""
        task = Task(
            name="고아 태스크",
            project_id=99999,  # 존재하지 않는 프로젝트 ID
            start_date=date.today(),
            end_date=date.today() + timedelta(days=3),
        )
        db_session.add(task)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_task_milestone_flag(self, db_session, sample_project):
        """태스크 마일스톤 플래그 테스트"""
        milestone = Task(
            name="주요 마일스톤",
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today(),
            duration_days=1,
            is_milestone=True,
            priority="critical",
        )
        db_session.add(milestone)
        db_session.commit()
        db_session.refresh(milestone)

        assert milestone.is_milestone is True
        assert milestone.duration_days == 1

    def test_task_progress_range(self, db_session, sample_project):
        """태스크 진행률 범위 테스트 (0-100)"""
        task = Task(
            name="진행 중인 태스크",
            project_id=sample_project.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5),
            progress=50.5,
        )
        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert 0 <= task.progress <= 100

    def test_task_cascade_delete_with_project(self, db_session, sample_project, sample_tasks):
        """프로젝트 삭제 시 태스크 CASCADE 삭제 테스트"""
        project_id = sample_project.id
        task_ids = [task.id for task in sample_tasks]

        # 프로젝트 삭제
        db_session.delete(sample_project)
        db_session.commit()

        # 태스크도 함께 삭제되었는지 확인
        remaining_tasks = (
            db_session.query(Task).filter(Task.id.in_(task_ids)).all()
        )
        assert len(remaining_tasks) == 0


class TestEnablerModel:
    """Enabler 모델 테스트"""

    def test_create_enabler(self, db_session, sample_project):
        """Enabler 생성 테스트"""
        enabler = Enabler(
            name="핵심 리소스",
            description="프로젝트 필수 리소스",
            type="Resource",
            project_id=sample_project.id,
            planned_delivery_date=date.today() + timedelta(days=10),
            status="requested",
            criticality="high",
        )
        db_session.add(enabler)
        db_session.commit()
        db_session.refresh(enabler)

        assert enabler.id is not None
        assert enabler.name == "핵심 리소스"
        assert enabler.type == "Resource"
        assert enabler.criticality == "high"

    def test_enabler_name_required(self, db_session, sample_project):
        """Enabler 이름 필수 검증"""
        enabler = Enabler(
            type="Resource",
            project_id=sample_project.id,
            planned_delivery_date=date.today() + timedelta(days=10),
        )
        db_session.add(enabler)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_enabler_project_foreign_key(self, db_session):
        """Enabler 프로젝트 외래 키 검증"""
        enabler = Enabler(
            name="고아 Enabler",
            type="Resource",
            project_id=99999,  # 존재하지 않는 프로젝트 ID
            planned_delivery_date=date.today() + timedelta(days=10),
        )
        db_session.add(enabler)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_enabler_status_values(self, db_session, sample_project):
        """Enabler 상태 값 테스트"""
        valid_statuses = ["requested", "in_progress", "delivered", "delayed", "cancelled"]

        for status in valid_statuses:
            enabler = Enabler(
                name=f"Enabler {status}",
                type="Resource",
                project_id=sample_project.id,
                status=status,
                planned_delivery_date=date.today() + timedelta(days=10),
            )
            db_session.add(enabler)
            db_session.commit()
            db_session.refresh(enabler)

            assert enabler.status == status

        # 세션 초기화
        db_session.rollback()

    def test_enabler_criticality_values(self, db_session, sample_project):
        """Enabler 중요도 값 테스트"""
        valid_criticalities = ["low", "medium", "high", "critical"]

        for criticality in valid_criticalities:
            enabler = Enabler(
                name=f"Enabler {criticality}",
                type="Resource",
                project_id=sample_project.id,
                criticality=criticality,
                planned_delivery_date=date.today() + timedelta(days=10),
            )
            db_session.add(enabler)
            db_session.commit()
            db_session.refresh(enabler)

            assert enabler.criticality == criticality

        # 세션 초기화
        db_session.rollback()

    def test_enabler_cascade_delete_with_project(
        self, db_session, sample_project, sample_enablers
    ):
        """프로젝트 삭제 시 Enabler CASCADE 삭제 테스트"""
        project_id = sample_project.id
        enabler_ids = [enabler.id for enabler in sample_enablers]

        # 프로젝트 삭제
        db_session.delete(sample_project)
        db_session.commit()

        # Enabler도 함께 삭제되었는지 확인
        remaining_enablers = (
            db_session.query(Enabler).filter(Enabler.id.in_(enabler_ids)).all()
        )
        assert len(remaining_enablers) == 0


class TestDependencyModel:
    """Dependency 모델 테스트"""

    def test_create_dependency(self, db_session, sample_tasks):
        """의존성 생성 테스트"""
        dependency = Dependency(
            predecessor_task_id=sample_tasks[0].id,
            successor_task_id=sample_tasks[1].id,
            dependency_type="FS",
            lag_days=0,
        )
        db_session.add(dependency)
        db_session.commit()
        db_session.refresh(dependency)

        assert dependency.id is not None
        assert dependency.predecessor_task_id == sample_tasks[0].id
        assert dependency.successor_task_id == sample_tasks[1].id
        assert dependency.dependency_type == "FS"

    def test_dependency_foreign_keys(self, db_session, sample_tasks):
        """의존성 외래 키 검증"""
        # 존재하지 않는 선행 태스크
        dependency = Dependency(
            predecessor_task_id=99999,
            successor_task_id=sample_tasks[0].id,
            dependency_type="FS",
            lag_days=0,
        )
        db_session.add(dependency)

        with pytest.raises(IntegrityError):
            db_session.commit()

        db_session.rollback()

        # 존재하지 않는 후속 태스크
        dependency = Dependency(
            predecessor_task_id=sample_tasks[0].id,
            successor_task_id=99999,
            dependency_type="FS",
            lag_days=0,
        )
        db_session.add(dependency)

        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_dependency_types(self, db_session, sample_tasks):
        """의존성 타입 테스트 (FS, SS, FF, SF)"""
        valid_types = ["FS", "SS", "FF", "SF"]

        for dep_type in valid_types:
            # 각 타입마다 새로운 태스크 쌍 사용
            dependency = Dependency(
                predecessor_task_id=sample_tasks[0].id,
                successor_task_id=sample_tasks[1].id,
                dependency_type=dep_type,
                lag_days=0,
            )
            db_session.add(dependency)
            db_session.commit()
            db_session.refresh(dependency)

            assert dependency.dependency_type == dep_type

            # 삭제하여 다음 테스트 준비
            db_session.delete(dependency)
            db_session.commit()

    def test_dependency_lag_days(self, db_session, sample_tasks):
        """의존성 지연 일수 테스트"""
        dependency = Dependency(
            predecessor_task_id=sample_tasks[0].id,
            successor_task_id=sample_tasks[1].id,
            dependency_type="FS",
            lag_days=5,
        )
        db_session.add(dependency)
        db_session.commit()
        db_session.refresh(dependency)

        assert dependency.lag_days == 5

    def test_dependency_cascade_delete_with_task(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """태스크 삭제 시 의존성 CASCADE 삭제 테스트"""
        task_to_delete = sample_tasks[1]  # 태스크 2 (선행 및 후속 관계 모두 가짐)
        task_id = task_to_delete.id

        # 태스크 2와 관련된 의존성 개수 확인
        related_deps = (
            db_session.query(Dependency)
            .filter(
                (Dependency.predecessor_task_id == task_id)
                | (Dependency.successor_task_id == task_id)
            )
            .all()
        )
        assert len(related_deps) > 0

        # 태스크 삭제
        db_session.delete(task_to_delete)
        db_session.commit()

        # 관련 의존성도 함께 삭제되었는지 확인
        remaining_deps = (
            db_session.query(Dependency)
            .filter(
                (Dependency.predecessor_task_id == task_id)
                | (Dependency.successor_task_id == task_id)
            )
            .all()
        )
        assert len(remaining_deps) == 0


class TestModelRelationships:
    """모델 간 관계 테스트"""

    def test_project_to_tasks_relationship(
        self, db_session, sample_project, sample_tasks
    ):
        """프로젝트 → 태스크 관계 조회 테스트"""
        db_session.refresh(sample_project)
        tasks = sample_project.tasks

        assert len(tasks) == 5
        assert all(task.project_id == sample_project.id for task in tasks)

    def test_project_to_enablers_relationship(
        self, db_session, sample_project, sample_enablers
    ):
        """프로젝트 → Enabler 관계 조회 테스트"""
        db_session.refresh(sample_project)
        enablers = sample_project.enablers

        assert len(enablers) == 3
        assert all(enabler.project_id == sample_project.id for enabler in enablers)

    def test_task_to_project_relationship(self, db_session, sample_project, sample_tasks):
        """태스크 → 프로젝트 관계 조회 테스트"""
        task = sample_tasks[0]
        db_session.refresh(task)

        assert task.project is not None
        assert task.project.id == sample_project.id
        assert task.project.name == sample_project.name

    def test_dependency_to_tasks_relationship(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """의존성 → 태스크 관계 조회 테스트"""
        dependency = sample_dependencies[0]
        db_session.refresh(dependency)

        # 선행 태스크 조회
        assert dependency.predecessor_task is not None
        assert dependency.predecessor_task.id == sample_tasks[0].id

        # 후속 태스크 조회
        assert dependency.successor_task is not None
        assert dependency.successor_task.id == sample_tasks[1].id
