"""
User CRUD Operations

사용자 생성, 조회, 수정, 삭제 등의 데이터베이스 작업을 처리합니다.
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    사용자 ID로 사용자 조회

    Args:
        db: 데이터베이스 세션
        user_id: 조회할 사용자 ID

    Returns:
        User 객체 또는 None (존재하지 않을 경우)
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    사용자명으로 사용자 조회

    Args:
        db: 데이터베이스 세션
        username: 조회할 사용자명

    Returns:
        User 객체 또는 None (존재하지 않을 경우)
    """
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    이메일로 사용자 조회

    Args:
        db: 데이터베이스 세션
        email: 조회할 이메일 주소

    Returns:
        User 객체 또는 None (존재하지 않을 경우)
    """
    return db.query(User).filter(User.email == email).first()


def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None
) -> List[User]:
    """
    사용자 목록 조회 (페이지네이션 지원)

    Args:
        db: 데이터베이스 세션
        skip: 건너뛸 사용자 수 (오프셋)
        limit: 조회할 최대 사용자 수
        is_active: 활성 상태 필터 (None이면 전체 조회)

    Returns:
        User 객체 리스트
    """
    query = db.query(User)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate) -> User:
    """
    새 사용자 생성

    Args:
        db: 데이터베이스 세션
        user: 사용자 생성 데이터 (UserCreate 스키마)

    Returns:
        생성된 User 객체

    Raises:
        IntegrityError: username 또는 email이 이미 존재할 경우
    """
    # 비밀번호 해싱
    hashed_password = get_password_hash(user.password)

    # User 객체 생성
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_active=True,  # 기본값: 활성화
        is_superuser=False  # 기본값: 일반 사용자
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    사용자 정보 수정

    Args:
        db: 데이터베이스 세션
        user_id: 수정할 사용자 ID
        user_update: 수정할 데이터 (UserUpdate 스키마)

    Returns:
        수정된 User 객체 또는 None (사용자가 존재하지 않을 경우)
    """
    db_user = get_user(db, user_id)

    if db_user is None:
        return None

    # 수정할 데이터만 추출 (None이 아닌 값만)
    update_data = user_update.model_dump(exclude_unset=True)

    # 비밀번호가 포함된 경우 해싱 처리
    if "password" in update_data and update_data["password"] is not None:
        hashed_password = get_password_hash(update_data.pop("password"))
        update_data["hashed_password"] = hashed_password

    # updated_at 필드 갱신
    update_data["updated_at"] = datetime.utcnow()

    # 각 필드 업데이트
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """
    사용자 삭제

    Args:
        db: 데이터베이스 세션
        user_id: 삭제할 사용자 ID

    Returns:
        삭제 성공 여부 (True/False)
    """
    db_user = get_user(db, user_id)

    if db_user is None:
        return False

    db.delete(db_user)
    db.commit()

    return True


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    사용자 인증 (로그인)

    username과 password로 사용자를 인증합니다.

    Args:
        db: 데이터베이스 세션
        username: 사용자명
        password: 평문 비밀번호

    Returns:
        인증된 User 객체 또는 None (인증 실패 시)
    """
    user = get_user_by_username(db, username)

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def update_last_login(db: Session, user_id: int) -> Optional[User]:
    """
    사용자 마지막 로그인 시각 업데이트

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID

    Returns:
        업데이트된 User 객체 또는 None
    """
    db_user = get_user(db, user_id)

    if db_user is None:
        return None

    db_user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    return db_user


def count_users(db: Session, is_active: Optional[bool] = None) -> int:
    """
    사용자 수 카운트

    Args:
        db: 데이터베이스 세션
        is_active: 활성 상태 필터 (None이면 전체 카운트)

    Returns:
        사용자 수
    """
    query = db.query(User)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.count()
