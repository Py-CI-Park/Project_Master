"""
Role 및 UserRole 모델
v2.0에서 추가된 역할 기반 접근 제어 (RBAC)를 위한 모델
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):
    """
    역할 모델 (RBAC)

    Attributes:
        id: 역할 고유 ID
        name: 역할 이름 (예: Admin, Project Manager, Team Member, Viewer)
        description: 역할 설명
        permissions: 권한 목록 (JSON 형태)
        created_at: 생성 일시

    Permissions 구조 예시:
    {
        "project:create": true,
        "project:read": true,
        "project:update": true,
        "project:delete": true,
        "task:create": true,
        "task:read": true,
        "task:update": true,
        "task:delete": true,
        "user:read": true,
        "user:manage": false
    }
    """
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user_roles = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"

    def has_permission(self, permission: str) -> bool:
        """특정 권한을 가지고 있는지 확인"""
        return self.permissions.get(permission, False) is True


class UserRole(Base):
    """
    사용자-역할 연결 테이블

    Attributes:
        user_id: 사용자 ID
        role_id: 역할 ID
        project_id: 프로젝트 ID (NULL이면 전역 역할)
        assigned_at: 역할 부여 일시

    Notes:
        - project_id가 NULL이면 전역 역할 (모든 프로젝트에 적용)
        - project_id가 지정되면 해당 프로젝트에만 적용되는 역할
    """
    __tablename__ = "user_roles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="user_roles")
    role = relationship("Role", back_populates="user_roles")
    project = relationship("Project", backref="user_roles")

    def __repr__(self):
        project_str = f", project_id={self.project_id}" if self.project_id else " (global)"
        return f"<UserRole(user_id={self.user_id}, role_id={self.role_id}{project_str})>"
