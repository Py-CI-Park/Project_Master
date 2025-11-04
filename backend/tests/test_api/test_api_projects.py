"""
Projects API Integration Tests

FastAPI TestClient를 사용한 Projects API 엔드포인트 테스트
- CRUD 동작 검증
- 에러 케이스 테스트
- 요청/응답 스키마 검증
"""

from datetime import datetime, timedelta

import pytest
from fastapi import status


class TestProjectsAPI:
    """Projects API 엔드포인트 테스트"""

    def test_create_project_success(self, client):
        """프로젝트 생성 성공 테스트"""
        project_data = {
            "name": "신규 프로젝트",
            "description": "테스트 프로젝트입니다",
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "status": "planning",
        }

        response = client.post("/api/v1/projects/", json=project_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == project_data["name"]
        assert data["description"] == project_data["description"]
        assert data["status"] == project_data["status"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_project_missing_required_fields(self, client):
        """필수 필드 누락 시 422 에러 테스트"""
        project_data = {
            "description": "이름이 없는 프로젝트",
        }

        response = client.post("/api/v1/projects/", json=project_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_list_projects_empty(self, client):
        """빈 프로젝트 목록 조회 테스트"""
        response = client.get("/api/v1/projects/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 0

    def test_list_projects_with_data(self, client, sample_project):
        """프로젝트 목록 조회 테스트 (데이터 있음)"""
        response = client.get("/api/v1/projects/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["id"] == sample_project.id
        assert data[0]["name"] == sample_project.name

    def test_list_projects_pagination(self, client, db_session):
        """페이지네이션 테스트"""
        # 10개의 프로젝트 생성
        from app.models.project import Project

        for i in range(10):
            project = Project(
                name=f"프로젝트 {i}",
                description=f"설명 {i}",
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=30),
                status="planning",
            )
            db_session.add(project)
        db_session.commit()

        # skip=0, limit=5
        response = client.get("/api/v1/projects/?skip=0&limit=5")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 5

        # skip=5, limit=5
        response = client.get("/api/v1/projects/?skip=5&limit=5")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 5

    def test_get_project_success(self, client, sample_project):
        """프로젝트 상세 조회 성공 테스트"""
        response = client.get(f"/api/v1/projects/{sample_project.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == sample_project.id
        assert data["name"] == sample_project.name
        assert data["description"] == sample_project.description

    def test_get_project_not_found(self, client):
        """존재하지 않는 프로젝트 조회 시 404 에러 테스트"""
        response = client.get("/api/v1/projects/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()

        assert "detail" in data
        assert "찾을 수 없습니다" in data["detail"]

    def test_update_project_success(self, client, sample_project):
        """프로젝트 수정 성공 테스트"""
        update_data = {
            "name": "수정된 프로젝트 이름",
            "status": "in_progress",
        }

        response = client.put(
            f"/api/v1/projects/{sample_project.id}",
            json=update_data
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == sample_project.id
        assert data["name"] == update_data["name"]
        assert data["status"] == update_data["status"]
        # 수정되지 않은 필드는 유지
        assert data["description"] == sample_project.description

    def test_update_project_partial_update(self, client, sample_project):
        """부분 수정 테스트 (exclude_unset=True 동작 확인)"""
        update_data = {
            "status": "completed",
        }

        response = client.put(
            f"/api/v1/projects/{sample_project.id}",
            json=update_data
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["status"] == "completed"
        # 다른 필드는 변경되지 않음
        assert data["name"] == sample_project.name
        assert data["description"] == sample_project.description

    def test_update_project_not_found(self, client):
        """존재하지 않는 프로젝트 수정 시 404 에러 테스트"""
        update_data = {
            "name": "수정할 수 없는 프로젝트",
        }

        response = client.put("/api/v1/projects/99999", json=update_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_project_success(self, client, sample_project):
        """프로젝트 삭제 성공 테스트"""
        project_id = sample_project.id

        response = client.delete(f"/api/v1/projects/{project_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 삭제 후 조회 시 404 반환 확인
        response = client.get(f"/api/v1/projects/{project_id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_project_not_found(self, client):
        """존재하지 않는 프로젝트 삭제 시 404 에러 테스트"""
        response = client.delete("/api/v1/projects/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_project_cascade(self, client, sample_project, sample_tasks):
        """프로젝트 삭제 시 관련 태스크 CASCADE 삭제 테스트"""
        project_id = sample_project.id
        task_ids = [task.id for task in sample_tasks]

        # 프로젝트 삭제
        response = client.delete(f"/api/v1/projects/{project_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 태스크도 함께 삭제되었는지 확인
        for task_id in task_ids:
            response = client.get(f"/api/v1/tasks/{task_id}")
            assert response.status_code == status.HTTP_404_NOT_FOUND
