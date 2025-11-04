"""
Enablers API Endpoints

Key Enabler 관리 CRUD API
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enabler import Enabler
from app.models.project import Project
from app.schemas.enabler import EnablerCreate, EnablerResponse, EnablerUpdate

router = APIRouter()


@router.post(
    "/projects/{project_id}/enablers",
    response_model=EnablerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enabler 생성",
    description="특정 프로젝트에 새로운 Key Enabler를 생성합니다.",
)
def create_enabler(
    project_id: int,
    enabler_data: EnablerCreate,
    db: Session = Depends(get_db),
) -> EnablerResponse:
    """
    Enabler 생성

    Args:
        project_id: 프로젝트 ID
        enabler_data: Enabler 생성 데이터
        db: 데이터베이스 세션

    Returns:
        생성된 Enabler 정보

    Raises:
        HTTPException: 404 - 프로젝트를 찾을 수 없음
        HTTPException: 400 - 검증 오류 또는 생성 실패
    """
    # 프로젝트 존재 확인
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다.",
        )

    # EnablerCreate의 project_id가 URL의 project_id와 일치하는지 확인
    if enabler_data.project_id != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"URL의 프로젝트 ID ({project_id})와 요청 데이터의 프로젝트 ID ({enabler_data.project_id})가 일치하지 않습니다.",
        )

    # Enabler 생성
    enabler = Enabler(**enabler_data.model_dump())

    try:
        db.add(enabler)
        db.commit()
        db.refresh(enabler)
        return enabler
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Enabler 생성 실패: {str(e)}",
        ) from e


@router.get(
    "/projects/{project_id}/enablers",
    response_model=List[EnablerResponse],
    summary="프로젝트 Enabler 목록 조회",
    description="특정 프로젝트의 모든 Key Enabler 목록을 조회합니다.",
)
def list_project_enablers(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[EnablerResponse]:
    """
    프로젝트 Enabler 목록 조회

    Args:
        project_id: 프로젝트 ID
        skip: 건너뛸 레코드 수 (기본값: 0)
        limit: 최대 조회 레코드 수 (기본값: 100)
        db: 데이터베이스 세션

    Returns:
        Enabler 목록

    Raises:
        HTTPException: 404 - 프로젝트를 찾을 수 없음
    """
    # 프로젝트 존재 확인
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다.",
        )

    # 프로젝트의 Enabler 목록 조회
    enablers = (
        db.query(Enabler).filter(Enabler.project_id == project_id).offset(skip).limit(limit).all()
    )

    return enablers


@router.get(
    "/enablers/{enabler_id}",
    response_model=EnablerResponse,
    summary="Enabler 상세 조회",
    description="특정 Key Enabler의 상세 정보를 조회합니다.",
)
def get_enabler(
    enabler_id: int,
    db: Session = Depends(get_db),
) -> EnablerResponse:
    """
    Enabler 상세 조회

    Args:
        enabler_id: Enabler ID
        db: 데이터베이스 세션

    Returns:
        Enabler 상세 정보

    Raises:
        HTTPException: 404 - Enabler를 찾을 수 없음
    """
    enabler = db.query(Enabler).filter(Enabler.id == enabler_id).first()

    if not enabler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enabler ID {enabler_id}를 찾을 수 없습니다.",
        )

    return enabler


@router.put(
    "/enablers/{enabler_id}",
    response_model=EnablerResponse,
    summary="Enabler 수정",
    description="특정 Key Enabler의 정보를 수정합니다.",
)
def update_enabler(
    enabler_id: int,
    enabler_data: EnablerUpdate,
    db: Session = Depends(get_db),
) -> EnablerResponse:
    """
    Enabler 수정

    Args:
        enabler_id: Enabler ID
        enabler_data: Enabler 수정 데이터
        db: 데이터베이스 세션

    Returns:
        수정된 Enabler 정보

    Raises:
        HTTPException: 404 - Enabler를 찾을 수 없음
        HTTPException: 400 - 검증 오류
    """
    enabler = db.query(Enabler).filter(Enabler.id == enabler_id).first()

    if not enabler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enabler ID {enabler_id}를 찾을 수 없습니다.",
        )

    # 수정 데이터 적용 (None이 아닌 필드만)
    update_data = enabler_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(enabler, field, value)

    try:
        db.commit()
        db.refresh(enabler)
        return enabler
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Enabler 수정 실패: {str(e)}",
        ) from e


@router.delete(
    "/enablers/{enabler_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Enabler 삭제",
    description="특정 Key Enabler를 삭제합니다.",
)
def delete_enabler(
    enabler_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    Enabler 삭제

    Args:
        enabler_id: Enabler ID
        db: 데이터베이스 세션

    Raises:
        HTTPException: 404 - Enabler를 찾을 수 없음
        HTTPException: 400 - 삭제 실패 (연관 데이터 존재 등)
    """
    enabler = db.query(Enabler).filter(Enabler.id == enabler_id).first()

    if not enabler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enabler ID {enabler_id}를 찾을 수 없습니다.",
        )

    try:
        db.delete(enabler)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Enabler 삭제 실패: {str(e)}",
        ) from e
