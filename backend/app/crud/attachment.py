"""
Attachment CRUD Operations

첨부파일 생성, 조회, 수정, 삭제 등의 데이터베이스 작업을 처리합니다.
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentCreate, AttachmentUpdate


def create_attachment(db: Session, attachment: AttachmentCreate) -> Attachment:
    """
    첨부파일 메타데이터 생성

    Args:
        db: 데이터베이스 세션
        attachment: 생성할 첨부파일 정보

    Returns:
        생성된 Attachment 객체
    """
    db_attachment = Attachment(
        filename=attachment.filename,
        stored_filename=attachment.stored_filename,
        file_path=attachment.file_path,
        file_size=attachment.file_size,
        content_type=attachment.content_type,
        entity_type=attachment.entity_type,
        entity_id=attachment.entity_id,
        uploaded_by=attachment.uploaded_by,
        description=attachment.description,
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment


def get_attachment(db: Session, attachment_id: int) -> Optional[Attachment]:
    """
    첨부파일 ID로 첨부파일 조회

    Args:
        db: 데이터베이스 세션
        attachment_id: 조회할 첨부파일 ID

    Returns:
        Attachment 객체 또는 None (존재하지 않을 경우)
    """
    return db.query(Attachment).filter(Attachment.id == attachment_id).first()


def get_attachment_by_stored_filename(
    db: Session, stored_filename: str
) -> Optional[Attachment]:
    """
    저장된 파일명으로 첨부파일 조회

    Args:
        db: 데이터베이스 세션
        stored_filename: 저장된 파일명 (UUID)

    Returns:
        Attachment 객체 또는 None (존재하지 않을 경우)
    """
    return (
        db.query(Attachment)
        .filter(Attachment.stored_filename == stored_filename)
        .first()
    )


def get_attachments_by_entity(
    db: Session,
    entity_type: str,
    entity_id: int,
    skip: int = 0,
    limit: int = 100,
) -> List[Attachment]:
    """
    특정 엔티티에 속한 첨부파일 목록 조회

    Args:
        db: 데이터베이스 세션
        entity_type: 엔티티 타입 (project, task, enabler 등)
        entity_id: 엔티티 ID
        skip: 건너뛸 개수 (오프셋)
        limit: 조회할 최대 개수

    Returns:
        Attachment 객체 리스트
    """
    return (
        db.query(Attachment)
        .filter(
            Attachment.entity_type == entity_type,
            Attachment.entity_id == entity_id
        )
        .order_by(Attachment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_attachments_by_entity(
    db: Session, entity_type: str, entity_id: int
) -> int:
    """
    특정 엔티티에 속한 첨부파일 개수 조회

    Args:
        db: 데이터베이스 세션
        entity_type: 엔티티 타입
        entity_id: 엔티티 ID

    Returns:
        첨부파일 개수
    """
    return (
        db.query(Attachment)
        .filter(
            Attachment.entity_type == entity_type,
            Attachment.entity_id == entity_id
        )
        .count()
    )


def get_attachments_by_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[Attachment]:
    """
    특정 사용자가 업로드한 첨부파일 목록 조회

    Args:
        db: 데이터베이스 세션
        user_id: 사용자 ID
        skip: 건너뛸 개수 (오프셋)
        limit: 조회할 최대 개수

    Returns:
        Attachment 객체 리스트
    """
    return (
        db.query(Attachment)
        .filter(Attachment.uploaded_by == user_id)
        .order_by(Attachment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_attachment(
    db: Session, attachment_id: int, attachment_update: AttachmentUpdate
) -> Optional[Attachment]:
    """
    첨부파일 정보 수정

    Args:
        db: 데이터베이스 세션
        attachment_id: 수정할 첨부파일 ID
        attachment_update: 수정할 정보

    Returns:
        수정된 Attachment 객체 또는 None (존재하지 않을 경우)
    """
    db_attachment = get_attachment(db, attachment_id)

    if not db_attachment:
        return None

    # description만 수정 가능
    if attachment_update.description is not None:
        db_attachment.description = attachment_update.description

    db.commit()
    db.refresh(db_attachment)
    return db_attachment


def delete_attachment(db: Session, attachment_id: int) -> bool:
    """
    첨부파일 삭제

    Args:
        db: 데이터베이스 세션
        attachment_id: 삭제할 첨부파일 ID

    Returns:
        삭제 성공 여부
    """
    db_attachment = get_attachment(db, attachment_id)

    if not db_attachment:
        return False

    db.delete(db_attachment)
    db.commit()
    return True


def get_all_attachments(
    db: Session, skip: int = 0, limit: int = 100
) -> List[Attachment]:
    """
    모든 첨부파일 목록 조회 (관리자 전용)

    Args:
        db: 데이터베이스 세션
        skip: 건너뛸 개수 (오프셋)
        limit: 조회할 최대 개수

    Returns:
        Attachment 객체 리스트
    """
    return (
        db.query(Attachment)
        .order_by(Attachment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_all_attachments(db: Session) -> int:
    """
    전체 첨부파일 개수 조회

    Args:
        db: 데이터베이스 세션

    Returns:
        첨부파일 개수
    """
    return db.query(Attachment).count()
