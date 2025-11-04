"""
인증 관련 Pydantic 스키마
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """회원가입 요청 스키마"""
    username: str = Field(..., min_length=3, max_length=50, description="사용자명 (로그인 ID)")
    email: EmailStr = Field(..., description="이메일 주소")
    password: str = Field(..., min_length=8, max_length=100, description="비밀번호 (최소 8자)")
    full_name: Optional[str] = Field(None, max_length=100, description="전체 이름")


class UserLogin(BaseModel):
    """로그인 요청 스키마"""
    username: str = Field(..., description="사용자명")
    password: str = Field(..., description="비밀번호")


class Token(BaseModel):
    """토큰 응답 스키마"""
    access_token: str = Field(..., description="액세스 토큰")
    token_type: str = Field(default="bearer", description="토큰 타입")
    refresh_token: str = Field(..., description="리프레시 토큰")


class TokenData(BaseModel):
    """토큰 페이로드 데이터"""
    username: Optional[str] = Field(None, description="사용자명")


class RefreshTokenRequest(BaseModel):
    """토큰 갱신 요청 스키마"""
    refresh_token: str = Field(..., description="리프레시 토큰")
