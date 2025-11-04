"""
Project Schemas

프로젝트 API 요청/응답 스키마
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectBase(BaseModel):
    """프로젝트 기본 스키마"""

    name: str = Field(..., min_length=1, max_length=200, description="프로젝트 이름 (1-200자)")
    description: Optional[str] = Field(None, max_length=2000, description="프로젝트 설명 (최대 2000자)")
    start_date: datetime = Field(..., description="프로젝트 시작일")
    end_date: datetime = Field(..., description="프로젝트 종료일")
    status: str = Field(default="planning", description="프로젝트 상태")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        """
        상태 값 검증

        허용되는 상태: planning, in_progress, on_hold, completed, cancelled
        """
        allowed_statuses = ["planning", "in_progress", "on_hold", "completed", "cancelled"]
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}, got '{v}'")
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


class ProjectCreate(ProjectBase):
    """프로젝트 생성 요청 스키마"""

    pass


class ProjectUpdate(BaseModel):
    """프로젝트 수정 요청 스키마"""

    name: Optional[str] = Field(None, min_length=1, max_length=200, description="프로젝트 이름 (1-200자)")
    description: Optional[str] = Field(None, max_length=2000, description="프로젝트 설명 (최대 2000자)")
    start_date: Optional[datetime] = Field(None, description="프로젝트 시작일")
    end_date: Optional[datetime] = Field(None, description="프로젝트 종료일")
    status: Optional[str] = Field(None, description="프로젝트 상태")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        """상태 값 검증"""
        if v is None:
            return v
        allowed_statuses = ["planning", "in_progress", "on_hold", "completed", "cancelled"]
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}, got '{v}'")
        return v


class ProjectResponse(ProjectBase):
    """프로젝트 응답 스키마"""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
