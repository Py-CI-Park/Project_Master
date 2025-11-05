"""
v1.0 → v2.0 데이터베이스 마이그레이션 스크립트

이 스크립트는 폐쇄망 프로젝트 관리 시스템을 v1.0에서 v2.0으로 마이그레이션합니다.

주요 기능:
1. v1.0 데이터베이스 백업
2. v2.0 스키마로 업그레이드 (Alembic 사용)
3. 기본 admin 사용자 생성
4. 기존 데이터의 소유자를 admin으로 설정
5. 데이터 무결성 검증
6. 롤백 기능 (백업에서 복원)

사용법:
    python migrations/v1_to_v2.py [options]

옵션:
    --db-path PATH          v1.0 데이터베이스 파일 경로 (기본: ../project_master.db)
    --backup-path PATH      백업 파일 저장 경로 (기본: ../backups/)
    --admin-username NAME   admin 사용자 이름 (기본: admin)
    --admin-password PASS   admin 비밀번호 (기본: admin123)
    --admin-email EMAIL     admin 이메일 (기본: admin@localhost)
    --rollback             마이그레이션 롤백 (백업에서 복원)
    --verify               마이그레이션 검증만 수행
    --help                 도움말 표시
"""

import os
import sys
import shutil
import argparse
from datetime import datetime
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from app.database import Base
from app.models import User, Role
from app.models.user import UserRole


# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class MigrationManager:
    """v1.0 → v2.0 마이그레이션 관리자"""

    def __init__(
        self,
        db_path: str,
        backup_path: str,
        admin_username: str = "admin",
        admin_password: str = "admin123",
        admin_email: str = "admin@localhost",
    ):
        self.db_path = Path(db_path).resolve()
        self.backup_dir = Path(backup_path).resolve()
        self.admin_username = admin_username
        self.admin_password = admin_password
        self.admin_email = admin_email

        # 백업 디렉토리 생성
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # 타임스탬프
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_file = self.backup_dir / f"project_master_v1_backup_{self.timestamp}.db"

    def check_v1_database(self) -> bool:
        """v1.0 데이터베이스 존재 여부 확인"""
        if not self.db_path.exists():
            print(f"❌ 에러: v1.0 데이터베이스 파일을 찾을 수 없습니다: {self.db_path}")
            return False

        # v1.0 데이터베이스인지 확인 (users 테이블이 없어야 함)
        engine = create_engine(f"sqlite:///{self.db_path}")
        try:
            with engine.connect() as conn:
                result = conn.execute(
                    text("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
                )
                if result.fetchone():
                    print(f"⚠️  경고: 이미 v2.0 데이터베이스입니다 (users 테이블 존재)")
                    return False

                # v1.0 필수 테이블 확인
                required_tables = ["projects", "tasks", "enablers", "dependencies"]
                for table in required_tables:
                    result = conn.execute(
                        text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                    )
                    if not result.fetchone():
                        print(f"❌ 에러: v1.0 필수 테이블 '{table}'이(가) 없습니다")
                        return False

            print(f"✅ v1.0 데이터베이스 확인 완료: {self.db_path}")
            return True
        except Exception as e:
            print(f"❌ 데이터베이스 확인 중 에러: {e}")
            return False
        finally:
            engine.dispose()

    def backup_database(self) -> bool:
        """v1.0 데이터베이스 백업"""
        try:
            print(f"📦 데이터베이스 백업 중...")
            shutil.copy2(self.db_path, self.backup_file)
            print(f"✅ 백업 완료: {self.backup_file}")
            return True
        except Exception as e:
            print(f"❌ 백업 실패: {e}")
            return False

    def run_alembic_upgrade(self) -> bool:
        """Alembic으로 v2.0 스키마 업그레이드"""
        try:
            print(f"🔄 v2.0 스키마로 업그레이드 중...")

            # Alembic 명령 실행
            import subprocess

            backend_dir = self.db_path.parent
            result = subprocess.run(
                ["alembic", "upgrade", "head"],
                cwd=backend_dir,
                capture_output=True,
                text=True,
            )

            if result.returncode != 0:
                print(f"❌ Alembic 업그레이드 실패:")
                print(result.stderr)
                return False

            print(f"✅ v2.0 스키마 업그레이드 완료")
            return True
        except Exception as e:
            print(f"❌ 스키마 업그레이드 중 에러: {e}")
            return False

    def create_default_admin(self) -> bool:
        """기본 admin 사용자 생성"""
        try:
            print(f"👤 기본 admin 사용자 생성 중...")

            engine = create_engine(f"sqlite:///{self.db_path}")
            SessionLocal = sessionmaker(bind=engine)
            db = SessionLocal()

            try:
                # 1. Admin 역할 생성
                admin_role = db.query(Role).filter(Role.name == "Admin").first()
                if not admin_role:
                    admin_role = Role(
                        name="Admin",
                        description="시스템 관리자 - 모든 권한 보유",
                    )
                    db.add(admin_role)
                    db.commit()
                    db.refresh(admin_role)
                    print(f"   ✅ Admin 역할 생성 완료")
                else:
                    print(f"   ℹ️  Admin 역할 이미 존재")

                # 2. Admin 사용자 생성
                admin_user = db.query(User).filter(User.username == self.admin_username).first()
                if not admin_user:
                    hashed_password = pwd_context.hash(self.admin_password)
                    admin_user = User(
                        username=self.admin_username,
                        email=self.admin_email,
                        hashed_password=hashed_password,
                        full_name="System Administrator",
                        is_active=True,
                    )
                    db.add(admin_user)
                    db.commit()
                    db.refresh(admin_user)
                    print(f"   ✅ Admin 사용자 생성 완료")
                else:
                    print(f"   ℹ️  Admin 사용자 이미 존재")

                # 3. Admin 역할 할당
                user_role = (
                    db.query(UserRole)
                    .filter(
                        UserRole.user_id == admin_user.id,
                        UserRole.role_id == admin_role.id,
                    )
                    .first()
                )
                if not user_role:
                    user_role = UserRole(user_id=admin_user.id, role_id=admin_role.id)
                    db.add(user_role)
                    db.commit()
                    print(f"   ✅ Admin 역할 할당 완료")
                else:
                    print(f"   ℹ️  Admin 역할 이미 할당됨")

                print(f"✅ 기본 admin 사용자 생성 완료")
                print(f"   - 사용자명: {self.admin_username}")
                print(f"   - 이메일: {self.admin_email}")
                print(f"   - 비밀번호: {self.admin_password}")
                print(f"   ⚠️  보안을 위해 첫 로그인 후 비밀번호를 변경하세요!")

                return True
            finally:
                db.close()
                engine.dispose()

        except Exception as e:
            print(f"❌ Admin 사용자 생성 실패: {e}")
            return False

    def update_existing_data(self) -> bool:
        """기존 데이터의 소유자를 admin으로 설정"""
        try:
            print(f"🔄 기존 데이터 소유자 업데이트 중...")

            engine = create_engine(f"sqlite:///{self.db_path}")
            SessionLocal = sessionmaker(bind=engine)
            db = SessionLocal()

            try:
                # Admin 사용자 ID 가져오기
                admin_user = db.query(User).filter(User.username == self.admin_username).first()
                if not admin_user:
                    print(f"❌ Admin 사용자를 찾을 수 없습니다")
                    return False

                admin_id = admin_user.id

                # 기존 데이터의 created_by, updated_by를 admin으로 설정
                with engine.connect() as conn:
                    # Projects
                    result = conn.execute(
                        text(
                            "UPDATE projects SET created_by = :admin_id, updated_by = :admin_id WHERE created_by IS NULL"
                        ),
                        {"admin_id": admin_id},
                    )
                    conn.commit()
                    print(f"   ✅ Projects 업데이트: {result.rowcount}개")

                    # Tasks
                    result = conn.execute(
                        text(
                            "UPDATE tasks SET created_by = :admin_id, updated_by = :admin_id WHERE created_by IS NULL"
                        ),
                        {"admin_id": admin_id},
                    )
                    conn.commit()
                    print(f"   ✅ Tasks 업데이트: {result.rowcount}개")

                    # Enablers
                    result = conn.execute(
                        text(
                            "UPDATE enablers SET created_by = :admin_id, updated_by = :admin_id WHERE created_by IS NULL"
                        ),
                        {"admin_id": admin_id},
                    )
                    conn.commit()
                    print(f"   ✅ Enablers 업데이트: {result.rowcount}개")

                print(f"✅ 기존 데이터 업데이트 완료")
                return True
            finally:
                db.close()
                engine.dispose()

        except Exception as e:
            print(f"❌ 기존 데이터 업데이트 실패: {e}")
            return False

    def verify_migration(self) -> bool:
        """마이그레이션 검증"""
        try:
            print(f"🔍 마이그레이션 검증 중...")

            engine = create_engine(f"sqlite:///{self.db_path}")
            with engine.connect() as conn:
                # 1. v2.0 필수 테이블 확인
                v2_tables = [
                    "users",
                    "roles",
                    "user_roles",
                    "project_members",
                    "notifications",
                    "attachments",
                ]
                for table in v2_tables:
                    result = conn.execute(
                        text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                    )
                    if not result.fetchone():
                        print(f"   ❌ v2.0 테이블 '{table}'이(가) 없습니다")
                        return False
                print(f"   ✅ v2.0 테이블 확인 완료")

                # 2. Admin 사용자 확인
                result = conn.execute(text("SELECT COUNT(*) FROM users WHERE username = 'admin'"))
                count = result.scalar()
                if count == 0:
                    print(f"   ❌ Admin 사용자가 없습니다")
                    return False
                print(f"   ✅ Admin 사용자 확인 완료")

                # 3. v1.0 데이터 보존 확인
                result = conn.execute(text("SELECT COUNT(*) FROM projects"))
                project_count = result.scalar()
                print(f"   ✅ Projects: {project_count}개")

                result = conn.execute(text("SELECT COUNT(*) FROM tasks"))
                task_count = result.scalar()
                print(f"   ✅ Tasks: {task_count}개")

                result = conn.execute(text("SELECT COUNT(*) FROM enablers"))
                enabler_count = result.scalar()
                print(f"   ✅ Enablers: {enabler_count}개")

            print(f"✅ 마이그레이션 검증 완료")
            return True

        except Exception as e:
            print(f"❌ 마이그레이션 검증 실패: {e}")
            return False
        finally:
            engine.dispose()

    def rollback(self) -> bool:
        """마이그레이션 롤백 (백업에서 복원)"""
        try:
            print(f"🔄 마이그레이션 롤백 중...")

            if not self.backup_file.exists():
                print(f"❌ 백업 파일을 찾을 수 없습니다: {self.backup_file}")
                return False

            # 현재 데이터베이스를 백업 파일로 대체
            shutil.copy2(self.backup_file, self.db_path)
            print(f"✅ 롤백 완료: {self.db_path}")
            return True

        except Exception as e:
            print(f"❌ 롤백 실패: {e}")
            return False

    def migrate(self) -> bool:
        """전체 마이그레이션 프로세스 실행"""
        print(f"=" * 70)
        print(f"폐쇄망 프로젝트 관리 시스템 v1.0 → v2.0 마이그레이션")
        print(f"=" * 70)
        print()

        # 1. v1.0 데이터베이스 확인
        if not self.check_v1_database():
            return False
        print()

        # 2. 백업
        if not self.backup_database():
            return False
        print()

        # 3. v2.0 스키마 업그레이드
        if not self.run_alembic_upgrade():
            print(f"❌ 마이그레이션 실패. 백업에서 롤백하시겠습니까? (y/n): ", end="")
            if input().lower() == "y":
                self.rollback()
            return False
        print()

        # 4. Admin 사용자 생성
        if not self.create_default_admin():
            print(f"❌ 마이그레이션 실패. 백업에서 롤백하시겠습니까? (y/n): ", end="")
            if input().lower() == "y":
                self.rollback()
            return False
        print()

        # 5. 기존 데이터 업데이트
        if not self.update_existing_data():
            print(f"❌ 마이그레이션 실패. 백업에서 롤백하시겠습니까? (y/n): ", end="")
            if input().lower() == "y":
                self.rollback()
            return False
        print()

        # 6. 검증
        if not self.verify_migration():
            print(f"❌ 마이그레이션 실패. 백업에서 롤백하시겠습니까? (y/n): ", end="")
            if input().lower() == "y":
                self.rollback()
            return False
        print()

        print(f"=" * 70)
        print(f"✅ 마이그레이션 완료!")
        print(f"=" * 70)
        print(f"백업 파일: {self.backup_file}")
        print(f"Admin 계정:")
        print(f"  - 사용자명: {self.admin_username}")
        print(f"  - 비밀번호: {self.admin_password}")
        print(f"  - 이메일: {self.admin_email}")
        print(f"⚠️  보안을 위해 첫 로그인 후 비밀번호를 변경하세요!")
        print(f"=" * 70)

        return True


def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(
        description="폐쇄망 프로젝트 관리 시스템 v1.0 → v2.0 마이그레이션 도구"
    )
    parser.add_argument(
        "--db-path",
        type=str,
        default="../project_master.db",
        help="v1.0 데이터베이스 파일 경로 (기본: ../project_master.db)",
    )
    parser.add_argument(
        "--backup-path",
        type=str,
        default="../backups/",
        help="백업 파일 저장 경로 (기본: ../backups/)",
    )
    parser.add_argument(
        "--admin-username",
        type=str,
        default="admin",
        help="admin 사용자 이름 (기본: admin)",
    )
    parser.add_argument(
        "--admin-password",
        type=str,
        default="admin123",
        help="admin 비밀번호 (기본: admin123)",
    )
    parser.add_argument(
        "--admin-email",
        type=str,
        default="admin@localhost",
        help="admin 이메일 (기본: admin@localhost)",
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="마이그레이션 롤백 (백업에서 복원)",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="마이그레이션 검증만 수행",
    )

    args = parser.parse_args()

    # MigrationManager 인스턴스 생성
    manager = MigrationManager(
        db_path=args.db_path,
        backup_path=args.backup_path,
        admin_username=args.admin_username,
        admin_password=args.admin_password,
        admin_email=args.admin_email,
    )

    # 작업 실행
    if args.rollback:
        success = manager.rollback()
    elif args.verify:
        success = manager.verify_migration()
    else:
        success = manager.migrate()

    # 종료 코드 반환
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
