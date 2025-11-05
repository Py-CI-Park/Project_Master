from __future__ import annotations

"""
Notification Model

사용자 알림을 저장하는 모델
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Notification(Base):
    """
    알림 모델

    Attributes:
        id: 알림 ID (Primary Key)
        user_id: 수신자 사용자 ID (Foreign Key)
        type: 알림 타입 (task_created, task_updated, task_deleted, dependency_created, etc.)
        title: 알림 제목
        message: 알림 메시지
        is_read: 읽음 여부
        related_entity_type: 관련 엔티티 타입 (task, project, dependency, attachment, etc.)
        related_entity_id: 관련 엔티티 ID
        project_id: 관련 프로젝트 ID (Optional Foreign Key)
        created_at: 생성 일시
        read_at: 읽은 일시 (읽은 경우)

    Relationships:
        user: 알림을 받을 사용자
        project: 관련 프로젝트 (Optional)
    """

    __tablename__ = "notifications"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 알림 정보
    type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    # 알림 타입: task_created, task_updated, task_deleted, task_assigned,
    # dependency_created, dependency_deleted, attachment_uploaded,
    # attachment_deleted, project_updated, user_joined, user_left, etc.

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    # 읽음 상태
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

    # 관련 엔티티 정보
    related_entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # 엔티티 타입: task, project, dependency, attachment, etc.

    related_entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True
    )

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, index=True
    )
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # 관계 (Relationships)
    user: Mapped["User"] = relationship("User", back_populates="notifications")
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="notifications")

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.type}', is_read={self.is_read})>"
