from __future__ import annotations

"""
Enabler Model

Key Enabler (핵심 지원 요소) 정보를 저장하는 모델
"""

from datetime import datetime
from typing import List

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Enabler(Base):
    """
    Key Enabler 모델

    프로젝트 수행에 필요한 핵심 자원/문서/장비/승인 등을 관리

    Attributes:
        id: Enabler ID (Primary Key)
        project_id: 소속 프로젝트 ID (Foreign Key)
        name: Enabler 이름
        description: 상세 설명
        type: 종류 (document, equipment, approval, resource, license, training)
        planned_delivery_date: 계획된 전달일
        actual_delivery_date: 실제 전달일
        status: 상태 (requested, in_progress, delivered, delayed, cancelled)
        criticality: 중요도 (low, medium, high, critical)
        responsible_person: 책임자
        notes: 비고
        created_at: 생성일시
        updated_at: 수정일시

    Relationships:
        project: 소속 프로젝트
        impacts: 영향받는 태스크들
        calendar_events: 관련 캘린더 이벤트들
    """

    __tablename__ = "enablers"

    # 기본 필드
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 종류
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # 종류: document (문서), equipment (장비), approval (승인),
    #       resource (자원), license (라이선스), training (교육)

    # 일정 정보
    planned_delivery_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    actual_delivery_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # 상태 정보
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="requested", index=True)
    # 상태 종류: requested (요청됨), in_progress (진행 중),
    #           delivered (전달됨), delayed (지연), cancelled (취소됨)

    criticality: Mapped[str] = mapped_column(
        String(50), nullable=False, default="medium", index=True
    )
    # 중요도: low, medium, high, critical

    # 책임자 및 비고
    responsible_person: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 타임스탬프
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # 관계 (Relationships)
    project: Mapped["Project"] = relationship("Project", back_populates="enablers")

    # 영향 관계
    impacts: Mapped[List["EnablerImpact"]] = relationship(
        "EnablerImpact", back_populates="enabler", cascade="all, delete-orphan"
    )

    # 캘린더 이벤트
    calendar_events: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="enabler"
    )

    def __repr__(self) -> str:
        return f"<Enabler(id={self.id}, name='{self.name}', type='{self.type}', status='{self.status}')>"
