#!/usr/bin/env python3
"""
데이터베이스 초기화 스크립트

Alembic 마이그레이션을 실행하여 데이터베이스를 초기화합니다.
"""

import os
import sys
from pathlib import Path

# 백엔드 디렉토리를 Python 경로에 추가
backend_dir = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from alembic import command
from alembic.config import Config


def init_database():
    """데이터베이스 초기화 및 마이그레이션 실행"""
    print("=" * 60)
    print("프로젝트 관리 시스템 - 데이터베이스 초기화")
    print("=" * 60)

    # Alembic 설정 파일 경로
    alembic_cfg = Config(str(backend_dir / "alembic.ini"))

    # 데이터베이스 파일 경로 확인
    db_path = backend_dir / "project_master.db"
    if db_path.exists():
        print(f"\n⚠️  경고: 데이터베이스 파일이 이미 존재합니다: {db_path}")
        response = input("기존 데이터베이스를 삭제하고 새로 생성하시겠습니까? (y/N): ")
        if response.lower() == 'y':
            db_path.unlink()
            print("✅ 기존 데이터베이스 삭제 완료")
        else:
            print("❌ 초기화가 취소되었습니다.")
            return

    print("\n📦 데이터베이스 마이그레이션 실행 중...")
    try:
        # 최신 버전으로 마이그레이션
        command.upgrade(alembic_cfg, "head")
        print("✅ 데이터베이스 초기화 완료!")
        print(f"   위치: {db_path}")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("데이터베이스가 성공적으로 초기화되었습니다.")
    print("=" * 60)


if __name__ == "__main__":
    init_database()
