#!/usr/bin/env python
"""
샘플 데이터 생성 스크립트

데이터베이스에 테스트용 샘플 데이터를 생성합니다.
"""

import sys
from datetime import datetime, timedelta
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models import (
    CalendarEvent,
    Dependency,
    Enabler,
    EnablerImpact,
    Project,
    Task,
)


def clear_all_data(db: Session):
    """
    모든 데이터 삭제 (테스트용)

    Args:
        db: 데이터베이스 세션
    """
    print("\n기존 데이터 삭제 중...")
    db.query(CalendarEvent).delete()
    db.query(EnablerImpact).delete()
    db.query(Dependency).delete()
    db.query(Task).delete()
    db.query(Enabler).delete()
    db.query(Project).delete()
    db.commit()
    print("✅ 기존 데이터 삭제 완료")


def create_sample_project(db: Session) -> Project:
    """
    샘플 프로젝트 생성

    Args:
        db: 데이터베이스 세션

    Returns:
        Project: 생성된 프로젝트
    """
    print("\n[1/6] 프로젝트 생성 중...")

    project = Project(
        name="신규 시스템 구축 프로젝트",
        description="레거시 시스템을 현대화하고 클라우드 기반 아키텍처로 전환하는 프로젝트",
        start_date=datetime(2025, 1, 1),
        end_date=datetime(2025, 6, 30),
        status="in_progress",
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    print(f"✅ 프로젝트 생성 완료: {project.name} (ID: {project.id})")
    return project


def create_sample_tasks(db: Session, project: Project) -> list[Task]:
    """
    샘플 태스크 생성

    Args:
        db: 데이터베이스 세션
        project: 프로젝트

    Returns:
        list[Task]: 생성된 태스크 목록
    """
    print("\n[2/6] 태스크 생성 중...")

    tasks_data = [
        {
            "name": "요구사항 분석",
            "description": "비즈니스 요구사항 및 기술 요구사항 분석",
            "start_date": datetime(2025, 1, 1),
            "end_date": datetime(2025, 1, 14),
            "duration_days": 14,
            "progress": 100.0,
            "status": "completed",
            "priority": "critical",
            "assignee": "김팀장",
            "is_milestone": True,
            "color": "#4CAF50",
        },
        {
            "name": "시스템 설계",
            "description": "아키텍처 설계 및 데이터베이스 스키마 설계",
            "start_date": datetime(2025, 1, 15),
            "end_date": datetime(2025, 2, 14),
            "duration_days": 30,
            "progress": 80.0,
            "status": "in_progress",
            "priority": "high",
            "assignee": "이아키텍트",
            "is_milestone": False,
            "color": "#2196F3",
        },
        {
            "name": "백엔드 개발",
            "description": "API 서버 및 비즈니스 로직 개발",
            "start_date": datetime(2025, 2, 15),
            "end_date": datetime(2025, 4, 15),
            "duration_days": 60,
            "progress": 30.0,
            "status": "in_progress",
            "priority": "high",
            "assignee": "박개발",
            "is_milestone": False,
            "color": "#FF9800",
        },
        {
            "name": "프론트엔드 개발",
            "description": "사용자 인터페이스 개발",
            "start_date": datetime(2025, 3, 1),
            "end_date": datetime(2025, 4, 30),
            "duration_days": 60,
            "progress": 20.0,
            "status": "in_progress",
            "priority": "medium",
            "assignee": "최프론트",
            "is_milestone": False,
            "color": "#9C27B0",
        },
        {
            "name": "통합 테스트",
            "description": "시스템 통합 테스트 및 성능 테스트",
            "start_date": datetime(2025, 5, 1),
            "end_date": datetime(2025, 5, 31),
            "duration_days": 30,
            "progress": 0.0,
            "status": "not_started",
            "priority": "high",
            "assignee": "정QA",
            "is_milestone": False,
            "color": "#F44336",
        },
        {
            "name": "배포 및 운영 이관",
            "description": "프로덕션 환경 배포 및 운영팀 이관",
            "start_date": datetime(2025, 6, 1),
            "end_date": datetime(2025, 6, 30),
            "duration_days": 30,
            "progress": 0.0,
            "status": "not_started",
            "priority": "critical",
            "assignee": "강DevOps",
            "is_milestone": True,
            "color": "#607D8B",
        },
    ]

    tasks = []
    for task_data in tasks_data:
        task = Task(project_id=project.id, **task_data)
        db.add(task)
        tasks.append(task)

    db.commit()

    # Refresh all tasks to get their IDs
    for task in tasks:
        db.refresh(task)

    print(f"✅ 태스크 생성 완료: {len(tasks)}개")
    for task in tasks:
        print(f"   - {task.name} (ID: {task.id}, 진행률: {task.progress}%)")

    return tasks


def create_sample_dependencies(db: Session, tasks: list[Task]) -> list[Dependency]:
    """
    샘플 의존성 생성

    Args:
        db: 데이터베이스 세션
        tasks: 태스크 목록

    Returns:
        list[Dependency]: 생성된 의존성 목록
    """
    print("\n[3/6] 태스크 의존성 생성 중...")

    dependencies_data = [
        # 요구사항 분석 → 시스템 설계 (FS: Finish-Start)
        {
            "predecessor_task_id": tasks[0].id,
            "successor_task_id": tasks[1].id,
            "dependency_type": "FS",
            "lag_days": 0,
        },
        # 시스템 설계 → 백엔드 개발 (FS)
        {
            "predecessor_task_id": tasks[1].id,
            "successor_task_id": tasks[2].id,
            "dependency_type": "FS",
            "lag_days": 0,
        },
        # 시스템 설계 → 프론트엔드 개발 (FS, 2주 지연 시작)
        {
            "predecessor_task_id": tasks[1].id,
            "successor_task_id": tasks[3].id,
            "dependency_type": "FS",
            "lag_days": 14,
        },
        # 백엔드 개발 → 통합 테스트 (FS)
        {
            "predecessor_task_id": tasks[2].id,
            "successor_task_id": tasks[4].id,
            "dependency_type": "FS",
            "lag_days": 0,
        },
        # 프론트엔드 개발 → 통합 테스트 (FS)
        {
            "predecessor_task_id": tasks[3].id,
            "successor_task_id": tasks[4].id,
            "dependency_type": "FS",
            "lag_days": 0,
        },
        # 통합 테스트 → 배포 (FS)
        {
            "predecessor_task_id": tasks[4].id,
            "successor_task_id": tasks[5].id,
            "dependency_type": "FS",
            "lag_days": 0,
        },
    ]

    dependencies = []
    for dep_data in dependencies_data:
        dependency = Dependency(**dep_data)
        db.add(dependency)
        dependencies.append(dependency)

    db.commit()

    print(f"✅ 의존성 생성 완료: {len(dependencies)}개")
    for dep in dependencies:
        pred_task = next(t for t in tasks if t.id == dep.predecessor_task_id)
        succ_task = next(t for t in tasks if t.id == dep.successor_task_id)
        print(
            f"   - {pred_task.name} → {succ_task.name} "
            f"({dep.dependency_type}, lag: {dep.lag_days}일)"
        )

    return dependencies


def create_sample_enablers(db: Session, project: Project) -> list[Enabler]:
    """
    샘플 Key Enabler 생성

    Args:
        db: 데이터베이스 세션
        project: 프로젝트

    Returns:
        list[Enabler]: 생성된 Enabler 목록
    """
    print("\n[4/6] Key Enabler 생성 중...")

    enablers_data = [
        {
            "name": "클라우드 인프라 승인",
            "description": "AWS 계정 및 리소스 사용 승인",
            "type": "approval",
            "planned_delivery_date": datetime(2025, 1, 10),
            "actual_delivery_date": datetime(2025, 1, 8),
            "status": "delivered",
            "criticality": "critical",
            "responsible_person": "김부장",
            "notes": "예산 승인 완료, 계정 발급됨",
        },
        {
            "name": "개발 서버",
            "description": "개발 및 테스트용 서버 장비",
            "type": "equipment",
            "planned_delivery_date": datetime(2025, 2, 1),
            "actual_delivery_date": None,
            "status": "in_progress",
            "criticality": "high",
            "responsible_person": "이인프라",
            "notes": "구매 요청 완료, 납품 대기 중",
        },
        {
            "name": "보안 검토 문서",
            "description": "보안팀 검토 및 승인 문서",
            "type": "document",
            "planned_delivery_date": datetime(2025, 4, 1),
            "actual_delivery_date": None,
            "status": "requested",
            "criticality": "high",
            "responsible_person": "박보안",
            "notes": "보안팀에 검토 요청 예정",
        },
        {
            "name": "데이터베이스 라이선스",
            "description": "PostgreSQL Enterprise 라이선스",
            "type": "license",
            "planned_delivery_date": datetime(2025, 3, 1),
            "actual_delivery_date": None,
            "status": "in_progress",
            "criticality": "medium",
            "responsible_person": "최구매",
            "notes": "구매 절차 진행 중",
        },
        {
            "name": "운영팀 교육",
            "description": "시스템 운영 및 유지보수 교육",
            "type": "training",
            "planned_delivery_date": datetime(2025, 6, 15),
            "actual_delivery_date": None,
            "status": "requested",
            "criticality": "medium",
            "responsible_person": "정교육",
            "notes": "배포 2주 전 교육 예정",
        },
    ]

    enablers = []
    for enabler_data in enablers_data:
        enabler = Enabler(project_id=project.id, **enabler_data)
        db.add(enabler)
        enablers.append(enabler)

    db.commit()

    # Refresh all enablers
    for enabler in enablers:
        db.refresh(enabler)

    print(f"✅ Key Enabler 생성 완료: {len(enablers)}개")
    for enabler in enablers:
        print(f"   - {enabler.name} (상태: {enabler.status}, " f"중요도: {enabler.criticality})")

    return enablers


def create_sample_enabler_impacts(
    db: Session, enablers: list[Enabler], tasks: list[Task]
) -> list[EnablerImpact]:
    """
    샘플 Enabler 영향 관계 생성

    Args:
        db: 데이터베이스 세션
        enablers: Enabler 목록
        tasks: 태스크 목록

    Returns:
        list[EnablerImpact]: 생성된 영향 관계 목록
    """
    print("\n[5/6] Enabler 영향 관계 생성 중...")

    impacts_data = [
        # 클라우드 승인 → 시스템 설계 (blocking)
        {
            "enabler_id": enablers[0].id,
            "task_id": tasks[1].id,
            "impact_type": "blocking",
            "impact_description": "클라우드 인프라 승인 없이는 설계 진행 불가",
        },
        # 개발 서버 → 백엔드 개발 (required)
        {
            "enabler_id": enablers[1].id,
            "task_id": tasks[2].id,
            "impact_type": "required",
            "impact_description": "개발 서버 필수, 없으면 로컬 개발만 가능",
        },
        # 개발 서버 → 프론트엔드 개발 (required)
        {
            "enabler_id": enablers[1].id,
            "task_id": tasks[3].id,
            "impact_type": "required",
            "impact_description": "통합 테스트를 위한 개발 서버 필요",
        },
        # 보안 검토 → 배포 (blocking)
        {
            "enabler_id": enablers[2].id,
            "task_id": tasks[5].id,
            "impact_type": "blocking",
            "impact_description": "보안 검토 통과 없이는 프로덕션 배포 불가",
        },
        # DB 라이선스 → 백엔드 개발 (optional)
        {
            "enabler_id": enablers[3].id,
            "task_id": tasks[2].id,
            "impact_type": "optional",
            "impact_description": "개발 중에는 무료 버전 사용 가능",
        },
        # 운영팀 교육 → 배포 (required)
        {
            "enabler_id": enablers[4].id,
            "task_id": tasks[5].id,
            "impact_type": "required",
            "impact_description": "운영팀 교육 완료 후 이관 가능",
        },
    ]

    impacts = []
    for impact_data in impacts_data:
        impact = EnablerImpact(**impact_data)
        db.add(impact)
        impacts.append(impact)

    db.commit()

    print(f"✅ Enabler 영향 관계 생성 완료: {len(impacts)}개")
    for impact in impacts:
        enabler = next(e for e in enablers if e.id == impact.enabler_id)
        task = next(t for t in tasks if t.id == impact.task_id)
        print(f"   - {enabler.name} → {task.name} ({impact.impact_type})")

    return impacts


def create_sample_calendar_events(
    db: Session, project: Project, tasks: list[Task], enablers: list[Enabler]
) -> list[CalendarEvent]:
    """
    샘플 캘린더 이벤트 생성

    Args:
        db: 데이터베이스 세션
        project: 프로젝트
        tasks: 태스크 목록
        enablers: Enabler 목록

    Returns:
        list[CalendarEvent]: 생성된 이벤트 목록
    """
    print("\n[6/6] 캘린더 이벤트 생성 중...")

    events_data = [
        # 프로젝트 킥오프 미팅
        {
            "project_id": project.id,
            "task_id": None,
            "enabler_id": None,
            "event_type": "meeting",
            "title": "프로젝트 킥오프 미팅",
            "description": "전체 팀원 참석, 프로젝트 목표 및 일정 공유",
            "event_date": datetime(2025, 1, 2, 10, 0),
            "all_day": False,
            "start_time": datetime(2025, 1, 2, 10, 0).time(),
            "end_time": datetime(2025, 1, 2, 12, 0).time(),
            "color": "#1976D2",
        },
        # 요구사항 분석 마일스톤
        {
            "project_id": project.id,
            "task_id": tasks[0].id,
            "enabler_id": None,
            "event_type": "milestone",
            "title": "요구사항 분석 완료",
            "description": "요구사항 문서 최종 승인",
            "event_date": datetime(2025, 1, 14),
            "all_day": True,
            "start_time": None,
            "end_time": None,
            "color": "#4CAF50",
        },
        # 클라우드 승인 Enabler 전달
        {
            "project_id": project.id,
            "task_id": None,
            "enabler_id": enablers[0].id,
            "event_type": "enabler_delivery",
            "title": "클라우드 인프라 승인 완료",
            "description": "AWS 계정 발급 및 권한 부여 완료",
            "event_date": datetime(2025, 1, 8),
            "all_day": True,
            "start_time": None,
            "end_time": None,
            "color": "#FF9800",
        },
        # 설계 리뷰 미팅
        {
            "project_id": project.id,
            "task_id": tasks[1].id,
            "enabler_id": None,
            "event_type": "review",
            "title": "시스템 설계 리뷰",
            "description": "아키텍처 및 DB 스키마 검토",
            "event_date": datetime(2025, 2, 10, 14, 0),
            "all_day": False,
            "start_time": datetime(2025, 2, 10, 14, 0).time(),
            "end_time": datetime(2025, 2, 10, 17, 0).time(),
            "color": "#9C27B0",
        },
        # 통합 테스트 시작
        {
            "project_id": project.id,
            "task_id": tasks[4].id,
            "enabler_id": None,
            "event_type": "task_start",
            "title": "통합 테스트 시작",
            "description": "시스템 통합 테스트 개시",
            "event_date": datetime(2025, 5, 1),
            "all_day": True,
            "start_time": None,
            "end_time": None,
            "color": "#F44336",
        },
        # 배포 마일스톤
        {
            "project_id": project.id,
            "task_id": tasks[5].id,
            "enabler_id": None,
            "event_type": "milestone",
            "title": "프로덕션 배포 완료",
            "description": "시스템 정식 오픈",
            "event_date": datetime(2025, 6, 30),
            "all_day": True,
            "start_time": None,
            "end_time": None,
            "color": "#607D8B",
        },
    ]

    events = []
    for event_data in events_data:
        event = CalendarEvent(**event_data)
        db.add(event)
        events.append(event)

    db.commit()

    print(f"✅ 캘린더 이벤트 생성 완료: {len(events)}개")
    for event in events:
        print(f"   - {event.title} ({event.event_type}, {event.event_date.date()})")

    return events


def main():
    """메인 함수"""
    print("=" * 60)
    print("샘플 데이터 생성 시작")
    print("=" * 60)

    db = SessionLocal()

    try:
        # 기존 데이터 삭제 여부 확인
        print("\n⚠️  경고: 기존 데이터가 모두 삭제됩니다!")
        response = input("계속하시겠습니까? (y/N): ")

        if response.lower() != "y":
            print("작업이 취소되었습니다.")
            return

        # 기존 데이터 삭제
        clear_all_data(db)

        # 샘플 데이터 생성
        project = create_sample_project(db)
        tasks = create_sample_tasks(db, project)
        dependencies = create_sample_dependencies(db, tasks)
        enablers = create_sample_enablers(db, project)
        impacts = create_sample_enabler_impacts(db, enablers, tasks)
        events = create_sample_calendar_events(db, project, tasks, enablers)

        print("\n" + "=" * 60)
        print("✅ 샘플 데이터 생성 완료!")
        print("=" * 60)

        print("\n📊 생성된 데이터 요약:")
        print(f"   - 프로젝트: 1개")
        print(f"   - 태스크: {len(tasks)}개")
        print(f"   - 의존성: {len(dependencies)}개")
        print(f"   - Key Enabler: {len(enablers)}개")
        print(f"   - Enabler 영향: {len(impacts)}개")
        print(f"   - 캘린더 이벤트: {len(events)}개")

        print("\n다음 단계:")
        print("   1. FastAPI 서버 실행: uvicorn app.main:app --reload")
        print("   2. Swagger UI 접속: http://localhost:8000/docs")
        print("   3. API를 통해 데이터 조회 및 수정")

    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
