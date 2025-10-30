"""
Projects API Endpoints

프로젝트 관리 CRUD API
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter()


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="프로젝트 생성",
    description="새로운 프로젝트를 생성합니다.",
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """
    프로젝트 생성

    Args:
        project_data: 프로젝트 생성 데이터
        db: 데이터베이스 세션

    Returns:
        생성된 프로젝트 정보

    Raises:
        HTTPException: 400 - 검증 오류
    """
    # 프로젝트 생성
    project = Project(**project_data.model_dump())

    try:
        db.add(project)
        db.commit()
        db.refresh(project)
        return project
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"프로젝트 생성 실패: {str(e)}",
        ) from e


@router.get(
    "/",
    response_model=List[ProjectResponse],
    summary="프로젝트 목록 조회",
    description="모든 프로젝트 목록을 조회합니다.",
)
def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[ProjectResponse]:
    """
    프로젝트 목록 조회

    Args:
        skip: 건너뛸 레코드 수 (기본값: 0)
        limit: 최대 조회 레코드 수 (기본값: 100)
        db: 데이터베이스 세션

    Returns:
        프로젝트 목록
    """
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="프로젝트 상세 조회",
    description="특정 프로젝트의 상세 정보를 조회합니다.",
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """
    프로젝트 상세 조회

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션

    Returns:
        프로젝트 상세 정보

    Raises:
        HTTPException: 404 - 프로젝트를 찾을 수 없음
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다.",
        )

    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="프로젝트 수정",
    description="특정 프로젝트의 정보를 수정합니다.",
)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """
    프로젝트 수정

    Args:
        project_id: 프로젝트 ID
        project_data: 프로젝트 수정 데이터
        db: 데이터베이스 세션

    Returns:
        수정된 프로젝트 정보

    Raises:
        HTTPException: 404 - 프로젝트를 찾을 수 없음
        HTTPException: 400 - 검증 오류
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다.",
        )

    # 수정 데이터 적용 (None이 아닌 필드만)
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    try:
        db.commit()
        db.refresh(project)
        return project
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"프로젝트 수정 실패: {str(e)}",
        ) from e


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="프로젝트 삭제",
    description="특정 프로젝트를 삭제합니다.",
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    프로젝트 삭제

    Args:
        project_id: 프로젝트 ID
        db: 데이터베이스 세션

    Raises:
        HTTPException: 404 - 프로젝트를 찾을 수 없음
        HTTPException: 400 - 삭제 실패 (연관 데이터 존재 등)
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"프로젝트 ID {project_id}를 찾을 수 없습니다.",
        )

    try:
        db.delete(project)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"프로젝트 삭제 실패: {str(e)}",
        ) from e
