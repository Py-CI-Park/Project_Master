"""
User 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """User 기본 스키마"""
    username: str = Field(..., min_length=3, max_length=50, description="사용자명")
    email: EmailStr = Field(..., description="이메일 주소")
    full_name: Optional[str] = Field(None, max_length=100, description="전체 이름")


class UserCreate(UserBase):
    """User 생성 스키마"""
    password: str = Field(..., min_length=8, max_length=100, description="비밀번호")


class UserUpdate(BaseModel):
    """User 수정 스키마 (모든 필드 선택적)"""
    email: Optional[EmailStr] = Field(None, description="이메일 주소")
    full_name: Optional[str] = Field(None, max_length=100, description="전체 이름")
    password: Optional[str] = Field(None, min_length=8, max_length=100, description="비밀번호")
    is_active: Optional[bool] = Field(None, description="활성 상태")
    avatar_url: Optional[str] = Field(None, max_length=255, description="프로필 이미지 URL")


class UserInDB(UserBase):
    """
    데이터베이스에 저장된 User 스키마
    (비밀번호 해시 포함 - 내부 사용 전용)
    """
    id: int
    hashed_password: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


class UserPublic(UserBase):
    """
    공개 User 스키마
    (비밀번호 제외 - API 응답용)
    """
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


class UserMe(UserPublic):
    """
    내 정보 조회 스키마
    (현재 로그인한 사용자의 정보)
    """
    pass
