"""
Task Schemas

태스크 API 요청/응답 스키마
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskBase(BaseModel):
    """태스크 기본 스키마"""

    name: str = Field(..., min_length=1, max_length=200, description="태스크 이름 (1-200자)")
    description: Optional[str] = Field(None, max_length=2000, description="태스크 설명 (최대 2000자)")
    start_date: datetime = Field(..., description="태스크 시작일")
    end_date: datetime = Field(..., description="태스크 종료일")
    duration_days: int = Field(default=1, ge=1, le=3650, description="소요 기간 (1-3650일)")
    progress: float = Field(default=0.0, ge=0.0, le=100.0, description="진행률 (0.0-100.0%)")
    status: str = Field(default="not_started", description="태스크 상태")
    priority: str = Field(default="medium", description="우선순위")
    assignee: Optional[str] = Field(None, max_length=100, description="담당자 (최대 100자)")
    is_milestone: bool = Field(default=False, description="마일스톤 여부")
    color: Optional[str] = Field(None, max_length=20, pattern=r"^#[0-9A-Fa-f]{6}$", description="색상 (HEX 형식: #RRGGBB)")

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

    name: Optional[str] = Field(None, min_length=1, max_length=200, description="태스크 이름 (1-200자)")
    description: Optional[str] = Field(None, max_length=2000, description="태스크 설명 (최대 2000자)")
    start_date: Optional[datetime] = Field(None, description="태스크 시작일")
    end_date: Optional[datetime] = Field(None, description="태스크 종료일")
    duration_days: Optional[int] = Field(None, ge=1, le=3650, description="소요 기간 (1-3650일)")
    progress: Optional[float] = Field(None, ge=0.0, le=100.0, description="진행률 (0.0-100.0%)")
    status: Optional[str] = Field(None, description="태스크 상태")
    priority: Optional[str] = Field(None, description="우선순위")
    assignee: Optional[str] = Field(None, max_length=100, description="담당자 (최대 100자)")
    is_milestone: Optional[bool] = Field(None, description="마일스톤 여부")
    color: Optional[str] = Field(None, max_length=20, pattern=r"^#[0-9A-Fa-f]{6}$", description="색상 (HEX 형식: #RRGGBB)")

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



class TaskResponse(TaskBase):
    """태스크 응답 스키마"""

    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
