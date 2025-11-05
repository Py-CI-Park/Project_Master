"""add_performance_indexes_for_optimization

Revision ID: 1475c63be0e3
Revises: 7a13842ed23f
Create Date: 2025-11-05 15:12:54.243020

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1475c63be0e3'
down_revision: Union[str, None] = '7a13842ed23f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    성능 최적화를 위한 추가 인덱스 생성

    추가되는 인덱스:
    1. projects 테이블: start_date, end_date (날짜 범위 쿼리 최적화)
    2. tasks 테이블: start_date, end_date, assignee (날짜 및 담당자 필터링 최적화)
    3. tasks 테이블: (project_id, status) 복합 인덱스 (프로젝트별 상태 필터링 최적화)
    4. notifications 테이블: (user_id, is_read, created_at) 복합 인덱스 (읽지 않은 알림 조회 최적화)
    """
    # Projects 테이블 인덱스
    op.create_index('idx_projects_start_date', 'projects', ['start_date'])
    op.create_index('idx_projects_end_date', 'projects', ['end_date'])
    op.create_index('idx_projects_date_range', 'projects', ['start_date', 'end_date'])

    # Tasks 테이블 인덱스
    op.create_index('idx_tasks_start_date', 'tasks', ['start_date'])
    op.create_index('idx_tasks_end_date', 'tasks', ['end_date'])
    op.create_index('idx_tasks_assignee', 'tasks', ['assignee'])
    op.create_index('idx_tasks_project_status', 'tasks', ['project_id', 'status'])
    op.create_index('idx_tasks_date_range', 'tasks', ['start_date', 'end_date'])

    # Notifications 테이블 복합 인덱스 (읽지 않은 알림 빠른 조회)
    op.create_index('idx_notifications_user_read_created', 'notifications', ['user_id', 'is_read', 'created_at'])


def downgrade() -> None:
    """
    추가한 인덱스 제거
    """
    # Notifications 복합 인덱스 제거
    op.drop_index('idx_notifications_user_read_created', 'notifications')

    # Tasks 인덱스 제거
    op.drop_index('idx_tasks_date_range', 'tasks')
    op.drop_index('idx_tasks_project_status', 'tasks')
    op.drop_index('idx_tasks_assignee', 'tasks')
    op.drop_index('idx_tasks_end_date', 'tasks')
    op.drop_index('idx_tasks_start_date', 'tasks')

    # Projects 인덱스 제거
    op.drop_index('idx_projects_date_range', 'projects')
    op.drop_index('idx_projects_end_date', 'projects')
    op.drop_index('idx_projects_start_date', 'projects')
