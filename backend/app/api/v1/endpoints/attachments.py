"""
Attachment API Endpoints

파일 첨부 관련 API 엔드포인트를 제공합니다.
- 파일 업로드 (POST /api/v1/attachments/upload)
- 파일 다운로드 (GET /api/v1/attachments/{id}/download)
- 파일 메타데이터 조회 (GET /api/v1/attachments/{id})
- 파일 삭제 (DELETE /api/v1/attachments/{id})
- 엔티티별 파일 목록 조회 (GET /api/v1/attachments)
- 파일 설명 수정 (PATCH /api/v1/attachments/{id})
"""

from typing import Any, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import attachment as attachment_crud
from app.schemas.attachment import (
    AttachmentCreate,
    AttachmentPublic,
    AttachmentListResponse,
    AttachmentUploadResponse,
    AttachmentUpdate,
)
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.file_storage import file_storage


router = APIRouter()


@router.post("/upload", response_model=AttachmentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    entity_type: str = Form(..., max_length=50, description="연결된 엔티티 타입 (project, task, enabler 등)"),
    entity_id: int = Form(..., description="연결된 엔티티 ID"),
    description: Optional[str] = Form(None, description="파일 설명"),
    file: UploadFile = File(..., description="업로드할 파일"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    파일 업로드

    파일을 업로드하고 지정된 엔티티에 첨부합니다.

    **요청 (Multipart Form):**
    - entity_type: 엔티티 타입 (project, task, enabler 등)
    - entity_id: 엔티티 ID
    - description: 파일 설명 (선택)
    - file: 업로드할 파일

    **응답 예시:**
    ```json
    {
        "attachment": {
            "id": 1,
            "filename": "document.pdf",
            "file_size": 1024000,
            "content_type": "application/pdf",
            "entity_type": "task",
            "entity_id": 123,
            "uploaded_by": 1,
            "created_at": "2025-11-04T12:00:00",
            "description": "프로젝트 계획서"
        },
        "message": "파일이 성공적으로 업로드되었습니다."
    }
    ```

    **제한사항:**
    - 최대 파일 크기: 10MB
    - 허용된 파일 형식: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, md, png, jpg, jpeg, gif, svg, zip 등

    **에러:**
    - 400: 파일 형식이 허용되지 않거나 크기가 초과됨
    - 401: 인증되지 않음
    - 500: 파일 저장 실패
    """
    # 파일 저장
    stored_filename, file_path, file_size, content_type = await file_storage.save_file(
        file=file,
        original_filename=file.filename
    )

    # 메타데이터 생성
    attachment_create = AttachmentCreate(
        filename=file.filename or "unknown",
        stored_filename=stored_filename,
        file_path=file_path,
        file_size=file_size,
        content_type=content_type,
        entity_type=entity_type,
        entity_id=entity_id,
        uploaded_by=current_user.id,
        description=description,
    )

    db_attachment = attachment_crud.create_attachment(db, attachment_create)

    return {
        "attachment": db_attachment,
        "message": "파일이 성공적으로 업로드되었습니다."
    }


@router.get("/{attachment_id}", response_model=AttachmentPublic)
def get_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    파일 메타데이터 조회

    첨부파일의 메타데이터를 조회합니다. (파일 다운로드는 별도 엔드포인트)

    **응답 예시:**
    ```json
    {
        "id": 1,
        "filename": "document.pdf",
        "file_size": 1024000,
        "content_type": "application/pdf",
        "entity_type": "task",
        "entity_id": 123,
        "uploaded_by": 1,
        "created_at": "2025-11-04T12:00:00",
        "description": "프로젝트 계획서"
    }
    ```

    **에러:**
    - 401: 인증되지 않음
    - 404: 첨부파일을 찾을 수 없음
    """
    db_attachment = attachment_crud.get_attachment(db, attachment_id)

    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="첨부파일을 찾을 수 없습니다."
        )

    return db_attachment


@router.get("/{attachment_id}/download")
def download_file(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> FileResponse:
    """
    파일 다운로드

    첨부파일을 다운로드합니다.

    **응답:**
    - 파일 바이너리 데이터
    - Content-Disposition 헤더에 원본 파일명 포함

    **에러:**
    - 401: 인증되지 않음
    - 404: 첨부파일 또는 파일을 찾을 수 없음
    """
    db_attachment = attachment_crud.get_attachment(db, attachment_id)

    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="첨부파일을 찾을 수 없습니다."
        )

    # 파일 경로 가져오기
    file_path = file_storage.get_file_path(db_attachment.stored_filename)

    # 파일 다운로드
    return FileResponse(
        path=file_path,
        filename=db_attachment.filename,
        media_type=db_attachment.content_type,
    )


@router.get("", response_model=AttachmentListResponse)
def list_attachments(
    entity_type: str = Query(..., description="엔티티 타입 (project, task, enabler 등)"),
    entity_id: int = Query(..., description="엔티티 ID"),
    skip: int = Query(0, ge=0, description="건너뛸 개수"),
    limit: int = Query(100, ge=1, le=100, description="조회할 최대 개수"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    엔티티별 파일 목록 조회

    특정 엔티티에 첨부된 파일 목록을 조회합니다.

    **쿼리 파라미터:**
    - entity_type: 엔티티 타입 (필수)
    - entity_id: 엔티티 ID (필수)
    - skip: 건너뛸 개수 (기본: 0)
    - limit: 조회할 최대 개수 (기본: 100)

    **응답 예시:**
    ```json
    {
        "attachments": [
            {
                "id": 1,
                "filename": "document.pdf",
                "file_size": 1024000,
                "content_type": "application/pdf",
                "entity_type": "task",
                "entity_id": 123,
                "uploaded_by": 1,
                "created_at": "2025-11-04T12:00:00",
                "description": "프로젝트 계획서"
            }
        ],
        "total": 1
    }
    ```

    **에러:**
    - 401: 인증되지 않음
    """
    attachments = attachment_crud.get_attachments_by_entity(
        db, entity_type=entity_type, entity_id=entity_id, skip=skip, limit=limit
    )

    total = attachment_crud.count_attachments_by_entity(
        db, entity_type=entity_type, entity_id=entity_id
    )

    return {
        "attachments": attachments,
        "total": total,
    }


@router.patch("/{attachment_id}", response_model=AttachmentPublic)
def update_attachment(
    attachment_id: int,
    attachment_update: AttachmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    파일 설명 수정

    첨부파일의 설명을 수정합니다.

    **요청 예시:**
    ```json
    {
        "description": "업데이트된 파일 설명"
    }
    ```

    **참고:**
    - description 필드만 수정 가능합니다.
    - 파일 자체는 수정할 수 없습니다. (삭제 후 재업로드 필요)

    **에러:**
    - 401: 인증되지 않음
    - 404: 첨부파일을 찾을 수 없음
    """
    db_attachment = attachment_crud.update_attachment(
        db, attachment_id=attachment_id, attachment_update=attachment_update
    )

    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="첨부파일을 찾을 수 없습니다."
        )

    return db_attachment


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    파일 삭제

    첨부파일과 실제 파일을 모두 삭제합니다.

    **에러:**
    - 401: 인증되지 않음
    - 404: 첨부파일을 찾을 수 없음
    - 500: 파일 삭제 실패
    """
    db_attachment = attachment_crud.get_attachment(db, attachment_id)

    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="첨부파일을 찾을 수 없습니다."
        )

    # 실제 파일 삭제
    file_storage.delete_file(db_attachment.stored_filename)

    # 메타데이터 삭제
    success = attachment_crud.delete_attachment(db, attachment_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="파일 삭제 중 오류가 발생했습니다."
        )

    return None
