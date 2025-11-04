"""
WebSocket Module

Socket.IO 기반 실시간 통신 서버를 제공합니다.
FastAPI와 통합되어 실시간 이벤트 브로드캐스팅을 지원합니다.
"""

import socketio
from typing import Optional

# Socket.IO 서버 인스턴스 생성
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",  # 개발 환경: 모든 origin 허용 (운영 환경에서는 제한 필요)
    logger=True,
    engineio_logger=True,
)

# Socket.IO ASGI 앱 (FastAPI 앱과 통합용)
socket_app: Optional[socketio.ASGIApp] = None


def init_socketio(fastapi_app):
    """
    Socket.IO 서버를 FastAPI 앱과 통합합니다.

    Args:
        fastapi_app: FastAPI 애플리케이션 인스턴스

    Returns:
        socketio.ASGIApp: Socket.IO와 FastAPI가 통합된 ASGI 앱
    """
    global socket_app

    # Socket.IO를 FastAPI와 통합
    socket_app = socketio.ASGIApp(
        socketio_server=sio,
        other_asgi_app=fastapi_app,
    )

    return socket_app


__all__ = ["sio", "socket_app", "init_socketio"]
