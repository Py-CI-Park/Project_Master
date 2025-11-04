from __future__ import annotations

"""
Dependency Model

태스크 간 의존성 관계를 저장하는 모델
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Dependency(Base):
    """
    태스크 의존성 모델

    태스크 간의 의존성 관계 및 타입을 정의

    Attributes:
        id: 의존성 ID (Primary Key)
        predecessor_task_id: 선행 태스크 ID (Foreign Key)
        successor_task_id: 후속 태스크 ID (Foreign Key)
        dependency_type: 의존성 타입 (FS, SS, FF, SF)
        lag_days: 지연 기간 (일) - 양수는 지연, 음수는 선행
        created_at: 생성일시

    Dependency Types:
        - FS (Finish-Start): 선행 태스크가 끝나야 후속 태스크 시작
        - SS (Start-Start): 선행 태스크가 시작하면 후속 태스크도 시작
        - FF (Finish-Finish): 선행 태스크가 끝나면 후속 태스크도 끝남
        - SF (Start-Finish): 선행 태스크가 시작하면 후속 태스크가 끝남

    Relationships:
        predecessor_task: 선행 태스크
        successor_task: 후속 태스크
    """

    __tablename__ = "dependencies"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # 태스크 관계
    predecessor_task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    successor_task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 의존성 타입
    dependency_type: Mapped[str] = mapped_column(
        String(10), nullable=False, default="FS", index=True
    )
    # 의존성 타입: FS (Finish-Start), SS (Start-Start),
    #             FF (Finish-Finish), SF (Start-Finish)

    # 지연 기간
    lag_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # lag_days > 0: 지연 (선행 완료 후 N일 대기)
    # lag_days < 0: 선행 (선행 완료 N일 전에 시작 가능)
    # lag_days = 0: 즉시 시작

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    # 관계 (Relationships)
    predecessor_task: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[predecessor_task_id],
        back_populates="successors",
    )
    successor_task: Mapped["Task"] = relationship(
        "Task",
        foreign_keys=[successor_task_id],
        back_populates="predecessors",
    )

    def __repr__(self) -> str:
        return (
            f"<Dependency(id={self.id}, "
            f"predecessor={self.predecessor_task_id} -> "
            f"successor={self.successor_task_id}, "
            f"type='{self.dependency_type}', lag={self.lag_days})>"
        )
