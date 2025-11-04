"""
Authentication API Endpoints

사용자 인증 관련 API 엔드포인트를 제공합니다.
- 회원가입 (POST /api/v1/auth/register)
- 로그인 (POST /api/v1/auth/login)
- 토큰 갱신 (POST /api/v1/auth/refresh)
- 로그아웃 (POST /api/v1/auth/logout)
- 현재 사용자 정보 조회 (GET /api/v1/auth/me)
"""

from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.crud import user as user_crud
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    RefreshTokenRequest,
)
from app.schemas.user import UserPublic, UserMe
from app.api.deps import get_current_active_user
from app.models.user import User


router = APIRouter()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db)
) -> Any:
    """
    사용자 회원가입

    새로운 사용자 계정을 생성합니다.

    **요청 예시:**
    ```json
    {
        "username": "johndoe",
        "email": "johndoe@example.com",
        "password": "StrongPass123!",
        "full_name": "John Doe"
    }
    ```

    **응답:**
    - 201: 성공적으로 생성됨
    - 400: username 또는 email이 이미 존재함
    """
    # 중복 체크: username
    existing_user = user_crud.get_user_by_username(db, username=user_in.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # 중복 체크: email
    existing_email = user_crud.get_user_by_email(db, email=user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 사용자 생성
    user = user_crud.create_user(db, user=user_in)

    return user


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    사용자 로그인

    username과 password로 로그인하여 JWT 토큰을 발급받습니다.

    **OAuth2 Password Flow 사용:**
    - Content-Type: application/x-www-form-urlencoded
    - username: 사용자명
    - password: 비밀번호

    **요청 예시 (form-urlencoded):**
    ```
    username=johndoe&password=StrongPass123!
    ```

    **응답:**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "token_type": "bearer",
        "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
    }
    ```

    **에러:**
    - 401: 인증 실패 (잘못된 username 또는 password)
    - 400: 비활성화된 사용자
    """
    # 사용자 인증
    user = user_crud.authenticate_user(
        db,
        username=form_data.username,
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 비활성 사용자 체크
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Access Token 생성 (30분)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username,
        expires_delta=access_token_expires
    )

    # Refresh Token 생성 (7일)
    refresh_token = create_refresh_token(subject=user.username)

    # 마지막 로그인 시각 업데이트
    user_crud.update_last_login(db, user_id=user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Access Token 갱신

    Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급받습니다.

    **요청 예시:**
    ```json
    {
        "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
    }
    ```

    **응답:**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "token_type": "bearer",
        "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
    }
    ```

    **에러:**
    - 401: 유효하지 않은 Refresh Token
    - 404: 사용자를 찾을 수 없음
    """
    # Refresh Token 검증
    username = verify_refresh_token(refresh_request.refresh_token)

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 사용자 조회
    user = user_crud.get_user_by_username(db, username=username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 비활성 사용자 체크
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # 새 토큰 발급
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        subject=user.username,
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(subject=user.username)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token
    }


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    사용자 로그아웃

    현재 로그인된 사용자를 로그아웃합니다.
    (v2.0에서는 JWT 토큰을 클라이언트에서 삭제하는 것으로 처리)

    **응답:**
    ```json
    {
        "message": "Successfully logged out"
    }
    ```

    **참고:**
    - JWT 토큰은 stateless이므로 서버에서 무효화할 수 없습니다.
    - 클라이언트에서 토큰을 삭제하여 로그아웃을 처리합니다.
    - 향후 Redis 기반 토큰 블랙리스트 기능 추가 예정 (Phase 14)
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserMe)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    현재 로그인한 사용자 정보 조회

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
