"""
API Dependencies

FastAPI 엔드포인트에서 사용하는 의존성 함수들을 정의합니다.
인증, 권한 체크, 데이터베이스 세션 등을 제공합니다.
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import verify_token
from app.crud import user as user_crud
from app.models.user import User


# OAuth2 Password Bearer 스키마 정의
# tokenUrl은 로그인 엔드포인트의 경로입니다
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    현재 인증된 사용자 조회

    JWT 토큰을 검증하고 해당 사용자를 데이터베이스에서 조회합니다.

    Args:
        db: 데이터베이스 세션
        token: JWT 액세스 토큰 (Authorization 헤더에서 자동 추출)

    Returns:
        현재 인증된 User 객체

    Raises:
        HTTPException: 인증 실패 시 401 Unauthorized
    """
    # JWT 토큰 검증 및 사용자명 추출
    username = verify_token(token)

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 데이터베이스에서 사용자 조회
    user = user_crud.get_user_by_username(db, username=username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    현재 활성화된 사용자 조회

    인증된 사용자 중 활성 상태(is_active=True)인 사용자만 허용합니다.

    Args:
        current_user: 현재 인증된 사용자

    Returns:
        활성화된 User 객체

    Raises:
        HTTPException: 비활성화된 사용자일 경우 400 Bad Request
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return current_user


def get_current_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    현재 슈퍼유저 조회

    활성화된 사용자 중 슈퍼유저(is_superuser=True)만 허용합니다.
    관리자 전용 API에서 사용됩니다.

    Args:
        current_user: 현재 활성화된 사용자

    Returns:
        슈퍼유저 User 객체

    Raises:
        HTTPException: 슈퍼유저가 아닐 경우 403 Forbidden
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )

    return current_user


# 옵셔널 인증 (인증이 선택적인 엔드포인트용)
# 토큰이 없어도 에러를 발생시키지 않습니다
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False  # 토큰 없을 때 에러 발생 안 함
)


def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional)
) -> Optional[User]:
    """
    현재 사용자 조회 (선택적)

    토큰이 제공되면 검증하고 사용자를 반환합니다.
    토큰이 없거나 유효하지 않으면 None을 반환합니다.
    공개 API에서 "로그인한 사용자에게만 추가 정보 제공" 같은 경우에 사용합니다.

    Args:
        db: 데이터베이스 세션
        token: JWT 액세스 토큰 (선택적)

    Returns:
        User 객체 또는 None
    """
    if token is None:
        return None

    # JWT 토큰 검증
    username = verify_token(token)

    if username is None:
        return None

    # 데이터베이스에서 사용자 조회
    user = user_crud.get_user_by_username(db, username=username)

    # 비활성 사용자는 None 반환
    if user is not None and not user.is_active:
        return None

    return user
