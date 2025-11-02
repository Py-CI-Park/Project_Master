"""
Dependencies API Integration Tests

FastAPI TestClient를 사용한 Dependencies API 엔드포인트 테스트
- 의존성 생성 및 삭제
- 검증 로직 테스트 (동일 프로젝트, 중복 방지 등)
- 에러 케이스 테스트
"""

import pytest
from fastapi import status


class TestDependenciesAPI:
    """Dependencies API 엔드포인트 테스트"""

    def test_create_dependency_success(self, client, sample_tasks):
        """의존성 생성 성공 테스트"""
        dependency_data = {
            "predecessor_task_id": sample_tasks[0].id,
            "successor_task_id": sample_tasks[1].id,
            "dependency_type": "FS",
            "lag_days": 0,
        }

        response = client.post("/api/v1/dependencies", json=dependency_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["predecessor_task_id"] == dependency_data["predecessor_task_id"]
        assert data["successor_task_id"] == dependency_data["successor_task_id"]
        assert data["dependency_type"] == dependency_data["dependency_type"]
        assert "id" in data

    def test_create_dependency_predecessor_not_found(self, client, sample_tasks):
        """선행 태스크가 존재하지 않을 때 404 에러"""
        dependency_data = {
            "predecessor_task_id": 99999,
            "successor_task_id": sample_tasks[0].id,
            "dependency_type": "FS",
            "lag_days": 0,
        }

        response = client.post("/api/v1/dependencies", json=dependency_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "선행 태스크" in data["detail"]

    def test_create_dependency_successor_not_found(self, client, sample_tasks):
        """후속 태스크가 존재하지 않을 때 404 에러"""
        dependency_data = {
            "predecessor_task_id": sample_tasks[0].id,
            "successor_task_id": 99999,
            "dependency_type": "FS",
            "lag_days": 0,
        }

        response = client.post("/api/v1/dependencies", json=dependency_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert "후속 태스크" in data["detail"]

    def test_create_dependency_different_projects(self, client, db_session):
        """다른 프로젝트의 태스크 간 의존성 생성 시 400 에러"""
        from datetime import datetime, timedelta
        from app.models.project import Project
        from app.models.task import Task

        # 두 개의 프로젝트 생성
        project1 = Project(
            name="프로젝트 1",
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=30),
        )
        project2 = Project(
            name="프로젝트 2",
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=30),
        )
        db_session.add(project1)
        db_session.add(project2)
        db_session.commit()
        db_session.refresh(project1)
        db_session.refresh(project2)

        # 각 프로젝트에 태스크 생성
        task1 = Task(
            name="태스크 1",
            project_id=project1.id,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=5),
        )
        task2 = Task(
            name="태스크 2",
            project_id=project2.id,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=5),
        )
        db_session.add(task1)
        db_session.add(task2)
        db_session.commit()
        db_session.refresh(task1)
        db_session.refresh(task2)

        # 다른 프로젝트의 태스크 간 의존성 생성 시도
        dependency_data = {
            "predecessor_task_id": task1.id,
            "successor_task_id": task2.id,
            "dependency_type": "FS",
            "lag_days": 0,
        }

        response = client.post("/api/v1/dependencies", json=dependency_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "동일한 프로젝트" in data["detail"]

    def test_create_dependency_duplicate(self, client, sample_tasks):
        """중복 의존성 생성 시 400 에러"""
        dependency_data = {
            "predecessor_task_id": sample_tasks[0].id,
            "successor_task_id": sample_tasks[1].id,
            "dependency_type": "FS",
            "lag_days": 0,
        }

        # 첫 번째 생성 (성공)
        response = client.post("/api/v1/dependencies", json=dependency_data)
        assert response.status_code == status.HTTP_201_CREATED

        # 동일한 의존성 재생성 시도 (실패)
        response = client.post("/api/v1/dependencies", json=dependency_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "이미 존재합니다" in data["detail"]

    def test_create_dependency_with_lag(self, client, sample_tasks):
        """지연 일수(lag)가 있는 의존성 생성 테스트"""
        dependency_data = {
            "predecessor_task_id": sample_tasks[0].id,
            "successor_task_id": sample_tasks[2].id,
            "dependency_type": "FS",
            "lag_days": 3,
        }

        response = client.post("/api/v1/dependencies", json=dependency_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["lag_days"] == 3

    def test_list_project_dependencies_empty(self, client, sample_project):
        """빈 의존성 목록 조회"""
        response = client.get(f"/api/v1/projects/{sample_project.id}/dependencies")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 0

    def test_list_project_dependencies_with_data(
        self, client, sample_project, sample_dependencies
    ):
        """의존성 목록 조회 (데이터 있음)"""
        response = client.get(f"/api/v1/projects/{sample_project.id}/dependencies")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 4  # sample_dependencies는 4개
        assert all("predecessor_task_id" in dep for dep in data)
        assert all("successor_task_id" in dep for dep in data)

    def test_list_project_dependencies_pagination(
        self, client, sample_project, sample_dependencies
    ):
        """의존성 목록 페이지네이션 테스트"""
        # skip=0, limit=2
        response = client.get(
            f"/api/v1/projects/{sample_project.id}/dependencies?skip=0&limit=2"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2

        # skip=2, limit=2
        response = client.get(
            f"/api/v1/projects/{sample_project.id}/dependencies?skip=2&limit=2"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2

    def test_delete_dependency_success(self, client, sample_dependencies):
        """의존성 삭제 성공 테스트"""
        dependency = sample_dependencies[0]
        dependency_id = dependency.id

        response = client.delete(f"/api/v1/dependencies/{dependency_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 삭제 후 목록에서 확인
        project_id = dependency.predecessor_task.project_id
        response = client.get(f"/api/v1/projects/{project_id}/dependencies")
        remaining_dependencies = response.json()

        # 삭제된 의존성이 목록에 없어야 함
        assert not any(dep["id"] == dependency_id for dep in remaining_dependencies)

    def test_delete_dependency_not_found(self, client):
        """존재하지 않는 의존성 삭제 시 404 에러"""
        response = client.delete("/api/v1/dependencies/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_dependency_types(self, client, sample_tasks):
        """다양한 의존성 타입 테스트 (FS, SS, FF, SF)"""
        dependency_types = ["FS", "SS", "FF", "SF"]

        for i, dep_type in enumerate(dependency_types):
            dependency_data = {
                "predecessor_task_id": sample_tasks[i].id,
                "successor_task_id": sample_tasks[i + 1].id,
                "dependency_type": dep_type,
                "lag_days": 0,
            }

            response = client.post("/api/v1/dependencies", json=dependency_data)

            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["dependency_type"] == dep_type

    def test_create_dependency_invalid_type(self, client, sample_tasks):
        """잘못된 의존성 타입 사용 시 422 에러"""
        dependency_data = {
            "predecessor_task_id": sample_tasks[0].id,
            "successor_task_id": sample_tasks[1].id,
            "dependency_type": "INVALID",  # 잘못된 타입
            "lag_days": 0,
        }

        response = client.post("/api/v1/dependencies", json=dependency_data)

        # Pydantic validation error
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
