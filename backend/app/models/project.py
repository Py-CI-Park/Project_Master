from __future__ import annotations

"""
Project Model

프로젝트 정보를 저장하는 모델
"""

from datetime import datetime
from typing import List

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Project(Base):
    """
    프로젝트 모델

    Attributes:
        id: 프로젝트 ID (Primary Key)
        name: 프로젝트 이름
        description: 프로젝트 설명
        start_date: 시작일
        end_date: 종료일
        status: 상태 (planning, in_progress, on_hold, completed, cancelled)
        created_at: 생성일시
        updated_at: 수정일시

    Relationships:
        tasks: 프로젝트에 속한 태스크 목록
        enablers: 프로젝트에 속한 Key Enabler 목록
        calendar_events: 프로젝트에 속한 캘린더 이벤트 목록
    """

    __tablename__ = "projects"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 일정 정보
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # 상태 정보
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="planning", index=True)
    # 상태 종류: planning, in_progress, on_hold, completed, cancelled

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # 관계 (Relationships)
    tasks: Mapped[List["Task"]] = relationship(
        "Task", back_populates="project", cascade="all, delete-orphan"
    )
    enablers: Mapped[List["Enabler"]] = relationship(
        "Enabler", back_populates="project", cascade="all, delete-orphan"
    )
    calendar_events: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="project", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name='{self.name}', status='{self.status}')>"
