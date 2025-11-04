"""
Attachment 모델
v2.0에서 추가된 파일 첨부 기능을 위한 모델
"""
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, BigInteger
from sqlalchemy.orm import relationship
from app.database import Base


class Attachment(Base):
    """
    첨부파일 모델

    Attributes:
        id: 첨부파일 고유 ID
        filename: 원본 파일명
        stored_filename: 저장된 파일명 (UUID 기반)
        file_path: 저장된 파일의 상대 경로
        file_size: 파일 크기 (bytes)
        content_type: MIME 타입 (예: image/png, application/pdf)
        entity_type: 연결된 엔티티 타입 (project, task, enabler 등)
        entity_id: 연결된 엔티티 ID
        uploaded_by: 업로드한 사용자 ID
        created_at: 업로드 일시
        description: 파일 설명 (선택)

    Notes:
        - entity_type과 entity_id를 조합하여 특정 엔티티에 첨부
        - 실제 파일은 서버의 파일 시스템에 저장
        - 파일명은 UUID로 변환하여 저장 (보안 및 중복 방지)
    """
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)  # 원본 파일명
    stored_filename = Column(String(255), unique=True, nullable=False)  # 저장된 파일명 (UUID)
    file_path = Column(String(500), nullable=False)  # 저장 경로
    file_size = Column(BigInteger, nullable=False)  # 파일 크기 (bytes)
    content_type = Column(String(100), nullable=False)  # MIME 타입
    entity_type = Column(String(50), nullable=False, index=True)  # project, task, enabler 등
    entity_id = Column(Integer, nullable=False, index=True)  # 엔티티 ID
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    description = Column(Text, nullable=True)  # 파일 설명

    # Relationships
    uploader = relationship("User", backref="attachments")

    def __repr__(self):
        return f"<Attachment(id={self.id}, filename='{self.filename}', entity_type='{self.entity_type}', entity_id={self.entity_id})>"

    @property
    def file_size_mb(self) -> float:
        """파일 크기를 MB 단위로 반환"""
        return round(self.file_size / (1024 * 1024), 2)

    @property
    def file_extension(self) -> str:
        """파일 확장자를 반환"""
        if '.' in self.filename:
            return self.filename.rsplit('.', 1)[1].lower()
        return ''
