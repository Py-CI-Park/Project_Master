"""
Enabler Schemas

Key Enabler API 요청/응답 스키마
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class EnablerBase(BaseModel):
    """Enabler 기본 스키마"""

    name: str
    description: Optional[str] = None
    type: str
    planned_delivery_date: datetime
    actual_delivery_date: Optional[datetime] = None
    status: str = "requested"
    criticality: str = "medium"
    responsible_person: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        """
        타입 값 검증

        허용되는 타입: document, equipment, approval, resource, license, training
        """
        allowed_types = [
            "document",
            "equipment",
            "approval",
            "resource",
            "license",
            "training",
        ]
        if v not in allowed_types:
            raise ValueError(f"type must be one of {allowed_types}, got '{v}'")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        """
        상태 값 검증

        허용되는 상태: requested, in_progress, delivered, delayed, cancelled
        """
        allowed_statuses = [
            "requested",
            "in_progress",
            "delivered",
            "delayed",
            "cancelled",
        ]
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}, got '{v}'")
        return v

    @field_validator("criticality")
    @classmethod
    def validate_criticality(cls, v: str) -> str:
        """
        중요도 값 검증

        허용되는 중요도: low, medium, high, critical
        """
        allowed_criticalities = ["low", "medium", "high", "critical"]
        if v not in allowed_criticalities:
            raise ValueError(f"criticality must be one of {allowed_criticalities}, got '{v}'")
        return v


class EnablerCreate(EnablerBase):
    """Enabler 생성 요청 스키마"""

    project_id: int


class EnablerUpdate(BaseModel):
    """Enabler 수정 요청 스키마"""

    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    planned_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    status: Optional[str] = None
    criticality: Optional[str] = None
    responsible_person: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        """타입 값 검증"""
        if v is None:
            return v
        allowed_types = [
            "document",
            "equipment",
            "approval",
            "resource",
            "license",
            "training",
        ]
        if v not in allowed_types:
            raise ValueError(f"type must be one of {allowed_types}, got '{v}'")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        """상태 값 검증"""
        if v is None:
            return v
        allowed_statuses = [
            "requested",
            "in_progress",
            "delivered",
            "delayed",
            "cancelled",
        ]
        if v not in allowed_statuses:
            raise ValueError(f"status must be one of {allowed_statuses}, got '{v}'")
        return v

    @field_validator("criticality")
    @classmethod
    def validate_criticality(cls, v: Optional[str]) -> Optional[str]:
        """중요도 값 검증"""
        if v is None:
            return v
        allowed_criticalities = ["low", "medium", "high", "critical"]
        if v not in allowed_criticalities:
            raise ValueError(f"criticality must be one of {allowed_criticalities}, got '{v}'")
        return v


class EnablerResponse(EnablerBase):
    """Enabler 응답 스키마"""

    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
