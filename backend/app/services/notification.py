"""
알림 서비스
v2.0에서 추가된 사용자 알림 생성 및 관리 기능
"""
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationService:
    """
    알림 서비스

    알림 생성, 조회, 읽음 처리, 삭제 기능을 제공합니다.
    """

    @staticmethod
    def create_notification(
        db: Session,
        notification_data: NotificationCreate
    ) -> Notification:
        """
        알림 생성

        Args:
            db: 데이터베이스 세션
            notification_data: 알림 생성 데이터

        Returns:
            생성된 알림 객체
        """
        notification = Notification(
            user_id=notification_data.user_id,
            type=notification_data.type,
            title=notification_data.title,
            message=notification_data.message,
            related_entity_type=notification_data.related_entity_type,
            related_entity_id=notification_data.related_entity_id,
            project_id=notification_data.project_id,
            is_read=False,
            created_at=datetime.utcnow(),
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        unread_only: bool = False
    ) -> Tuple[List[Notification], int]:
        """
        사용자 알림 목록 조회

        Args:
            db: 데이터베이스 세션
            user_id: 사용자 ID
            skip: 건너뛸 개수
            limit: 조회할 개수
            unread_only: 읽지 않은 알림만 조회

        Returns:
            (알림 목록, 전체 개수) 튜플
        """
        # 기본 쿼리
        query = db.query(Notification).filter(Notification.user_id == user_id)

        # 읽지 않은 알림만 조회
        if unread_only:
            query = query.filter(Notification.is_read == False)

        # 전체 개수 조회
        total = query.count()

        # 정렬 및 페이지네이션
        notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

        return notifications, total

    @staticmethod
    def get_notification_by_id(
        db: Session,
        notification_id: int,
        user_id: int
    ) -> Optional[Notification]:
        """
        알림 단건 조회

        Args:
            db: 데이터베이스 세션
            notification_id: 알림 ID
            user_id: 사용자 ID

        Returns:
            알림 객체 (없으면 None)
        """
        return db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

    @staticmethod
    def mark_as_read(
        db: Session,
        notification_id: int,
        user_id: int
    ) -> Notification:
        """
        알림 읽음 처리

        Args:
            db: 데이터베이스 세션
            notification_id: 알림 ID
            user_id: 사용자 ID

        Returns:
            업데이트된 알림 객체

        Raises:
            HTTPException: 알림이 없거나 권한이 없는 경우
        """
        notification = NotificationService.get_notification_by_id(
            db, notification_id, user_id
        )

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        notification.is_read = True
        notification.read_at = datetime.utcnow()

        db.commit()
        db.refresh(notification)

        return notification

    @staticmethod
    def mark_all_as_read(
        db: Session,
        user_id: int
    ) -> int:
        """
        사용자의 모든 알림 읽음 처리

        Args:
            db: 데이터베이스 세션
            user_id: 사용자 ID

        Returns:
            읽음 처리된 알림 개수
        """
        # 읽지 않은 알림 조회
        notifications = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).all()

        # 모두 읽음 처리
        count = 0
        for notification in notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            count += 1

        db.commit()

        return count

    @staticmethod
    def delete_notification(
        db: Session,
        notification_id: int,
        user_id: int
    ) -> bool:
        """
        알림 삭제

        Args:
            db: 데이터베이스 세션
            notification_id: 알림 ID
            user_id: 사용자 ID

        Returns:
            삭제 성공 여부

        Raises:
            HTTPException: 알림이 없거나 권한이 없는 경우
        """
        notification = NotificationService.get_notification_by_id(
            db, notification_id, user_id
        )

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        db.delete(notification)
        db.commit()

        return True

    @staticmethod
    def get_unread_count(
        db: Session,
        user_id: int
    ) -> int:
        """
        읽지 않은 알림 개수 조회

        Args:
            db: 데이터베이스 세션
            user_id: 사용자 ID

        Returns:
            읽지 않은 알림 개수
        """
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
