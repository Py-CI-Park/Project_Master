"""
Dependencies API Endpoints

태스크 의존성 관리 API
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dependency import Dependency
from app.models.task import Task
from app.schemas.dependency import DependencyCreate, DependencyResponse

router = APIRouter()


@router.post(
    "/dependencies",
    response_model=DependencyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="의존성 생성",
    description="두 태스크 간의 의존성 관계를 생성합니다.",
)
def create_dependency(
    dependency_data: DependencyCreate,
    db: Session = Depends(get_db),
) -> DependencyResponse:
    """
    의존성 생성

    Args:
        dependency_data: 의존성 생성 데이터
        db: 데이터베이스 세션

    Returns:
        생성된 의존성 정보

    Raises:
        HTTPException: 404 - 선행 또는 후속 태스크를 찾을 수 없음
        HTTPException: 400 - 검증 오류 또는 생성 실패
    """
    # 선행 태스크 존재 확인
    predecessor_task = db.query(Task).filter(Task.id == dependency_data.predecessor_task_id).first()
    if not predecessor_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"선행 태스크 ID {dependency_data.predecessor_task_id}를 찾을 수 없습니다.",
        )

    # 후속 태스크 존재 확인
    successor_task = db.query(Task).filter(Task.id == dependency_data.successor_task_id).first()
    if not successor_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"후속 태스크 ID {dependency_data.successor_task_id}를 찾을 수 없습니다.",
        )

    # 동일 프로젝트 검증
    if predecessor_task.project_id != successor_task.project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"선행 태스크(프로젝트 ID: {predecessor_task.project_id})와 "
            f"후속 태스크(프로젝트 ID: {successor_task.project_id})는 동일한 프로젝트에 속해야 합니다.",
        )

    # 중복 의존성 검증
    existing_dependency = (
        db.query(Dependency)
        .filter(
            Dependency.predecessor_task_id == dependency_data.predecessor_task_id,
            Dependency.successor_task_id == dependency_data.successor_task_id,
        )
        .first()
    )
    if existing_dependency:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"선행 태스크 ID {dependency_data.predecessor_task_id}와 "
            f"후속 태스크 ID {dependency_data.successor_task_id} 간의 의존성이 이미 존재합니다.",
        )

    # 의존성 생성
    dependency = Dependency(**dependency_data.model_dump())

    try:
        db.add(dependency)
        db.commit()
        db.refresh(dependency)
        return dependency
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"의존성 생성 실패: {str(e)}",
        ) from e


@router.get(
    "/projects/{project_id}/dependencies",
    response_model=List[DependencyResponse],
    summary="프로젝트 의존성 목록 조회",
    description="특정 프로젝트의 모든 태스크 의존성 목록을 조회합니다.",
)
def list_project_dependencies(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[DependencyResponse]:
    """
    프로젝트 의존성 목록 조회

    Args:
        project_id: 프로젝트 ID
        skip: 건너뛸 레코드 수 (기본값: 0)
        limit: 최대 조회 레코드 수 (기본값: 100)
        db: 데이터베이스 세션

    Returns:
        의존성 목록

    Raises:
        HTTPException: 404 - 프로젝트를 찾을 수 없음
    """
    # 프로젝트에 속한 태스크들의 의존성 조회
    # 선행 태스크 또는 후속 태스크 중 하나라도 해당 프로젝트에 속하면 포함
    dependencies = (
        db.query(Dependency)
        .join(Task, Task.id == Dependency.predecessor_task_id)
        .filter(Task.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return dependencies


@router.delete(
    "/dependencies/{dependency_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="의존성 삭제",
    description="특정 태스크 의존성을 삭제합니다.",
)
def delete_dependency(
    dependency_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    의존성 삭제

    Args:
        dependency_id: 의존성 ID
        db: 데이터베이스 세션

    Raises:
        HTTPException: 404 - 의존성을 찾을 수 없음
        HTTPException: 400 - 삭제 실패
    """
    dependency = db.query(Dependency).filter(Dependency.id == dependency_id).first()

    if not dependency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"의존성 ID {dependency_id}를 찾을 수 없습니다.",
        )

    try:
        db.delete(dependency)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"의존성 삭제 실패: {str(e)}",
        ) from e
