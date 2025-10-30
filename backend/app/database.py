"""
Database Configuration

SQLAlchemy를 사용한 SQLite 데이터베이스 설정
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 데이터베이스 URL (프로젝트 루트의 data 폴더에 저장)
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/project_manager.db"

# SQLite용 엔진 생성 (check_same_thread=False는 FastAPI와의 호환성을 위해 필요)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,  # SQL 쿼리 로깅 (개발 중에는 True, 프로덕션에서는 False)
)

# 세션 생성기
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모델 베이스 클래스
Base = declarative_base()


def get_db():
    """
    데이터베이스 세션 의존성

    FastAPI의 Depends()와 함께 사용하여 각 요청마다 DB 세션을 생성하고
    요청 완료 후 자동으로 세션을 닫습니다.

    사용 예:
    @app.get("/items")
    def read_items(db: Session = Depends(get_db)):
        ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    데이터베이스 초기화

    모든 테이블을 생성합니다.
    이 함수는 애플리케이션 시작 시 한 번만 호출됩니다.
    """
    # 모든 모델을 임포트해야 Base.metadata.create_all()이 작동합니다
    # from app.models import project, task, enabler, dependency

    Base.metadata.create_all(bind=engine)
    print("✅ 데이터베이스 테이블이 생성되었습니다.")


if __name__ == "__main__":
    # 스크립트로 직접 실행 시 데이터베이스 초기화
    import os

    os.makedirs("data", exist_ok=True)
    init_db()
