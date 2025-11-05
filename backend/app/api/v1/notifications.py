"""
Notification API
v2.0에서 추가된 사용자 알림 API
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.notification import NotificationService
from app.schemas.notification import NotificationPublic, NotificationList, NotificationUpdate

router = APIRouter()


@router.get("/", response_model=NotificationList)
def get_notifications(
    skip: int = Query(0, ge=0, description="건너뛸 개수"),
    limit: int = Query(50, ge=1, le=100, description="조회할 개수"),
    unread_only: bool = Query(False, description="읽지 않은 알림만 조회"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    내 알림 목록 조회

    Args:
        skip: 건너뛸 개수 (페이지네이션)
        limit: 조회할 개수 (최대 100)
        unread_only: 읽지 않은 알림만 조회할지 여부
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        알림 목록 및 통계
    """
    # 알림 목록 조회
    notifications, total = NotificationService.get_user_notifications(
        db, current_user.id, skip=skip, limit=limit, unread_only=unread_only
    )

    # 읽지 않은 알림 개수 조회
    unread_count = NotificationService.get_unread_count(db, current_user.id)

    return NotificationList(
        notifications=[NotificationPublic.from_orm(n) for n in notifications],
        total=total,
        unread_count=unread_count
    )


@router.get("/unread-count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    읽지 않은 알림 개수 조회

    Args:
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        읽지 않은 알림 개수
    """
    unread_count = NotificationService.get_unread_count(db, current_user.id)
    return {"unread_count": unread_count}


@router.put("/{notification_id}/read", response_model=NotificationPublic)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    알림 읽음 처리

    Args:
        notification_id: 알림 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        업데이트된 알림
    """
    notification = NotificationService.mark_as_read(
        db, notification_id, current_user.id
    )
    return NotificationPublic.from_orm(notification)


@router.put("/read-all", response_model=dict)
def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    전체 알림 읽음 처리

    Args:
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        읽음 처리된 알림 개수
    """
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"count": count, "message": f"{count} notifications marked as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    알림 삭제

    Args:
        notification_id: 알림 ID
        current_user: 현재 인증된 사용자
        db: 데이터베이스 세션

    Returns:
        None (204 No Content)
    """
    NotificationService.delete_notification(
        db, notification_id, current_user.id
    )
    return None
