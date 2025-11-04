"""
Real-time Event Broadcasting

Socket.IO를 통한 실시간 이벤트 브로드캐스팅을 제공합니다.
CRUD 작업 후 호출하여 연결된 클라이언트에게 실시간 업데이트를 전송합니다.
"""

from typing import Dict, Any, Optional
from app.websocket import sio
import logging

logger = logging.getLogger(__name__)


async def broadcast_task_created(project_id: int, task_data: Dict[str, Any]):
    """
    새 태스크 생성 이벤트 브로드캐스트

    Args:
        project_id: 프로젝트 ID
        task_data: 생성된 태스크 데이터
    """
    room_name = f"project_{project_id}"

    try:
        await sio.emit(
            "task_created",
            {
                "project_id": project_id,
                "task": task_data,
                "timestamp": task_data.get("created_at"),
            },
            room=room_name,
        )
        logger.info(f"Broadcast task_created to room {room_name}: task_id={task_data.get('id')}")
    except Exception as e:
        logger.error(f"Failed to broadcast task_created: {str(e)}")


async def broadcast_task_updated(project_id: int, task_data: Dict[str, Any]):
    """
    태스크 업데이트 이벤트 브로드캐스트

    Args:
        project_id: 프로젝트 ID
        task_data: 업데이트된 태스크 데이터
    """
    room_name = f"project_{project_id}"

    try:
        await sio.emit(
            "task_updated",
            {
                "project_id": project_id,
                "task": task_data,
                "timestamp": task_data.get("updated_at"),
            },
            room=room_name,
        )
        logger.info(f"Broadcast task_updated to room {room_name}: task_id={task_data.get('id')}")
    except Exception as e:
        logger.error(f"Failed to broadcast task_updated: {str(e)}")


async def broadcast_task_deleted(project_id: int, task_id: int):
    """
    태스크 삭제 이벤트 브로드캐스트

    Args:
        project_id: 프로젝트 ID
        task_id: 삭제된 태스크 ID
    """
    room_name = f"project_{project_id}"

    try:
        await sio.emit(
            "task_deleted",
            {
                "project_id": project_id,
                "task_id": task_id,
            },
            room=room_name,
        )
        logger.info(f"Broadcast task_deleted to room {room_name}: task_id={task_id}")
    except Exception as e:
        logger.error(f"Failed to broadcast task_deleted: {str(e)}")


async def broadcast_project_updated(project_id: int, project_data: Dict[str, Any]):
    """
    프로젝트 업데이트 이벤트 브로드캐스트

    Args:
        project_id: 프로젝트 ID
        project_data: 업데이트된 프로젝트 데이터
    """
    room_name = f"project_{project_id}"

    try:
        await sio.emit(
            "project_updated",
            {
                "project": project_data,
                "timestamp": project_data.get("updated_at"),
            },
            room=room_name,
        )
        logger.info(f"Broadcast project_updated to room {room_name}: project_id={project_id}")
    except Exception as e:
        logger.error(f"Failed to broadcast project_updated: {str(e)}")


async def broadcast_dependency_created(project_id: int, dependency_data: Dict[str, Any]):
    """
    새 의존성 생성 이벤트 브로드캐스트

    Args:
        project_id: 프로젝트 ID
        dependency_data: 생성된 의존성 데이터
    """
    room_name = f"project_{project_id}"

    try:
        await sio.emit(
            "dependency_created",
            {
                "project_id": project_id,
                "dependency": dependency_data,
            },
            room=room_name,
        )
        logger.info(f"Broadcast dependency_created to room {room_name}: dependency_id={dependency_data.get('id')}")
    except Exception as e:
        logger.error(f"Failed to broadcast dependency_created: {str(e)}")


async def broadcast_dependency_deleted(project_id: int, dependency_id: int):
    """
    의존성 삭제 이벤트 브로드캐스트

    Args:
        project_id: 프로젝트 ID
        dependency_id: 삭제된 의존성 ID
    """
    room_name = f"project_{project_id}"

    try:
        await sio.emit(
            "dependency_deleted",
            {
                "project_id": project_id,
                "dependency_id": dependency_id,
            },
            room=room_name,
        )
        logger.info(f"Broadcast dependency_deleted to room {room_name}: dependency_id={dependency_id}")
    except Exception as e:
        logger.error(f"Failed to broadcast dependency_deleted: {str(e)}")


async def broadcast_attachment_uploaded(
    entity_type: str,
    entity_id: int,
    attachment_data: Dict[str, Any],
    project_id: Optional[int] = None
):
    """
    첨부파일 업로드 이벤트 브로드캐스트

    Args:
        entity_type: 엔티티 타입 (project, task)
        entity_id: 엔티티 ID
        attachment_data: 업로드된 첨부파일 데이터
        project_id: 프로젝트 ID (task의 경우 필수)
    """
    # 프로젝트 첨부파일인 경우
    if entity_type == "project":
        room_name = f"project_{entity_id}"
    # 태스크 첨부파일인 경우
    elif entity_type == "task" and project_id:
        room_name = f"project_{project_id}"
    else:
        logger.warning(f"Cannot broadcast attachment_uploaded: invalid entity_type or missing project_id")
        return

    try:
        await sio.emit(
            "attachment_uploaded",
            {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "attachment": attachment_data,
            },
            room=room_name,
        )
        logger.info(f"Broadcast attachment_uploaded to room {room_name}: attachment_id={attachment_data.get('id')}")
    except Exception as e:
        logger.error(f"Failed to broadcast attachment_uploaded: {str(e)}")


async def broadcast_attachment_deleted(
    entity_type: str,
    entity_id: int,
    attachment_id: int,
    project_id: Optional[int] = None
):
    """
    첨부파일 삭제 이벤트 브로드캐스트

    Args:
        entity_type: 엔티티 타입 (project, task)
        entity_id: 엔티티 ID
        attachment_id: 삭제된 첨부파일 ID
        project_id: 프로젝트 ID (task의 경우 필수)
    """
    # 프로젝트 첨부파일인 경우
    if entity_type == "project":
        room_name = f"project_{entity_id}"
    # 태스크 첨부파일인 경우
    elif entity_type == "task" and project_id:
        room_name = f"project_{project_id}"
    else:
        logger.warning(f"Cannot broadcast attachment_deleted: invalid entity_type or missing project_id")
        return

    try:
        await sio.emit(
            "attachment_deleted",
            {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "attachment_id": attachment_id,
            },
            room=room_name,
        )
        logger.info(f"Broadcast attachment_deleted to room {room_name}: attachment_id={attachment_id}")
    except Exception as e:
        logger.error(f"Failed to broadcast attachment_deleted: {str(e)}")
