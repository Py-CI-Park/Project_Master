"""
FastAPI Application Entry Point

폐쇄망 프로젝트 관리 시스템의 메인 애플리케이션 파일입니다.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 앱 초기화
app = FastAPI(
    title="폐쇄망 프로젝트 관리 시스템",
    description="100% 오프라인 동작하는 프로젝트/일정 관리 시스템 API",
    version="1.0.0",
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
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}


# API 라우터는 나중에 추가 예정
# from app.api import projects, tasks, enablers
# app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
