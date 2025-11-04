"""
Role CRUD 함수
역할 및 사용자-역할 연결 관리
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.role import Role, UserRole
from app.schemas.role import RoleCreate, RoleUpdate, UserRoleCreate


# ============================================================================
# Role CRUD Operations
# ============================================================================

def create_role(db: Session, role_in: RoleCreate) -> Role:
    """
    새 역할 생성

    Args:
        db: 데이터베이스 세션
        role_in: 역할 생성 데이터

    Returns:
        생성된 역할 객체

    Raises:
        IntegrityError: 중복된 역할 이름
    """
    db_role = Role(
        name=role_in.name,
        description=role_in.description,
        permissions=role_in.permissions,
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def get_role(db: Session, role_id: int) -> Optional[Role]:
    """
    ID로 역할 조회

    Args:
        db: 데이터베이스 세션
        role_id: 역할 ID

    Returns:
        역할 객체 또는 None
    """
    return db.query(Role).filter(Role.id == role_id).first()


def get_role_by_name(db: Session, name: str) -> Optional[Role]:
    """
    이름으로 역할 조회

    Args:
        db: 데이터베이스 세션
        name: 역할 이름

    Returns:
        역할 객체 또는 None
    """
    return db.query(Role).filter(Role.name == name).first()


def list_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    """
    역할 목록 조회 (페이지네이션)

    Args:
        db: 데이터베이스 세션
        skip: 건너뛸 레코드 수
        limit: 최대 레코드 수

    Returns:
        역할 목록
    """
    return db.query(Role).offset(skip).limit(limit).all()


def update_role(db: Session, role_id: int, role_in: RoleUpdate) -> Optional[Role]:
    """
    역할 수정

    Args:
        db: 데이터베이스 세션
        role_id: 역할 ID
        role_in: 수정할 데이터

    Returns:
        수정된 역할 객체 또는 None
    """
    db_role = get_role(db, role_id)
    if not db_role:
        return None

    update_data = role_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_role, field, value)

    db.commit()
    db.refresh(db_role)
    return db_role


def delete_role(db: Session, role_id: int) -> bool:
    """
    역할 삭제

    Args:
        db: 데이터베이스 세션
        role_id: 역할 ID

    Returns:
        삭제 성공 여부
    """
    db_role = get_role(db, role_id)
    if not db_role:
        return False

    db.delete(db_role)
    db.commit()
    return True


def count_roles(db: Session) -> int:
    """
    총 역할 수 조회

    Args:
        db: 데이터베이스 세션

    Returns:
        역할 개수
    """
    return db.query(Role).count()


# ============================================================================
# UserRole CRUD Operations
# ============================================================================

def assign_role_to_user(
    db: Session,
    user_id: int,
    role_id: int,
    project_id: Optional[int] = None
) -> UserRole:
    """
    사용자에게 역할 할당

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        role_id: 역할 ID
        project_id: 프로젝트 ID (NULL이면 전역 역할)

    Returns:
        생성된 사용자-역할 연결 객체

    Raises:
        IntegrityError: 이미 할당된 역할
    """
    db_user_role = UserRole(
        user_id=user_id,
        role_id=role_id,
        project_id=project_id,
    )
    db.add(db_user_role)
    db.commit()
    db.refresh(db_user_role)
    return db_user_role


def remove_role_from_user(
    db: Session,
    user_id: int,
    role_id: int,
    project_id: Optional[int] = None
) -> bool:
    """
    사용자로부터 역할 제거

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        role_id: 역할 ID
        project_id: 프로젝트 ID (NULL이면 전역 역할)

    Returns:
        제거 성공 여부
    """
    query = db.query(UserRole).filter(
        and_(
            UserRole.user_id == user_id,
            UserRole.role_id == role_id,
        )
    )

    if project_id is not None:
        query = query.filter(UserRole.project_id == project_id)
    else:
        query = query.filter(UserRole.project_id.is_(None))

    db_user_role = query.first()
    if not db_user_role:
        return False

    db.delete(db_user_role)
    db.commit()
    return True


def get_user_roles(
    db: Session,
    user_id: int,
    project_id: Optional[int] = None
) -> List[UserRole]:
    """
    사용자의 역할 목록 조회

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        project_id: 프로젝트 ID (None이면 모든 역할, -1이면 전역 역할만)

    Returns:
        사용자-역할 연결 목록
    """
    query = db.query(UserRole).filter(UserRole.user_id == user_id)

    if project_id == -1:
        # 전역 역할만 조회
        query = query.filter(UserRole.project_id.is_(None))
    elif project_id is not None:
        # 특정 프로젝트 역할 + 전역 역할
        query = query.filter(
            (UserRole.project_id == project_id) |
            (UserRole.project_id.is_(None))
        )

    return query.all()


def get_project_members(db: Session, project_id: int) -> List[UserRole]:
    """
    프로젝트 멤버 목록 조회

    Args:
        db: 데이터베이스 세션
        project_id: 프로젝트 ID

    Returns:
        프로젝트 멤버의 사용자-역할 연결 목록
    """
    return db.query(UserRole).filter(UserRole.project_id == project_id).all()


def user_has_role(
    db: Session,
    user_id: int,
    role_name: str,
    project_id: Optional[int] = None
) -> bool:
    """
    사용자가 특정 역할을 가지고 있는지 확인

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        role_name: 역할 이름
        project_id: 프로젝트 ID (None이면 전역 + 프로젝트 역할 모두 확인)

    Returns:
        역할 보유 여부
    """
    query = db.query(UserRole).join(Role).filter(
        and_(
            UserRole.user_id == user_id,
            Role.name == role_name,
        )
    )

    if project_id is not None:
        query = query.filter(
            (UserRole.project_id == project_id) |
            (UserRole.project_id.is_(None))
        )
    else:
        query = query.filter(UserRole.project_id.is_(None))

    return query.first() is not None


def user_has_permission(
    db: Session,
    user_id: int,
    permission: str,
    project_id: Optional[int] = None
) -> bool:
    """
    사용자가 특정 권한을 가지고 있는지 확인

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        permission: 권한 문자열 (예: 'project:create')
        project_id: 프로젝트 ID (None이면 전역 권한 확인)

    Returns:
        권한 보유 여부
    """
    # 사용자의 역할 조회
    user_roles = get_user_roles(db, user_id, project_id)

    # 각 역할의 권한 확인
    for user_role in user_roles:
        role = user_role.role
        if role.has_permission(permission):
            return True

    return False


def get_user_permissions(
    db: Session,
    user_id: int,
    project_id: Optional[int] = None
) -> dict:
    """
    사용자의 모든 권한 조회 (통합)

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        project_id: 프로젝트 ID (None이면 전역 권한만)

    Returns:
        권한 딕셔너리 (권한명: True/False)
    """
    # 사용자의 역할 조회
    user_roles = get_user_roles(db, user_id, project_id)

    # 모든 역할의 권한 병합 (OR 연산)
    merged_permissions = {}
    for user_role in user_roles:
        role = user_role.role
        for perm, value in role.permissions.items():
            if value:  # True인 권한만 추가
                merged_permissions[perm] = True

    return merged_permissions
