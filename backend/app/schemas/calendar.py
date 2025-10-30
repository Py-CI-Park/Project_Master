"""
Calendar Event Schemas

캘린더 이벤트 API 요청/응답 스키마
"""

from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class CalendarEventBase(BaseModel):
    """캘린더 이벤트 기본 스키마"""

    event_type: str
    title: str
    description: Optional[str] = None
    event_date: datetime
    all_day: bool = True
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    color: Optional[str] = None

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        """
        이벤트 타입 검증

        허용되는 타입:
        - milestone: 마일스톤
        - task_start: 태스크 시작
        - task_end: 태스크 종료
        - enabler_delivery: Enabler 전달
        - meeting: 미팅
        - review: 리뷰
        """
        allowed_types = [
            "milestone",
            "task_start",
            "task_end",
            "enabler_delivery",
            "meeting",
            "review",
        ]
        if v not in allowed_types:
            raise ValueError(f"event_type must be one of {allowed_types}, got '{v}'")
        return v

    @field_validator("end_time")
    @classmethod
    def validate_times(cls, v: Optional[time], info) -> Optional[time]:
        """
        시간 유효성 검증

        종료 시간은 시작 시간보다 늦어야 함
        종일 이벤트가 아닌 경우 시작/종료 시간 필수
        """
        # 종일 이벤트가 아닌 경우
        if "all_day" in info.data and not info.data["all_day"]:
            # 시작 시간이 없으면 오류
            if "start_time" not in info.data or info.data["start_time"] is None:
                raise ValueError("start_time is required when all_day is False")
            # 종료 시간이 없으면 오류
            if v is None:
                raise ValueError("end_time is required when all_day is False")
            # 종료 시간이 시작 시간보다 빠르면 오류
            if v <= info.data["start_time"]:
                raise ValueError("end_time must be greater than start_time")

        return v


class CalendarEventCreate(CalendarEventBase):
    """캘린더 이벤트 생성 요청 스키마"""

    project_id: int
    task_id: Optional[int] = None
    enabler_id: Optional[int] = None


class CalendarEventUpdate(BaseModel):
    """캘린더 이벤트 수정 요청 스키마"""

    event_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    all_day: Optional[bool] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    color: Optional[str] = None
    task_id: Optional[int] = None
    enabler_id: Optional[int] = None

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: Optional[str]) -> Optional[str]:
        """이벤트 타입 검증"""
        if v is None:
            return v
        allowed_types = [
            "milestone",
            "task_start",
            "task_end",
            "enabler_delivery",
            "meeting",
            "review",
        ]
        if v not in allowed_types:
            raise ValueError(f"event_type must be one of {allowed_types}, got '{v}'")
        return v


class CalendarEventResponse(CalendarEventBase):
    """캘린더 이벤트 응답 스키마"""

    id: int
    project_id: int
    task_id: Optional[int] = None
    enabler_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
