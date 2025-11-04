"""
Role API 엔드포인트
역할 관리 및 권한 시스템 API
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_active_user, get_current_superuser
from app.models.user import User
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RolePublic,
    UserRoleCreate,
    UserRolePublic,
    UserRoleWithDetails,
    PermissionCheck,
    PermissionCheckResponse,
)
from app.crud import role as role_crud


router = APIRouter()


# ============================================================================
# Role CRUD Endpoints
# ============================================================================

@router.get("/", response_model=List[RolePublic])
def list_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    역할 목록 조회

    모든 인증된 사용자가 조회 가능 (역할 확인용)
    """
    roles = role_crud.list_roles(db, skip=skip, limit=limit)
    return roles


@router.get("/{role_id}", response_model=RolePublic)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """역할 상세 조회"""
    role = role_crud.get_role(db, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role


@router.post("/", response_model=RolePublic, status_code=status.HTTP_201_CREATED)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),  # 관리자만
):
    """
    역할 생성 (관리자 전용)

    새 역할을 생성합니다.
    """
    # 중복 이름 확인
    existing_role = role_crud.get_role_by_name(db, role_in.name)
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists"
        )

    role = role_crud.create_role(db, role_in)
    return role


@router.put("/{role_id}", response_model=RolePublic)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),  # 관리자만
):
    """역할 수정 (관리자 전용)"""
    role = role_crud.update_role(db, role_id, role_in)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),  # 관리자만
):
    """역할 삭제 (관리자 전용)"""
    success = role_crud.delete_role(db, role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return None


# ============================================================================
# User Role Assignment Endpoints
# ============================================================================

@router.post("/{role_id}/assign", response_model=UserRolePublic, status_code=status.HTTP_201_CREATED)
def assign_role(
    role_id: int,
    user_role: UserRoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),  # 관리자만
):
    """
    사용자에게 역할 할당 (관리자 전용)

    - project_id가 None이면 전역 역할
    - project_id가 지정되면 해당 프로젝트에만 적용
    """
    # 역할 존재 확인
    role = role_crud.get_role(db, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    # role_id 일치 확인
    if user_role.role_id != role_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role ID mismatch"
        )

    try:
        user_role_obj = role_crud.assign_role_to_user(
            db,
            user_role.user_id,
            user_role.role_id,
            user_role.project_id
        )
        return user_role_obj
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to assign role: {str(e)}"
        )


@router.delete("/{role_id}/revoke", status_code=status.HTTP_204_NO_CONTENT)
def revoke_role(
    role_id: int,
    user_id: int = Query(..., description="사용자 ID"),
    project_id: Optional[int] = Query(None, description="프로젝트 ID (None이면 전역)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),  # 관리자만
):
    """사용자로부터 역할 제거 (관리자 전용)"""
    success = role_crud.remove_role_from_user(db, user_id, role_id, project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User role assignment not found"
        )
    return None


# ============================================================================
# User Roles & Permissions Endpoints
# ============================================================================

@router.get("/users/{user_id}/roles", response_model=List[UserRoleWithDetails])
def get_user_roles(
    user_id: int,
    project_id: Optional[int] = Query(None, description="프로젝트 ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    사용자의 역할 목록 조회

    - 자신의 역할은 누구나 조회 가능
    - 다른 사용자의 역할은 관리자만 조회 가능
    """
    # 권한 확인 (자신 또는 관리자)
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view other user's roles"
        )

    user_roles = role_crud.get_user_roles(db, user_id, project_id)
    return user_roles


@router.get("/users/me/permissions", response_model=dict)
def get_my_permissions(
    project_id: Optional[int] = Query(None, description="프로젝트 ID"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    내 권한 조회

    현재 사용자의 모든 권한을 반환합니다.
    슈퍼유저는 {"*": true}를 반환합니다.
    """
    if current_user.is_superuser:
        return {"*": True}

    permissions = role_crud.get_user_permissions(db, current_user.id, project_id)
    return permissions


@router.post("/check-permission", response_model=PermissionCheckResponse)
def check_permission(
    permission_check: PermissionCheck,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    권한 확인

    현재 사용자가 특정 권한을 가지고 있는지 확인합니다.
    """
    if current_user.is_superuser:
        return PermissionCheckResponse(
            has_permission=True,
            permission=permission_check.permission,
            project_id=permission_check.project_id
        )

    has_permission = role_crud.user_has_permission(
        db,
        current_user.id,
        permission_check.permission,
        permission_check.project_id
    )

    return PermissionCheckResponse(
        has_permission=has_permission,
        permission=permission_check.permission,
        project_id=permission_check.project_id
    )


# ============================================================================
# Project Members Endpoints
# ============================================================================

@router.get("/projects/{project_id}/members", response_model=List[UserRoleWithDetails])
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    프로젝트 멤버 목록 조회

    해당 프로젝트에 할당된 멤버와 역할을 조회합니다.
    """
    # TODO: 프로젝트 접근 권한 확인 (프로젝트 멤버 또는 관리자)
    members = role_crud.get_project_members(db, project_id)
    return members
