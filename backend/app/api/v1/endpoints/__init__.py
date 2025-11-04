"""
API v1 Endpoints

모든 v1 API 엔드포인트를 이 패키지에서 관리합니다.
"""

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dependencies import router as dependencies_router
from app.api.v1.endpoints.enablers import router as enablers_router
from app.api.v1.endpoints.projects import router as projects_router
from app.api.v1.endpoints.roles import router as roles_router
from app.api.v1.endpoints.tasks import router as tasks_router
from app.api.v1.endpoints.users import router as users_router

__all__ = [
    "auth_router",
    "projects_router",
    "tasks_router",
    "enablers_router",
    "dependencies_router",
    "users_router",
    "roles_router",
]
