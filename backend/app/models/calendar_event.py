from __future__ import annotations

"""
Calendar Event Model

캘린더 이벤트 정보를 저장하는 모델
"""

from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CalendarEvent(Base):
    """
    캘린더 이벤트 모델

    프로젝트, 태스크, Enabler와 관련된 일정을 통합 관리

    Attributes:
        id: 이벤트 ID (Primary Key)
        project_id: 소속 프로젝트 ID (Foreign Key)
        task_id: 관련 태스크 ID (Foreign Key, Optional)
        enabler_id: 관련 Enabler ID (Foreign Key, Optional)
        event_type: 이벤트 타입 (milestone, task_start, task_end, enabler_delivery, meeting, review)
        title: 이벤트 제목
        description: 이벤트 설명
        event_date: 이벤트 날짜
        all_day: 종일 이벤트 여부
        start_time: 시작 시간 (all_day=False일 경우)
        end_time: 종료 시간 (all_day=False일 경우)
        color: 캘린더 색상
        created_at: 생성일시

    Event Types:
        - milestone: 마일스톤
        - task_start: 태스크 시작일
        - task_end: 태스크 종료일
        - enabler_delivery: Enabler 전달일
        - meeting: 회의
        - review: 리뷰/검토

    Relationships:
        project: 소속 프로젝트
        task: 관련 태스크 (optional)
        enabler: 관련 Enabler (optional)
    """

    __tablename__ = "calendar_events"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # 프로젝트 관계 (필수)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # 태스크/Enabler 관계 (선택)
    task_id: Mapped[int | None] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True, index=True
    )
    enabler_id: Mapped[int | None] = mapped_column(
        ForeignKey("enablers.id", ondelete="CASCADE"), nullable=True, index=True
    )

    # 이벤트 정보
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # 이벤트 타입: milestone, task_start, task_end, enabler_delivery, meeting, review

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 일정 정보
    event_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    all_day: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # 시간 정보 (all_day=False일 경우)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    # 시각화
    color: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # 색상 형식: HEX (#FF5733) 또는 색상 이름

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    # 관계 (Relationships)
    project: Mapped["Project"] = relationship("Project", back_populates="calendar_events")
    task: Mapped["Task | None"] = relationship("Task", back_populates="calendar_events")
    enabler: Mapped["Enabler | None"] = relationship("Enabler", back_populates="calendar_events")

    def __repr__(self) -> str:
        return (
            f"<CalendarEvent(id={self.id}, title='{self.title}', "
            f"type='{self.event_type}', date={self.event_date.strftime('%Y-%m-%d')})>"
        )
