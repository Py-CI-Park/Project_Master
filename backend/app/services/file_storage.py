"""
파일 저장소 서비스
v2.0에서 추가된 파일 업로드/다운로드/관리 기능
"""
import os
import uuid
import shutil
import mimetypes
from pathlib import Path
from typing import BinaryIO, Tuple, Optional
from fastapi import UploadFile, HTTPException


# 설정
UPLOAD_DIR = "./data/uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    # 문서
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md',
    # 이미지
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp',
    # 압축 파일
    'zip', 'rar', '7z', 'tar', 'gz',
    # 기타
    'json', 'xml', 'yaml', 'yml',
}

# MIME 타입별 카테고리
MIME_TYPE_CATEGORIES = {
    'image': ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/bmp'],
    'document': [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'text/markdown',
    ],
    'archive': [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
    ],
}


class FileStorageService:
    """
    파일 저장소 서비스

    파일 업로드, 다운로드, 삭제 및 검증 기능을 제공합니다.
    """

    def __init__(self, upload_dir: str = UPLOAD_DIR):
        """
        파일 저장소 서비스 초기화

        Args:
            upload_dir: 업로드 디렉토리 경로
        """
        self.upload_dir = Path(upload_dir)
        self._ensure_upload_dir()

    def _ensure_upload_dir(self):
        """업로드 디렉토리가 존재하는지 확인하고 없으면 생성"""
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def generate_safe_filename(self, original_filename: str) -> Tuple[str, str]:
        """
        안전한 고유 파일명 생성

        Args:
            original_filename: 원본 파일명

        Returns:
            Tuple[저장될 파일명, 파일 확장자]
        """
        # 파일 확장자 추출
        ext = ''
        if '.' in original_filename:
            ext = original_filename.rsplit('.', 1)[1].lower()

        # UUID 기반 고유 파일명 생성
        unique_filename = f"{uuid.uuid4()}.{ext}" if ext else str(uuid.uuid4())

        return unique_filename, ext

    def validate_file_extension(self, filename: str) -> bool:
        """
        파일 확장자 검증

        Args:
            filename: 파일명

        Returns:
            허용된 확장자인 경우 True, 아니면 False
        """
        if '.' not in filename:
            return False

        ext = filename.rsplit('.', 1)[1].lower()
        return ext in ALLOWED_EXTENSIONS

    def validate_file_size(self, file_size: int, max_size: int = MAX_FILE_SIZE) -> bool:
        """
        파일 크기 검증

        Args:
            file_size: 파일 크기 (bytes)
            max_size: 최대 허용 크기 (bytes)

        Returns:
            허용된 크기인 경우 True, 아니면 False
        """
        return file_size <= max_size

    def get_content_type(self, filename: str) -> str:
        """
        파일의 MIME 타입 추출

        Args:
            filename: 파일명

        Returns:
            MIME 타입 (예: image/png, application/pdf)
        """
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or 'application/octet-stream'

    def get_file_category(self, content_type: str) -> str:
        """
        MIME 타입으로부터 파일 카테고리 추출

        Args:
            content_type: MIME 타입

        Returns:
            파일 카테고리 (image, document, archive, other)
        """
        for category, mime_types in MIME_TYPE_CATEGORIES.items():
            if content_type in mime_types:
                return category
        return 'other'

    async def save_file(
        self,
        file: UploadFile,
        original_filename: Optional[str] = None
    ) -> Tuple[str, str, int, str]:
        """
        파일 저장

        Args:
            file: FastAPI UploadFile 객체
            original_filename: 원본 파일명 (지정하지 않으면 file.filename 사용)

        Returns:
            Tuple[저장된 파일명, 파일 경로, 파일 크기, content_type]

        Raises:
            HTTPException: 파일 검증 실패 또는 저장 실패 시
        """
        filename = original_filename or file.filename

        # 파일명 검증
        if not filename:
            raise HTTPException(status_code=400, detail="파일명이 없습니다.")

        # 확장자 검증
        if not self.validate_file_extension(filename):
            raise HTTPException(
                status_code=400,
                detail=f"허용되지 않은 파일 형식입니다. 허용된 형식: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        # 파일 읽기 및 크기 확인
        file_content = await file.read()
        file_size = len(file_content)

        # 크기 검증
        if not self.validate_file_size(file_size):
            max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기가 너무 큽니다. 최대 허용 크기: {max_size_mb}MB"
            )

        # 안전한 파일명 생성
        stored_filename, _ = self.generate_safe_filename(filename)
        file_path = self.upload_dir / stored_filename

        try:
            # 파일 저장
            with open(file_path, 'wb') as f:
                f.write(file_content)

            # Content-Type 추출
            content_type = self.get_content_type(filename)

            # 상대 경로 반환
            relative_path = str(file_path.relative_to(Path('.')))

            return stored_filename, relative_path, file_size, content_type

        except Exception as e:
            # 저장 실패 시 파일 삭제
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"파일 저장 중 오류가 발생했습니다: {str(e)}"
            )

    def get_file_path(self, stored_filename: str) -> Path:
        """
        저장된 파일의 전체 경로 반환

        Args:
            stored_filename: 저장된 파일명

        Returns:
            파일의 전체 경로

        Raises:
            HTTPException: 파일이 존재하지 않는 경우
        """
        file_path = self.upload_dir / stored_filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

        if not file_path.is_file():
            raise HTTPException(status_code=400, detail="유효한 파일이 아닙니다.")

        return file_path

    def delete_file(self, stored_filename: str) -> bool:
        """
        파일 삭제

        Args:
            stored_filename: 저장된 파일명

        Returns:
            삭제 성공 여부

        Raises:
            HTTPException: 파일 삭제 실패 시
        """
        try:
            file_path = self.upload_dir / stored_filename

            if file_path.exists():
                file_path.unlink()
                return True
            else:
                # 파일이 이미 없으면 True 반환 (idempotent)
                return True

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"파일 삭제 중 오류가 발생했습니다: {str(e)}"
            )

    def file_exists(self, stored_filename: str) -> bool:
        """
        파일 존재 여부 확인

        Args:
            stored_filename: 저장된 파일명

        Returns:
            파일 존재 여부
        """
        file_path = self.upload_dir / stored_filename
        return file_path.exists() and file_path.is_file()


# 전역 서비스 인스턴스
file_storage = FileStorageService()
