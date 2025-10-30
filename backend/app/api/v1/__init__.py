"""
API v1 Router

v1 API의 모든 엔드포인트를 통합하는 라우터
"""

from fastapi import APIRouter

from app.api.v1.endpoints import enablers_router, projects_router, tasks_router

api_router = APIRouter()

# Projects 엔드포인트 등록
api_router.include_router(
    projects_router,
    prefix="/projects",
    tags=["projects"],
)

# Tasks 엔드포인트 등록
# /projects/{id}/tasks와 /tasks/{id} 엔드포인트 포함
api_router.include_router(
    tasks_router,
    tags=["tasks"],
)

# Enablers 엔드포인트 등록
# /projects/{id}/enablers와 /enablers/{id} 엔드포인트 포함
api_router.include_router(
    enablers_router,
    tags=["enablers"],
)

__all__ = ["api_router"]
