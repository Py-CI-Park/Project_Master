from __future__ import annotations

"""
Task Model

태스크 정보를 저장하는 모델
"""

from datetime import datetime
from typing import List

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Task(Base):
    """
    태스크 모델

    Attributes:
        id: 태스크 ID (Primary Key)
        project_id: 소속 프로젝트 ID (Foreign Key)
        name: 태스크 이름
        description: 태스크 설명
        start_date: 시작일
        end_date: 종료일
        duration_days: 소요 기간 (일)
        progress: 진행률 (0-100)
        status: 상태 (not_started, in_progress, completed, blocked)
        priority: 우선순위 (low, medium, high, critical)
        assignee: 담당자
        is_milestone: 마일스톤 여부
        color: 간트 차트 색상
        created_at: 생성일시
        updated_at: 수정일시

    Relationships:
        project: 소속 프로젝트
        predecessors: 선행 태스크들 (의존성)
        successors: 후속 태스크들 (의존성)
        enabler_impacts: 영향받는 Enabler들
        calendar_events: 관련 캘린더 이벤트들
    """

    __tablename__ = "tasks"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 일정 정보
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # 진행 상태
    progress: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    # 진행률: 0.0 ~ 100.0
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="not_started", index=True
    )
    # 상태 종류: not_started, in_progress, completed, blocked

    # 우선순위 및 담당자
    priority: Mapped[str] = mapped_column(String(50), nullable=False, default="medium", index=True)
    # 우선순위: low, medium, high, critical
    assignee: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # 마일스톤 및 시각화
    is_milestone: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # 색상 형식: HEX (#FF5733) 또는 색상 이름

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # 관계 (Relationships)
    project: Mapped["Project"] = relationship("Project", back_populates="tasks")

    # 의존성 관계 (self-referencing many-to-many)
    predecessors: Mapped[List["Dependency"]] = relationship(
        "Dependency",
        foreign_keys="Dependency.successor_task_id",
        back_populates="successor_task",
    )
    successors: Mapped[List["Dependency"]] = relationship(
        "Dependency",
        foreign_keys="Dependency.predecessor_task_id",
        back_populates="predecessor_task",
    )

    # Enabler 영향 관계
    enabler_impacts: Mapped[List["EnablerImpact"]] = relationship(
        "EnablerImpact", back_populates="task", cascade="all, delete-orphan"
    )

    # 캘린더 이벤트
    calendar_events: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="task"
    )

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, name='{self.name}', status='{self.status}', progress={self.progress}%)>"
