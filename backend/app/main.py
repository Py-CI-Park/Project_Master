"""
FastAPI Application Entry Point

폐쇄망 프로젝트 관리 시스템의 메인 애플리케이션 파일입니다.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# WebSocket 서버 및 이벤트 핸들러 임포트 (v2.0 - Phase 10.1)
from app.websocket import init_socketio
# 이벤트 핸들러를 임포트하여 Socket.IO에 등록
import app.websocket.handlers  # noqa: F401

# 앱 초기화
app = FastAPI(
    title="폐쇄망 프로젝트 관리 시스템",
    description="100% 오프라인 동작하는 프로젝트/일정 관리 시스템 API",
    version="2.0.0",  # WebSocket 지원 추가로 버전 업그레이드
)

# CORS 설정 (프론트엔드와 통신을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """루트 엔드포인트 - 서버 상태 확인"""
    return {
        "message": "폐쇄망 프로젝트 관리 시스템 API",
        "version": "2.0.0",
        "status": "running",
        "websocket": "enabled",  # WebSocket 지원 표시
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}


# API 라우터 (v2.0 - Phase 11.1: Notifications)
from app.api.v1 import notifications
app.include_router(
    notifications.router,
    prefix="/api/v1/notifications",
    tags=["notifications"]
)


# WebSocket 서버와 FastAPI 통합 (v2.0 - Phase 10.1)
# uvicorn에서 실행할 ASGI 앱을 socket_app으로 지정해야 합니다
# 명령어: uvicorn app.main:socket_app --reload
socket_app = init_socketio(app)
