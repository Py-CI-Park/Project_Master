"""
Tasks API Endpoints

태스크 관리 CRUD API
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()


@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="태스크 생성",
    description="특정 프로젝트에 새로운 태스크를 생성합니다.",
)
def create_task(
    project_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    태스크 생성

    Args:
        project_id: 프로젝트 ID
        task_data: 태스크 생성 데이터
        db: 데이터베이스 세션

    Returns:
        생성된 태스크 정보

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

    # TaskCreate의 project_id가 URL의 project_id와 일치하는지 확인
    if task_data.project_id != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"URL의 프로젝트 ID ({project_id})와 요청 데이터의 프로젝트 ID ({task_data.project_id})가 일치하지 않습니다.",
        )

    # 태스크 생성
    task = Task(**task_data.model_dump())

    try:
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="태스크 생성에 실패했습니다. 입력 데이터를 확인해주세요.",
        )


@router.get(
    "/projects/{project_id}/tasks",
    response_model=List[TaskResponse],
    summary="프로젝트 태스크 목록 조회",
    description="특정 프로젝트의 모든 태스크 목록을 조회합니다.",
)
def list_project_tasks(
    project_id: int,
    skip: Annotated[int, Query(ge=0, le=10000, description="건너뛸 레코드 수")] = 0,
    limit: Annotated[int, Query(ge=1, le=1000, description="최대 조회 레코드 수")] = 100,
    db: Session = Depends(get_db),
) -> List[TaskResponse]:
    """
    프로젝트 태스크 목록 조회

    Args:
        project_id: 프로젝트 ID
        skip: 건너뛸 레코드 수 (기본값: 0)
        limit: 최대 조회 레코드 수 (기본값: 100)
        db: 데이터베이스 세션

    Returns:
        태스크 목록

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

    # 프로젝트의 태스크 목록 조회
    tasks = db.query(Task).filter(Task.project_id == project_id).offset(skip).limit(limit).all()

    return tasks


@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="태스크 상세 조회",
    description="특정 태스크의 상세 정보를 조회합니다.",
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    태스크 상세 조회

    Args:
        task_id: 태스크 ID
        db: 데이터베이스 세션

    Returns:
        태스크 상세 정보

    Raises:
        HTTPException: 404 - 태스크를 찾을 수 없음
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"태스크 ID {task_id}를 찾을 수 없습니다.",
        )

    return task


@router.put(
    "/tasks/{task_id}",
    response_model=TaskResponse,
    summary="태스크 수정",
    description="특정 태스크의 정보를 수정합니다.",
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """
    태스크 수정

    Args:
        task_id: 태스크 ID
        task_data: 태스크 수정 데이터
        db: 데이터베이스 세션

    Returns:
        수정된 태스크 정보

    Raises:
        HTTPException: 404 - 태스크를 찾을 수 없음
        HTTPException: 400 - 검증 오류
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"태스크 ID {task_id}를 찾을 수 없습니다.",
        )

    # 수정 데이터 적용 (None이 아닌 필드만)
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    try:
        db.commit()
        db.refresh(task)
        return task
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="태스크 수정에 실패했습니다. 입력 데이터를 확인해주세요.",
        )


@router.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="태스크 삭제",
    description="특정 태스크를 삭제합니다.",
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    태스크 삭제

    Args:
        task_id: 태스크 ID
        db: 데이터베이스 세션

    Raises:
        HTTPException: 404 - 태스크를 찾을 수 없음
        HTTPException: 400 - 삭제 실패 (연관 데이터 존재 등)
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"태스크 ID {task_id}를 찾을 수 없습니다.",
        )

    try:
        db.delete(task)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="태스크 삭제에 실패했습니다. 연관된 데이터가 있는지 확인해주세요.",
        )
