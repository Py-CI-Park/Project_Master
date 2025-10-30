"""
API v1 Endpoints

모든 v1 API 엔드포인트를 이 패키지에서 관리합니다.
"""

from app.api.v1.endpoints.projects import router as projects_router

__all__ = ["projects_router"]
