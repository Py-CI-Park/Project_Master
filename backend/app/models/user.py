"""
User 모델
v2.0에서 추가된 사용자 인증 및 관리를 위한 모델
"""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """
    사용자 모델

    Attributes:
        id: 사용자 고유 ID
        username: 사용자명 (로그인 ID, 고유값)
        email: 이메일 주소 (고유값)
        hashed_password: 해시된 비밀번호
        full_name: 전체 이름
        is_active: 활성 상태 (비활성화된 사용자는 로그인 불가)
        is_superuser: 슈퍼유저 여부 (관리자 권한)
        created_at: 생성 일시
        updated_at: 수정 일시
        last_login: 마지막 로그인 일시
        avatar_url: 프로필 이미지 URL (선택)

    Relationships:
        notifications: 사용자가 받은 알림 목록
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)
    avatar_url = Column(String(255), nullable=True)

    # Relationships
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
