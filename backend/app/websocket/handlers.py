"""
WebSocket Event Handlers

Socket.IO 연결, 방(room) 관리, 인증 검증 등의 이벤트 핸들러를 제공합니다.
"""

from typing import Dict, Optional
from app.websocket import sio
from app.core.auth import verify_token
from jose import JWTError
import logging

logger = logging.getLogger(__name__)

# 연결된 사용자 정보 저장 (sid -> user_info)
connected_users: Dict[str, Dict] = {}


@sio.event
async def connect(sid: str, environ: dict, auth: Optional[dict] = None):
    """
    클라이언트 연결 이벤트

    Args:
        sid: Socket.IO 세션 ID
        environ: ASGI 환경 변수
        auth: 인증 정보 (토큰 포함)

    Returns:
        bool: 연결 허용 여부 (True: 허용, False or raise: 거부)
    """
    logger.info(f"Client attempting to connect: {sid}")

    # 인증 토큰 검증
    if not auth or "token" not in auth:
        logger.warning(f"Connection rejected: No token provided (sid: {sid})")
        return False

    token = auth.get("token")

    try:
        # JWT 토큰 검증
        payload = verify_token(token)
        user_id = payload.get("sub")
        username = payload.get("username")

        if not user_id:
            logger.warning(f"Connection rejected: Invalid token payload (sid: {sid})")
            return False

        # 연결된 사용자 정보 저장
        connected_users[sid] = {
            "user_id": int(user_id),
            "username": username,
            "rooms": set(),  # 참여 중인 방 목록
        }

        logger.info(f"Client connected: {sid}, user_id: {user_id}, username: {username}")

        # 클라이언트에게 연결 성공 메시지 전송
        await sio.emit(
            "connected",
            {
                "message": "Successfully connected to WebSocket server",
                "user_id": user_id,
                "username": username,
            },
            room=sid,
        )

        return True

    except JWTError as e:
        logger.warning(f"Connection rejected: Invalid token (sid: {sid}, error: {str(e)})")
        return False
    except Exception as e:
        logger.error(f"Connection error (sid: {sid}): {str(e)}")
        return False


@sio.event
async def disconnect(sid: str):
    """
    클라이언트 연결 해제 이벤트

    Args:
        sid: Socket.IO 세션 ID
    """
    user_info = connected_users.get(sid)

    if user_info:
        user_id = user_info.get("user_id")
        username = user_info.get("username")
        rooms = user_info.get("rooms", set())

        logger.info(f"Client disconnected: {sid}, user_id: {user_id}, username: {username}")

        # 사용자가 참여한 모든 방에 퇴장 알림
        for room in rooms:
            await sio.emit(
                "user_left",
                {
                    "user_id": user_id,
                    "username": username,
                    "room": room,
                },
                room=room,
                skip_sid=sid,
            )

        # 연결된 사용자 정보 삭제
        del connected_users[sid]
    else:
        logger.info(f"Client disconnected: {sid} (no user info)")


@sio.event
async def join_project(sid: str, data: dict):
    """
    프로젝트 방(room)에 참여

    Args:
        sid: Socket.IO 세션 ID
        data: {"project_id": int}
    """
    user_info = connected_users.get(sid)

    if not user_info:
        logger.warning(f"join_project failed: User not authenticated (sid: {sid})")
        await sio.emit("error", {"message": "Not authenticated"}, room=sid)
        return

    project_id = data.get("project_id")

    if not project_id:
        logger.warning(f"join_project failed: No project_id provided (sid: {sid})")
        await sio.emit("error", {"message": "project_id is required"}, room=sid)
        return

    room_name = f"project_{project_id}"

    # 방에 참여
    await sio.enter_room(sid, room_name)
    user_info["rooms"].add(room_name)

    user_id = user_info.get("user_id")
    username = user_info.get("username")

    logger.info(f"User {user_id} ({username}) joined project {project_id} (sid: {sid})")

    # 같은 방의 다른 사용자들에게 알림
    await sio.emit(
        "user_joined",
        {
            "user_id": user_id,
            "username": username,
            "room": room_name,
        },
        room=room_name,
        skip_sid=sid,
    )

    # 본인에게 참여 확인 메시지
    await sio.emit(
        "joined_project",
        {
            "message": f"Successfully joined project {project_id}",
            "project_id": project_id,
            "room": room_name,
        },
        room=sid,
    )


@sio.event
async def leave_project(sid: str, data: dict):
    """
    프로젝트 방(room)에서 퇴장

    Args:
        sid: Socket.IO 세션 ID
        data: {"project_id": int}
    """
    user_info = connected_users.get(sid)

    if not user_info:
        logger.warning(f"leave_project failed: User not authenticated (sid: {sid})")
        return

    project_id = data.get("project_id")

    if not project_id:
        logger.warning(f"leave_project failed: No project_id provided (sid: {sid})")
        return

    room_name = f"project_{project_id}"

    # 방에서 퇴장
    await sio.leave_room(sid, room_name)
    user_info["rooms"].discard(room_name)

    user_id = user_info.get("user_id")
    username = user_info.get("username")

    logger.info(f"User {user_id} ({username}) left project {project_id} (sid: {sid})")

    # 같은 방의 다른 사용자들에게 알림
    await sio.emit(
        "user_left",
        {
            "user_id": user_id,
            "username": username,
            "room": room_name,
        },
        room=room_name,
        skip_sid=sid,
    )

    # 본인에게 퇴장 확인 메시지
    await sio.emit(
        "left_project",
        {
            "message": f"Successfully left project {project_id}",
            "project_id": project_id,
            "room": room_name,
        },
        room=sid,
    )


def get_connected_users():
    """
    현재 연결된 모든 사용자 정보 반환

    Returns:
        Dict[str, Dict]: 연결된 사용자 정보 (sid -> user_info)
    """
    return connected_users


def get_users_in_project(project_id: int):
    """
    특정 프로젝트에 연결된 사용자 목록 반환

    Args:
        project_id: 프로젝트 ID

    Returns:
        List[Dict]: 연결된 사용자 정보 리스트
    """
    room_name = f"project_{project_id}"
    users = []

    for sid, user_info in connected_users.items():
        if room_name in user_info.get("rooms", set()):
            users.append({
                "user_id": user_info.get("user_id"),
                "username": user_info.get("username"),
            })

    return users
