#!/usr/bin/env python
"""
데이터베이스 초기화 스크립트

데이터베이스 테이블을 생성하고 초기 설정을 수행합니다.
Alembic 마이그레이션을 사용하여 스키마를 생성합니다.
"""

import os
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, inspect, text
from app.database import SQLALCHEMY_DATABASE_URL, Base, engine
from app.models import (
    CalendarEvent,
    Dependency,
    Enabler,
    EnablerImpact,
    Project,
    Task,
)


def check_database_exists() -> bool:
    """
    데이터베이스 파일이 존재하는지 확인

    Returns:
        bool: 데이터베이스 파일 존재 여부
    """
    # SQLite URL에서 파일 경로 추출
    db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
    # 상대 경로를 절대 경로로 변환
    db_path = os.path.join(os.path.dirname(__file__), db_path)
    return os.path.exists(db_path)


def check_tables_exist() -> bool:
    """
    데이터베이스에 모든 테이블이 존재하는지 확인

    Returns:
        bool: 모든 테이블 존재 여부
    """
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    required_tables = {
        "projects",
        "tasks",
        "enablers",
        "dependencies",
        "enabler_impacts",
        "calendar_events",
    }

    return required_tables.issubset(existing_tables)


def create_data_directory():
    """data 디렉토리 생성"""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    print(f"✅ data 디렉토리 생성 완료: {data_dir}")


def initialize_database():
    """
    데이터베이스 초기화

    Alembic 마이그레이션을 사용하여 테이블을 생성합니다.
    """
    print("=" * 60)
    print("데이터베이스 초기화 시작")
    print("=" * 60)

    # 1. data 디렉토리 생성
    print("\n[1/4] data 디렉토리 확인...")
    create_data_directory()

    # 2. 데이터베이스 파일 확인
    print("\n[2/4] 데이터베이스 파일 확인...")
    db_exists = check_database_exists()
    if db_exists:
        print(f"✅ 데이터베이스 파일이 이미 존재합니다: {SQLALCHEMY_DATABASE_URL}")
    else:
        print(f"ℹ️  데이터베이스 파일이 없습니다. 새로 생성합니다.")

    # 3. 테이블 존재 확인
    print("\n[3/4] 데이터베이스 테이블 확인...")
    if db_exists and check_tables_exist():
        print("✅ 모든 테이블이 이미 존재합니다.")
        print("   - projects")
        print("   - tasks")
        print("   - enablers")
        print("   - dependencies")
        print("   - enabler_impacts")
        print("   - calendar_events")
    else:
        print("⚠️  테이블이 없거나 불완전합니다.")
        print("ℹ️  Alembic 마이그레이션을 사용하여 테이블을 생성하세요:")
        print("   $ alembic upgrade head")
        return False

    # 4. 데이터베이스 연결 테스트
    print("\n[4/4] 데이터베이스 연결 테스트...")
    try:
        with engine.connect() as connection:
            # 간단한 쿼리로 연결 확인
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        print("✅ 데이터베이스 연결 성공")
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

    print("\n" + "=" * 60)
    print("✅ 데이터베이스 초기화 완료!")
    print("=" * 60)

    # 추가 정보 출력
    print("\n📊 데이터베이스 정보:")
    print(f"   - URL: {SQLALCHEMY_DATABASE_URL}")
    print(f"   - 엔진: SQLite")
    print(f"   - 테이블 수: 6개 (+ alembic_version)")
    print(f"   - ORM: SQLAlchemy 2.0")

    return True


def show_usage():
    """사용법 출력"""
    print("\n" + "=" * 60)
    print("다음 단계:")
    print("=" * 60)
    print()
    print("1. 샘플 데이터 추가 (선택):")
    print("   $ python create_sample_data.py")
    print()
    print("2. FastAPI 서버 실행:")
    print("   $ uvicorn app.main:app --reload")
    print()
    print("3. Swagger UI 접속:")
    print("   http://localhost:8000/docs")
    print()


if __name__ == "__main__":
    try:
        success = initialize_database()
        if success:
            show_usage()
        else:
            print("\n⚠️  초기화가 완료되지 않았습니다.")
            print("   Alembic 마이그레이션을 먼저 실행하세요:")
            print("   $ alembic upgrade head")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
