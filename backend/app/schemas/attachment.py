"""
Attachment 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AttachmentBase(BaseModel):
    """Attachment 기본 스키마"""
    entity_type: str = Field(..., max_length=50, description="연결된 엔티티 타입 (project, task, enabler 등)")
    entity_id: int = Field(..., description="연결된 엔티티 ID")
    description: Optional[str] = Field(None, description="파일 설명")


class AttachmentCreate(AttachmentBase):
    """
    Attachment 생성 스키마

    Notes:
        - 실제 파일 업로드는 /upload 엔드포인트에서 처리
        - 이 스키마는 메타데이터 생성 시 사용
    """
    filename: str = Field(..., max_length=255, description="원본 파일명")
    stored_filename: str = Field(..., max_length=255, description="저장된 파일명 (UUID)")
    file_path: str = Field(..., max_length=500, description="저장 경로")
    file_size: int = Field(..., description="파일 크기 (bytes)")
    content_type: str = Field(..., max_length=100, description="MIME 타입")
    uploaded_by: int = Field(..., description="업로드한 사용자 ID")


class AttachmentUpdate(BaseModel):
    """Attachment 수정 스키마 (description만 수정 가능)"""
    description: Optional[str] = Field(None, description="파일 설명")


class AttachmentInDB(AttachmentBase):
    """
    데이터베이스에 저장된 Attachment 스키마
    (내부 사용 전용)
    """
    id: int
    filename: str
    stored_filename: str
    file_path: str
    file_size: int
    content_type: str
    uploaded_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class AttachmentPublic(AttachmentBase):
    """
    공개 Attachment 스키마
    (API 응답용)
    """
    id: int
    filename: str
    file_size: int
    content_type: str
    uploaded_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

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


class AttachmentListItem(BaseModel):
    """
    Attachment 목록 아이템 스키마
    (목록 조회 시 사용, 간략한 정보만 포함)
    """
    id: int
    filename: str
    file_size: int
    content_type: str
    entity_type: str
    entity_id: int
    uploaded_by: Optional[int]
    created_at: datetime
    description: Optional[str]

    class Config:
        from_attributes = True


class AttachmentListResponse(BaseModel):
    """Attachment 목록 응답 스키마"""
    attachments: list[AttachmentListItem]
    total: int = Field(..., description="전체 첨부파일 개수")


class AttachmentUploadRequest(BaseModel):
    """
    파일 업로드 요청 스키마
    (멀티파트 폼 데이터와 함께 사용)
    """
    entity_type: str = Field(..., max_length=50, description="연결된 엔티티 타입")
    entity_id: int = Field(..., description="연결된 엔티티 ID")
    description: Optional[str] = Field(None, description="파일 설명")


class AttachmentUploadResponse(BaseModel):
    """파일 업로드 응답 스키마"""
    attachment: AttachmentPublic
    message: str = Field(default="파일이 성공적으로 업로드되었습니다.")
