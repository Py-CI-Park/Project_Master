"""
User Management API Endpoints

사용자 관리 관련 API 엔드포인트를 제공합니다.
- 사용자 목록 조회 (GET /api/v1/users) - 관리자만
- 사용자 상세 조회 (GET /api/v1/users/{id})
- 사용자 수정 (PUT /api/v1/users/{id})
- 사용자 삭제 (DELETE /api/v1/users/{id}) - 관리자만
- 내 정보 조회 (GET /api/v1/users/me)
- 내 정보 수정 (PUT /api/v1/users/me)
"""

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import user as user_crud
from app.schemas.user import UserPublic, UserUpdate, UserMe
from app.api.deps import get_current_active_user, get_current_superuser
from app.models.user import User


router = APIRouter()


@router.get("/me", response_model=UserMe)
def read_user_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    내 정보 조회

    현재 로그인한 사용자의 정보를 조회합니다.

    **응답 예시:**
    ```json
    {
        "id": 1,
        "username": "johndoe",
        "email": "johndoe@example.com",
        "full_name": "John Doe",
        "is_active": true,
        "is_superuser": false,
        "created_at": "2025-11-04T12:00:00",
        "updated_at": "2025-11-04T12:00:00",
        "last_login": "2025-11-04T12:30:00",
        "avatar_url": null
    }
    ```

    **에러:**
    - 401: 인증되지 않음 (토큰 없음 또는 유효하지 않음)
    """
    return current_user


@router.put("/me", response_model=UserMe)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    내 정보 수정

    현재 로그인한 사용자의 정보를 수정합니다.

    **요청 예시:**
    ```json
    {
        "email": "newemail@example.com",
        "full_name": "John Doe Updated",
        "password": "NewPassword123!",
        "avatar_url": "https://example.com/avatar.jpg"
    }
    ```

    **참고:**
    - 모든 필드는 선택적입니다.
    - 제공된 필드만 수정됩니다.
    - `is_active` 필드는 일반 사용자가 수정할 수 없습니다.
    - 비밀번호를 변경하면 자동으로 해싱됩니다.

    **에러:**
    - 400: 이메일이 이미 사용 중
    - 401: 인증되지 않음
    """
    # is_active 필드는 일반 사용자가 수정할 수 없음
    if user_in.is_active is not None:
        user_in.is_active = None

    # 이메일 중복 체크
    if user_in.email is not None:
        existing_user = user_crud.get_user_by_email(db, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # 사용자 정보 업데이트
    updated_user = user_crud.update_user(db, user_id=current_user.id, user=user_in)

    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return updated_user


@router.get("", response_model=List[UserPublic])
def read_users(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(100, ge=1, le=100, description="가져올 항목 수"),
    current_user: User = Depends(get_current_superuser)
) -> Any:
    """
    사용자 목록 조회 (관리자 전용)

    모든 사용자의 목록을 페이지네이션하여 조회합니다.

    **쿼리 파라미터:**
    - `skip`: 건너뛸 항목 수 (기본값: 0)
    - `limit`: 가져올 항목 수 (기본값: 100, 최대: 100)

    **응답 예시:**
    ```json
    [
        {
            "id": 1,
            "username": "admin",
            "email": "admin@example.com",
            "full_name": "Admin User",
            "is_active": true,
            "is_superuser": true,
            "created_at": "2025-11-04T10:00:00",
            "updated_at": "2025-11-04T10:00:00",
            "last_login": "2025-11-04T15:00:00",
            "avatar_url": null
        },
        {
            "id": 2,
            "username": "johndoe",
            "email": "johndoe@example.com",
            "full_name": "John Doe",
            "is_active": true,
            "is_superuser": false,
            "created_at": "2025-11-04T12:00:00",
            "updated_at": "2025-11-04T12:00:00",
            "last_login": "2025-11-04T14:00:00",
            "avatar_url": null
        }
    ]
    ```

    **에러:**
    - 401: 인증되지 않음
    - 403: 권한 없음 (관리자가 아님)
    """
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserPublic)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    사용자 상세 조회

    특정 사용자의 상세 정보를 조회합니다.

    **권한:**
    - 관리자: 모든 사용자 조회 가능
    - 일반 사용자: 자신의 정보만 조회 가능

    **에러:**
    - 401: 인증되지 않음
    - 403: 권한 없음 (다른 사용자의 정보를 조회하려고 시도)
    - 404: 사용자를 찾을 수 없음
    """
    # 권한 체크: 관리자이거나 본인만 조회 가능
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = user_crud.get_user(db, user_id=user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.put("/{user_id}", response_model=UserPublic)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    사용자 정보 수정

    특정 사용자의 정보를 수정합니다.

    **권한:**
    - 관리자: 모든 사용자 정보 수정 가능 (is_active 포함)
    - 일반 사용자: 자신의 정보만 수정 가능 (is_active 제외)

    **요청 예시:**
    ```json
    {
        "email": "newemail@example.com",
        "full_name": "Updated Name",
        "password": "NewPassword123!",
        "is_active": false,
        "avatar_url": "https://example.com/avatar.jpg"
    }
    ```

    **참고:**
    - 모든 필드는 선택적입니다.
    - 제공된 필드만 수정됩니다.
    - 일반 사용자는 `is_active` 필드를 수정할 수 없습니다.

    **에러:**
    - 400: 이메일이 이미 사용 중
    - 401: 인증되지 않음
    - 403: 권한 없음 (다른 사용자의 정보를 수정하려고 시도)
    - 404: 사용자를 찾을 수 없음
    """
    # 권한 체크: 관리자이거나 본인만 수정 가능
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # 일반 사용자는 is_active 필드를 수정할 수 없음
    if not current_user.is_superuser and user_in.is_active is not None:
        user_in.is_active = None

    # 이메일 중복 체크
    if user_in.email is not None:
        existing_user = user_crud.get_user_by_email(db, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    # 사용자 정보 업데이트
    updated_user = user_crud.update_user(db, user_id=user_id, user=user_in)

    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
) -> None:
    """
    사용자 삭제 (관리자 전용)

    특정 사용자를 데이터베이스에서 삭제합니다.

    **권한:**
    - 관리자만 사용자를 삭제할 수 있습니다.

    **참고:**
    - 사용자를 삭제하면 관련된 모든 데이터도 함께 삭제될 수 있습니다.
    - 자기 자신을 삭제할 수 없습니다.

    **에러:**
    - 400: 자기 자신을 삭제하려고 시도
    - 401: 인증되지 않음
    - 403: 권한 없음 (관리자가 아님)
    - 404: 사용자를 찾을 수 없음
    """
    # 자기 자신을 삭제할 수 없음
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Users cannot delete themselves"
        )

    # 사용자 삭제
    success = user_crud.delete_user(db, user_id=user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return None
