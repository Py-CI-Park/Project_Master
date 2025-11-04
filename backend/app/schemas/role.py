"""
Role Pydantic 스키마
역할 관리 API를 위한 입출력 스키마
"""
from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field


# ============================================================================
# Role Schemas
# ============================================================================

class RoleBase(BaseModel):
    """역할 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=50, description="역할 이름")
    description: Optional[str] = Field(None, description="역할 설명")
    permissions: Dict[str, bool] = Field(default_factory=dict, description="권한 맵")


class RoleCreate(RoleBase):
    """역할 생성 요청 스키마"""
    pass


class RoleUpdate(BaseModel):
    """역할 수정 요청 스키마 (모든 필드 선택)"""
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="역할 이름")
    description: Optional[str] = Field(None, description="역할 설명")
    permissions: Optional[Dict[str, bool]] = Field(None, description="권한 맵")


class RoleInDB(RoleBase):
    """데이터베이스의 역할 스키마"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RolePublic(RoleInDB):
    """공개 역할 스키마 (API 응답용)"""
    pass


# ============================================================================
# UserRole Schemas
# ============================================================================

class UserRoleBase(BaseModel):
    """사용자-역할 기본 스키마"""
    user_id: int = Field(..., description="사용자 ID")
    role_id: int = Field(..., description="역할 ID")
    project_id: Optional[int] = Field(None, description="프로젝트 ID (NULL이면 전역)")


class UserRoleCreate(UserRoleBase):
    """사용자-역할 연결 생성 요청 스키마"""
    pass


class UserRoleInDB(UserRoleBase):
    """데이터베이스의 사용자-역할 스키마"""
    assigned_at: datetime

    class Config:
        from_attributes = True


class UserRolePublic(UserRoleInDB):
    """공개 사용자-역할 스키마 (API 응답용)"""
    pass


class UserRoleWithDetails(UserRolePublic):
    """역할 상세 정보가 포함된 사용자-역할 스키마"""
    role: RolePublic

    class Config:
        from_attributes = True


# ============================================================================
# Permission Check Schemas
# ============================================================================

class PermissionCheck(BaseModel):
    """권한 확인 요청 스키마"""
    permission: str = Field(..., description="확인할 권한 (예: 'project:create')")
    project_id: Optional[int] = Field(None, description="프로젝트 ID (프로젝트별 권한 확인 시)")


class PermissionCheckResponse(BaseModel):
    """권한 확인 응답 스키마"""
    has_permission: bool = Field(..., description="권한 보유 여부")
    permission: str = Field(..., description="확인한 권한")
    project_id: Optional[int] = Field(None, description="프로젝트 ID")


# ============================================================================
# Default Roles Configuration
# ============================================================================

DEFAULT_ROLES = {
    "Admin": {
        "description": "시스템 관리자 - 모든 권한",
        "permissions": {
            # 프로젝트 권한
            "project:create": True,
            "project:read": True,
            "project:update": True,
            "project:delete": True,
            # 태스크 권한
            "task:create": True,
            "task:read": True,
            "task:update": True,
            "task:delete": True,
            # 이네이블러 권한
            "enabler:create": True,
            "enabler:read": True,
            "enabler:update": True,
            "enabler:delete": True,
            # 사용자 권한
            "user:read": True,
            "user:manage": True,
            # 역할 권한
            "role:read": True,
            "role:manage": True,
        }
    },
    "Project Manager": {
        "description": "프로젝트 관리자 - 프로젝트 전체 관리 권한",
        "permissions": {
            "project:create": True,
            "project:read": True,
            "project:update": True,
            "project:delete": False,  # 프로젝트 삭제는 불가
            "task:create": True,
            "task:read": True,
            "task:update": True,
            "task:delete": True,
            "enabler:create": True,
            "enabler:read": True,
            "enabler:update": True,
            "enabler:delete": True,
            "user:read": True,
            "user:manage": False,
            "role:read": True,
            "role:manage": False,
        }
    },
    "Team Member": {
        "description": "팀 멤버 - 태스크 관리 권한",
        "permissions": {
            "project:create": False,
            "project:read": True,
            "project:update": False,
            "project:delete": False,
            "task:create": True,
            "task:read": True,
            "task:update": True,
            "task:delete": False,  # 자신의 태스크만 삭제 가능 (추후 구현)
            "enabler:create": False,
            "enabler:read": True,
            "enabler:update": False,
            "enabler:delete": False,
            "user:read": True,
            "user:manage": False,
            "role:read": False,
            "role:manage": False,
        }
    },
    "Viewer": {
        "description": "뷰어 - 읽기 전용 권한",
        "permissions": {
            "project:create": False,
            "project:read": True,
            "project:update": False,
            "project:delete": False,
            "task:create": False,
            "task:read": True,
            "task:update": False,
            "task:delete": False,
            "enabler:create": False,
            "enabler:read": True,
            "enabler:update": False,
            "enabler:delete": False,
            "user:read": True,
            "user:manage": False,
            "role:read": False,
            "role:manage": False,
        }
    }
}
