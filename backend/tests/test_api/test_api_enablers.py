"""
Enablers API Integration Tests

FastAPI TestClient를 사용한 Enablers API 엔드포인트 테스트
- CRUD 동작 검증
- 프로젝트 연관 검증
- 에러 케이스 테스트
"""

from datetime import date, datetime, timedelta

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


class TestEnablersAPI:
    """Enablers API 엔드포인트 테스트"""

    def test_create_enabler_success(self, client, sample_project):
        """Enabler 생성 성공 테스트"""
        enabler_data = {
            "name": "핵심 리소스",
            "description": "프로젝트 필수 리소스",
            "type": "Resource",
            "project_id": sample_project.id,
            "planned_delivery_date": (datetime.now() + timedelta(days=10)).isoformat(),
            "status": "requested",
            "criticality": "high",
        }

        response = client.post(
            f"/api/v1/projects/{sample_project.id}/enablers",
            json=enabler_data
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        assert data["name"] == enabler_data["name"]
        assert data["type"] == enabler_data["type"]
        assert data["project_id"] == sample_project.id
        assert data["criticality"] == enabler_data["criticality"]
        assert "id" in data

    def test_create_enabler_project_not_found(self, client):
        """존재하지 않는 프로젝트에 Enabler 생성 시 404 에러"""
        enabler_data = {
            "name": "리소스",
            "type": "Resource",
            "project_id": 99999,
            "planned_delivery_date": datetime.now().isoformat(),
        }

        response = client.post("/api/v1/projects/99999/enablers", json=enabler_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_enabler_project_id_mismatch(self, client, sample_project):
        """URL project_id와 body project_id 불일치 시 400 에러"""
        enabler_data = {
            "name": "리소스",
            "type": "Resource",
            "project_id": sample_project.id + 1000,  # 다른 ID
            "planned_delivery_date": datetime.now().isoformat(),
        }

        response = client.post(
            f"/api/v1/projects/{sample_project.id}/enablers",
            json=enabler_data
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "일치하지 않습니다" in data["detail"]

    def test_list_project_enablers_empty(self, client, sample_project):
        """빈 Enabler 목록 조회"""
        response = client.get(f"/api/v1/projects/{sample_project.id}/enablers")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 0

    def test_list_project_enablers_with_data(self, client, sample_project, sample_enablers):
        """Enabler 목록 조회 (데이터 있음)"""
        response = client.get(f"/api/v1/projects/{sample_project.id}/enablers")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 3  # sample_enablers는 3개
        assert all(enabler["project_id"] == sample_project.id for enabler in data)

    def test_list_project_enablers_pagination(self, client, sample_project, sample_enablers):
        """Enabler 목록 페이지네이션 테스트"""
        # skip=0, limit=2
        response = client.get(
            f"/api/v1/projects/{sample_project.id}/enablers?skip=0&limit=2"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2

        # skip=2, limit=2
        response = client.get(
            f"/api/v1/projects/{sample_project.id}/enablers?skip=2&limit=2"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1  # 총 3개이므로 남은 1개

    def test_list_project_enablers_project_not_found(self, client):
        """존재하지 않는 프로젝트의 Enabler 목록 조회 시 404 에러"""
        response = client.get("/api/v1/projects/99999/enablers")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_enabler_success(self, client, sample_enablers):
        """Enabler 상세 조회 성공 테스트"""
        enabler = sample_enablers[0]

        response = client.get(f"/api/v1/enablers/{enabler.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == enabler.id
        assert data["name"] == enabler.name
        assert data["type"] == enabler.type

    def test_get_enabler_not_found(self, client):
        """존재하지 않는 Enabler 조회 시 404 에러"""
        response = client.get("/api/v1/enablers/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_enabler_success(self, client, sample_enablers):
        """Enabler 수정 성공 테스트"""
        enabler = sample_enablers[0]
        update_data = {
            "name": "수정된 리소스 이름",
            "status": "in_progress",
            "criticality": "critical",
        }

        response = client.put(f"/api/v1/enablers/{enabler.id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == enabler.id
        assert data["name"] == update_data["name"]
        assert data["status"] == update_data["status"]
        assert data["criticality"] == update_data["criticality"]

    def test_update_enabler_partial_update(self, client, sample_enablers):
        """부분 수정 테스트"""
        enabler = sample_enablers[0]
        update_data = {
            "status": "delivered",
        }

        response = client.put(f"/api/v1/enablers/{enabler.id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["status"] == "delivered"
        assert data["name"] == enabler.name  # 다른 필드는 유지

    def test_update_enabler_not_found(self, client):
        """존재하지 않는 Enabler 수정 시 404 에러"""
        update_data = {
            "name": "수정할 수 없음",
        }

        response = client.put("/api/v1/enablers/99999", json=update_data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_enabler_success(self, client, sample_enablers):
        """Enabler 삭제 성공 테스트"""
        enabler = sample_enablers[0]
        enabler_id = enabler.id

        response = client.delete(f"/api/v1/enablers/{enabler_id}")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 삭제 후 조회 시 404
        response = client.get(f"/api/v1/enablers/{enabler_id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_enabler_not_found(self, client):
        """존재하지 않는 Enabler 삭제 시 404 에러"""
        response = client.delete("/api/v1/enablers/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_enabler_status_values(self, client, sample_project):
        """Enabler 상태 값 테스트"""
        valid_statuses = ["requested", "in_progress", "delivered", "delayed", "cancelled"]

        for status_value in valid_statuses:
            enabler_data = {
                "name": f"Enabler {status_value}",
                "type": "Resource",
                "project_id": sample_project.id,
                "status": status_value,
                "planned_delivery_date": datetime.now().isoformat(),
            }

            response = client.post(
                f"/api/v1/projects/{sample_project.id}/enablers",
                json=enabler_data
            )

            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["status"] == status_value

    def test_enabler_criticality_values(self, client, sample_project):
        """Enabler 중요도 값 테스트"""
        valid_criticalities = ["low", "medium", "high", "critical"]

        for criticality in valid_criticalities:
            enabler_data = {
                "name": f"Enabler {criticality}",
                "type": "Resource",
                "project_id": sample_project.id,
                "criticality": criticality,
                "planned_delivery_date": datetime.now().isoformat(),
            }

            response = client.post(
                f"/api/v1/projects/{sample_project.id}/enablers",
                json=enabler_data
            )

            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["criticality"] == criticality
