"""
Dependency Schemas

태스크 의존성 API 요청/응답 스키마
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class DependencyBase(BaseModel):
    """의존성 기본 스키마"""

    predecessor_task_id: int
    successor_task_id: int
    dependency_type: str = "FS"
    lag_days: int = 0

    @field_validator("dependency_type")
    @classmethod
    def validate_dependency_type(cls, v: str) -> str:
        """
        의존성 타입 검증

        허용되는 타입:
        - FS (Finish-Start): 선행 태스크 완료 후 후속 태스크 시작
        - SS (Start-Start): 선행 태스크 시작과 동시에 후속 태스크 시작
        - FF (Finish-Finish): 선행 태스크 완료와 동시에 후속 태스크 완료
        - SF (Start-Finish): 선행 태스크 시작 후 후속 태스크 완료
        """
        allowed_types = ["FS", "SS", "FF", "SF"]
        if v not in allowed_types:
            raise ValueError(f"dependency_type must be one of {allowed_types}, got '{v}'")
        return v

    @field_validator("successor_task_id")
    @classmethod
    def validate_different_tasks(cls, v: int, info) -> int:
        """
        순환 의존성 방지

        선행 태스크와 후속 태스크는 달라야 함
        """
        if "predecessor_task_id" in info.data and v == info.data["predecessor_task_id"]:
            raise ValueError("predecessor_task_id and successor_task_id must be different")
        return v


class DependencyCreate(DependencyBase):
    """의존성 생성 요청 스키마"""

    pass


class DependencyUpdate(BaseModel):
    """의존성 수정 요청 스키마"""

    dependency_type: Optional[str] = None
    lag_days: Optional[int] = None

    @field_validator("dependency_type")
    @classmethod
    def validate_dependency_type(cls, v: Optional[str]) -> Optional[str]:
        """의존성 타입 검증"""
        if v is None:
            return v
        allowed_types = ["FS", "SS", "FF", "SF"]
        if v not in allowed_types:
            raise ValueError(f"dependency_type must be one of {allowed_types}, got '{v}'")
        return v


class DependencyResponse(DependencyBase):
    """의존성 응답 스키마"""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
