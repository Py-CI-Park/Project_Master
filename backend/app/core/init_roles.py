"""
기본 역할 초기화 스크립트

애플리케이션 시작 시 기본 역할(Admin, Project Manager, Team Member, Viewer)을
데이터베이스에 생성합니다.
"""

from sqlalchemy.orm import Session

from app.crud.role import get_role_by_name, create_role
from app.schemas.role import RoleCreate, DEFAULT_ROLES
from app.core.logging import logger


def init_default_roles(db: Session) -> None:
    """
    기본 역할 초기화

    DEFAULT_ROLES에 정의된 4개의 기본 역할을 데이터베이스에 생성합니다.
    이미 존재하는 역할은 건너뜁니다.

    Args:
        db: 데이터베이스 세션

    Raises:
        Exception: 역할 생성 중 오류 발생 시
    """
    logger.info("기본 역할 초기화 시작")

    created_count = 0
    skipped_count = 0

    for role_name, role_config in DEFAULT_ROLES.items():
        try:
            # 이미 존재하는 역할인지 확인
            existing_role = get_role_by_name(db, role_name)

            if existing_role:
                logger.debug(f"역할 '{role_name}'이(가) 이미 존재합니다. 건너뜁니다.")
                skipped_count += 1
                continue

            # 새 역할 생성
            role_in = RoleCreate(
                name=role_name,
                description=role_config["description"],
                permissions=role_config["permissions"],
            )

            create_role(db, role_in)
            logger.info(f"기본 역할 '{role_name}' 생성 완료")
            created_count += 1

        except Exception as e:
            logger.error(f"역할 '{role_name}' 생성 실패: {str(e)}")
            raise

    logger.info(
        f"기본 역할 초기화 완료: {created_count}개 생성, {skipped_count}개 건너뜀"
    )


def init_roles_on_startup(db: Session) -> None:
    """
    애플리케이션 시작 시 역할 초기화

    이 함수는 main.py의 startup 이벤트에서 호출됩니다.

    Args:
        db: 데이터베이스 세션
    """
    try:
        init_default_roles(db)
    except Exception as e:
        logger.error(f"기본 역할 초기화 실패: {str(e)}")
        # 실패해도 애플리케이션은 계속 실행되도록 함
        # 관리자가 수동으로 역할을 생성할 수 있음
