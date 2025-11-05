"""
Notification 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    """Notification 기본 스키마"""
    type: str = Field(..., max_length=100, description="알림 타입")
    title: str = Field(..., max_length=200, description="알림 제목")
    message: str = Field(..., description="알림 메시지")
    related_entity_type: Optional[str] = Field(None, max_length=50, description="관련 엔티티 타입")
    related_entity_id: Optional[int] = Field(None, description="관련 엔티티 ID")
    project_id: Optional[int] = Field(None, description="프로젝트 ID")


class NotificationCreate(NotificationBase):
    """Notification 생성 스키마"""
    user_id: int = Field(..., description="수신자 사용자 ID")


class NotificationUpdate(BaseModel):
    """Notification 수정 스키마 (읽음 처리용)"""
    is_read: bool = Field(..., description="읽음 여부")


class NotificationPublic(NotificationBase):
    """
    공개 Notification 스키마
    (API 응답용)
    """
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class NotificationList(BaseModel):
    """알림 목록 응답 스키마"""
    notifications: list[NotificationPublic]
    total: int
    unread_count: int

    class Config:
        from_attributes = True
