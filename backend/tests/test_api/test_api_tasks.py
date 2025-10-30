"""
Tasks API Integration Tests

FastAPI TestClient를 사용한 Tasks API 엔드포인트 테스트
- CRUD 동작 검증
- 프로젝트 연관 검증
- 에러 케이스 테스트
"""

from datetime import date, timedelta

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.api import api_router
from app.database import get_db
from app.main import app


@pytest.fixture(scope="function")
def test_app(db_session):
    """테스트용 FastAPI 애플리케이션"""
    app.include_router(api_router, prefix="/api/v1")

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield app
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(test_app):
    """TestClient 인스턴스"""
    return TestClient(test_app)


class TestTasksAPI:
    """Tasks API 엔드포인트 테스트"""

    def test_create_task_success(self, client, sample_project):
        """태스크 생성 성공 테스트"""
        task_data = {
            "name": "새로운 태스크",
            "description": "테스트 태스크입니다",
            "project_id": sample_project.id,
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=5)).isoformat(),
            "duration_days": 5,
            "status": "not_started",
            "priority": "high",
            "progress": 0.0,
        }

        response = client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=task_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == task_data["name"]
        assert data["project_id"] == sample_project.id
        assert data["status"] == task_data["status"]
        assert "id" in data

    def test_create_task_project_not_found(self, client):
        """존재하지 않는 프로젝트에 태스크 생성 시 404 에러"""
        task_data = {
            "name": "태스크",
            "project_id": 99999,
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=5)).isoformat(),
        }

        response = client.post("/api/v1/projects/99999/tasks", json=task_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_task_project_id_mismatch(self, client, sample_project):
        """URL project_id와 body project_id 불일치 시 400 에러"""
        task_data = {
            "name": "태스크",
            "project_id": sample_project.id + 1000,  # 다른 ID
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=5)).isoformat(),
        }

        response = client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=task_data
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "일치하지 않습니다" in data["detail"]

    def test_list_project_tasks_empty(self, client, sample_project):
        """빈 태스크 목록 조회"""
        response = client.get(f"/api/v1/projects/{sample_project.id}/tasks")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 0

    def test_list_project_tasks_with_data(self, client, sample_project, sample_tasks):
        """태스크 목록 조회 (데이터 있음)"""
        response = client.get(f"/api/v1/projects/{sample_project.id}/tasks")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 5  # sample_tasks는 5개
        assert all(task["project_id"] == sample_project.id for task in data)

    def test_list_project_tasks_pagination(self, client, sample_project, sample_tasks):
        """태스크 목록 페이지네이션 테스트"""
        # skip=0, limit=3
        response = client.get(
            f"/api/v1/projects/{sample_project.id}/tasks?skip=0&limit=3"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 3

        # skip=3, limit=3
        response = client.get(
            f"/api/v1/projects/{sample_project.id}/tasks?skip=3&limit=3"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2  # 총 5개이므로 남은 2개

    def test_list_project_tasks_project_not_found(self, client):
        """존재하지 않는 프로젝트의 태스크 목록 조회 시 404 에러"""
        response = client.get("/api/v1/projects/99999/tasks")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_task_success(self, client, sample_tasks):
        """태스크 상세 조회 성공 테스트"""
        task = sample_tasks[0]

        response = client.get(f"/api/v1/tasks/{task.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == task.id
        assert data["name"] == task.name

    def test_get_task_not_found(self, client):
        """존재하지 않는 태스크 조회 시 404 에러"""
        response = client.get("/api/v1/tasks/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_task_success(self, client, sample_tasks):
        """태스크 수정 성공 테스트"""
        task = sample_tasks[0]
        update_data = {
            "name": "수정된 태스크 이름",
            "status": "in_progress",
            "progress": 50.0,
        }

        response = client.put(f"/api/v1/tasks/{task.id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == task.id
        assert data["name"] == update_data["name"]
        assert data["status"] == update_data["status"]
        assert data["progress"] == update_data["progress"]

    def test_update_task_partial_update(self, client, sample_tasks):
        """부분 수정 테스트"""
        task = sample_tasks[0]
        update_data = {
            "progress": 75.0,
        }

        response = client.put(f"/api/v1/tasks/{task.id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["progress"] == 75.0
        assert data["name"] == task.name  # 다른 필드는 유지

    def test_update_task_not_found(self, client):
        """존재하지 않는 태스크 수정 시 404 에러"""
        update_data = {
            "name": "수정할 수 없음",
        }

        response = client.put("/api/v1/tasks/99999", json=update_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_task_success(self, client, sample_tasks):
        """태스크 삭제 성공 테스트"""
        task = sample_tasks[0]
        task_id = task.id

        response = client.delete(f"/api/v1/tasks/{task_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 삭제 후 조회 시 404
        response = client.get(f"/api/v1/tasks/{task_id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_task_not_found(self, client):
        """존재하지 않는 태스크 삭제 시 404 에러"""
        response = client.delete("/api/v1/tasks/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_task_cascade_dependencies(
        self, client, sample_tasks, sample_dependencies
    ):
        """태스크 삭제 시 의존성 CASCADE 삭제 테스트"""
        task = sample_tasks[1]  # 태스크 2 (선행 및 후속 의존성 모두 가짐)
        task_id = task.id

        # 태스크 삭제
        response = client.delete(f"/api/v1/tasks/{task_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 관련 의존성도 삭제되었는지 확인
        # (프로젝트의 의존성 목록에서 해당 태스크와 관련된 의존성이 사라짐)
        project_id = task.project_id
        response = client.get(f"/api/v1/projects/{project_id}/dependencies")

        if response.status_code == status.HTTP_200_OK:
            dependencies = response.json()
            # 삭제된 태스크와 관련된 의존성이 없어야 함
            assert not any(
                dep["predecessor_task_id"] == task_id or dep["successor_task_id"] == task_id
                for dep in dependencies
            )

    def test_create_task_milestone(self, client, sample_project):
        """마일스톤 태스크 생성 테스트"""
        task_data = {
            "name": "중요 마일스톤",
            "project_id": sample_project.id,
            "start_date": (date.today() + timedelta(days=30)).isoformat(),
            "end_date": (date.today() + timedelta(days=30)).isoformat(),
            "duration_days": 1,
            "is_milestone": True,
            "priority": "critical",
            "status": "not_started",
        }

        response = client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=task_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["is_milestone"] is True
        assert data["priority"] == "critical"
        assert data["duration_days"] == 1
