from __future__ import annotations

"""
Enabler Impact Model

Enabler가 태스크에 미치는 영향 관계를 저장하는 모델
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class EnablerImpact(Base):
    """
    Enabler 영향 모델

    Key Enabler가 특정 태스크에 미치는 영향을 추적

    Attributes:
        id: 영향 ID (Primary Key)
        enabler_id: Enabler ID (Foreign Key)
        task_id: 태스크 ID (Foreign Key)
        impact_type: 영향 타입 (blocking, required, optional, helpful)
        impact_description: 영향 설명
        created_at: 생성일시

    Impact Types:
        - blocking: Enabler가 없으면 태스크 진행 불가
        - required: Enabler가 필수적이지만 일부 진행 가능
        - optional: Enabler가 있으면 도움이 되지만 필수는 아님
        - helpful: Enabler가 있으면 효율성 향상

    Relationships:
        enabler: 관련 Enabler
        task: 영향받는 태스크
    """

    __tablename__ = "enabler_impacts"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # 관계 필드
    enabler_id: Mapped[int] = mapped_column(
        ForeignKey("enablers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 영향 정보
    impact_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="required", index=True
    )
    # 영향 타입: blocking (차단), required (필수),
    #           optional (선택), helpful (도움됨)

    impact_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    # 관계 (Relationships)
    enabler: Mapped["Enabler"] = relationship("Enabler", back_populates="impacts")
    task: Mapped["Task"] = relationship("Task", back_populates="enabler_impacts")

    def __repr__(self) -> str:
        return (
            f"<EnablerImpact(id={self.id}, "
            f"enabler={self.enabler_id} -> task={self.task_id}, "
            f"type='{self.impact_type}')>"
        )
