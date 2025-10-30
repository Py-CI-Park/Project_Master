"""
Enabler Impact Schemas

Enabler 영향 관계 API 요청/응답 스키마
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class EnablerImpactBase(BaseModel):
    """Enabler 영향 기본 스키마"""

    enabler_id: int
    task_id: int
    impact_type: str = "required"
    impact_description: Optional[str] = None

    @field_validator("impact_type")
    @classmethod
    def validate_impact_type(cls, v: str) -> str:
        """
        영향 타입 검증

        허용되는 타입:
        - blocking: Enabler가 없으면 태스크 진행 불가 (차단)
        - required: Enabler가 필수적이지만 일부 진행 가능
        - optional: Enabler가 있으면 도움이 되지만 필수는 아님
        - helpful: Enabler가 있으면 효율성 향상
        """
        allowed_types = ["blocking", "required", "optional", "helpful"]
        if v not in allowed_types:
            raise ValueError(f"impact_type must be one of {allowed_types}, got '{v}'")
        return v


class EnablerImpactCreate(EnablerImpactBase):
    """Enabler 영향 생성 요청 스키마"""

    pass


class EnablerImpactUpdate(BaseModel):
    """Enabler 영향 수정 요청 스키마"""

    impact_type: Optional[str] = None
    impact_description: Optional[str] = None

    @field_validator("impact_type")
    @classmethod
    def validate_impact_type(cls, v: Optional[str]) -> Optional[str]:
        """영향 타입 검증"""
        if v is None:
            return v
        allowed_types = ["blocking", "required", "optional", "helpful"]
        if v not in allowed_types:
            raise ValueError(f"impact_type must be one of {allowed_types}, got '{v}'")
        return v


class EnablerImpactResponse(EnablerImpactBase):
    """Enabler 영향 응답 스키마"""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
