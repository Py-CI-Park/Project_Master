"""
Task Schemas

태스크 API 요청/응답 스키마
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class TaskBase(BaseModel):
    """태스크 기본 스키마"""

    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    duration_days: int = 1
    progress: float = 0.0
    status: str = "not_started"
    priority: str = "medium"
    assignee: Optional[str] = None
    is_milestone: bool = False
    color: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        """
        상태 값 검증

        허용되는 상태: not_started, in_progress, completed, blocked
        """
        allowed_statuses = ["not_started", "in_progress", "completed", "blocked"]
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}, got '{v}'")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        """
        우선순위 값 검증

        허용되는 우선순위: low, medium, high, critical
        """
        allowed_priorities = ["low", "medium", "high", "critical"]
        if v not in allowed_priorities:
            raise ValueError(f"priority must be one of {allowed_priorities}, got '{v}'")
        return v

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v: float) -> float:
        """
        진행률 검증

        진행률은 0.0 ~ 100.0 사이의 값이어야 함
        """
        if not 0.0 <= v <= 100.0:
            raise ValueError(f"progress must be between 0.0 and 100.0, got {v}")
        return v

    @field_validator("duration_days")
    @classmethod
    def validate_duration(cls, v: int) -> int:
        """소요 기간 검증 (최소 1일)"""
        if v < 1:
            raise ValueError(f"duration_days must be at least 1, got {v}")
        return v

    @field_validator("end_date")
    @classmethod
    def validate_dates(cls, v: datetime, info) -> datetime:
        """
        날짜 유효성 검증

        종료일은 시작일보다 늦어야 함
        """
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("end_date must be greater than or equal to start_date")
        return v


class TaskCreate(TaskBase):
    """태스크 생성 요청 스키마"""

    project_id: int


class TaskUpdate(BaseModel):
    """태스크 수정 요청 스키마"""

    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_days: Optional[int] = None
    progress: Optional[float] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    is_milestone: Optional[bool] = None
    color: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        """상태 값 검증"""
        if v is None:
            return v
        allowed_statuses = ["not_started", "in_progress", "completed", "blocked"]
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}, got '{v}'")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        """우선순위 값 검증"""
        if v is None:
            return v
        allowed_priorities = ["low", "medium", "high", "critical"]
        if v not in allowed_priorities:
            raise ValueError(f"priority must be one of {allowed_priorities}, got '{v}'")
        return v

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v: Optional[float]) -> Optional[float]:
        """진행률 검증"""
        if v is None:
            return v
        if not 0.0 <= v <= 100.0:
            raise ValueError(f"progress must be between 0.0 and 100.0, got {v}")
        return v

    @field_validator("duration_days")
    @classmethod
    def validate_duration(cls, v: Optional[int]) -> Optional[int]:
        """소요 기간 검증"""
        if v is None:
            return v
        if v < 1:
            raise ValueError(f"duration_days must be at least 1, got {v}")
        return v


class TaskResponse(TaskBase):
    """태스크 응답 스키마"""

    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
