"""
API v1 Router

v1 API의 모든 엔드포인트를 통합하는 라우터
"""

from fastapi import APIRouter

from app.api.v1.endpoints import projects_router

api_router = APIRouter()

# Projects 엔드포인트 등록
api_router.include_router(
    projects_router,
    prefix="/projects",
    tags=["projects"],
)

__all__ = ["api_router"]
