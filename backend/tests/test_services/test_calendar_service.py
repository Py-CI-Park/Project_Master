"""
Calendar Service Tests

캘린더 서비스 테스트
"""

from datetime import date, timedelta

import pytest

from app.services.calendar_service import (
    generate_calendar_events,
    get_events_by_date_range,
    get_events_by_month,
)


class TestCalendarEventGeneration:
    """캘린더 이벤트 생성 테스트"""

    def test_generate_calendar_events(
        self, db_session, sample_project, sample_tasks, sample_enablers
    ):
        """캘린더 이벤트 생성 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        assert result.project_id == sample_project.id
        assert result.project_name == sample_project.name
        assert len(result.events) > 0

        # 태스크 이벤트 + Enabler 이벤트
        # 태스크 5개 (마일스톤 1개, 일반 4개) = 1 + 4*2 = 9개
        # Enabler 3개
        expected_events = 9 + 3
        assert len(result.events) == expected_events

    def test_task_start_end_events(
        self, db_session, sample_project, sample_tasks
    ):
        """태스크 시작/종료 이벤트 생성 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        # 일반 태스크 (마일스톤 제외) 이벤트 확인
        task_events = [e for e in result.events if e.task_id == sample_tasks[0].id]

        assert len(task_events) == 2  # 시작 + 종료
        assert any(e.event_type == "task_start" for e in task_events)
        assert any(e.event_type == "task_end" for e in task_events)

    def test_milestone_event(
        self, db_session, sample_project, sample_tasks
    ):
        """마일스톤 이벤트 생성 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        # 마일스톤 이벤트 확인
        milestone_events = [
            e for e in result.events if e.event_type == "milestone"
        ]

        assert len(milestone_events) == 1
        milestone_event = milestone_events[0]
        assert milestone_event.title.startswith("🎯")
        assert milestone_event.task_id == sample_tasks[3].id  # 마일스톤 1

    def test_enabler_delivery_event(
        self, db_session, sample_project, sample_enablers
    ):
        """Enabler 전달 일정 이벤트 생성 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        # Enabler 이벤트 확인
        enabler_events = [
            e for e in result.events if e.event_type == "enabler_delivery"
        ]

        assert len(enabler_events) == 3
        assert all(e.title.startswith("📦") for e in enabler_events)
        assert all(e.enabler_id is not None for e in enabler_events)

    def test_project_not_found(self, db_session):
        """존재하지 않는 프로젝트 오류 테스트"""
        with pytest.raises(ValueError, match="프로젝트 ID .* 찾을 수 없습니다"):
            generate_calendar_events(99999, db_session)


class TestEventDateFiltering:
    """이벤트 날짜 필터링 테스트"""

    def test_get_events_by_date_range(
        self, db_session, sample_project, sample_tasks, sample_enablers
    ):
        """날짜 범위 조회 테스트"""
        start = date.today()
        end = date.today() + timedelta(days=10)

        events = get_events_by_date_range(
            sample_project.id, db_session, start, end
        )

        # 모든 이벤트가 날짜 범위 내에 있는지 확인
        for event in events:
            event_date = date.fromisoformat(event.date)
            assert start <= event_date <= end

    def test_invalid_date_range(
        self, db_session, sample_project
    ):
        """잘못된 날짜 범위 오류 테스트"""
        start = date.today() + timedelta(days=10)
        end = date.today()

        with pytest.raises(ValueError, match="시작일은 종료일보다 이전이어야 합니다"):
            get_events_by_date_range(sample_project.id, db_session, start, end)

    def test_get_events_by_month(
        self, db_session, sample_project, sample_tasks, sample_enablers
    ):
        """월별 이벤트 조회 테스트"""
        today = date.today()
        events = get_events_by_month(
            sample_project.id, db_session, today.year, today.month
        )

        # 해당 월의 이벤트만 반환되는지 확인
        for event in events:
            event_date = date.fromisoformat(event.date)
            assert event_date.year == today.year
            assert event_date.month == today.month

    def test_invalid_month(
        self, db_session, sample_project
    ):
        """잘못된 월 오류 테스트"""
        with pytest.raises(ValueError, match="월은 1-12 사이여야 합니다"):
            get_events_by_month(sample_project.id, db_session, 2025, 13)


class TestEventFormatting:
    """이벤트 형식 테스트"""

    def test_event_color_assignment(
        self, db_session, sample_project, sample_tasks
    ):
        """이벤트 색상 할당 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        # 모든 이벤트가 색상 정보를 가지고 있는지 확인
        for event in result.events:
            assert event.color is not None
            assert event.color.startswith("#")  # HEX 형식

    def test_event_all_day_flag(
        self, db_session, sample_project, sample_tasks
    ):
        """이벤트 종일 플래그 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        # 모든 이벤트가 all_day 플래그를 가지고 있는지 확인
        for event in result.events:
            assert event.all_day is True

    def test_event_iso_date_format(
        self, db_session, sample_project, sample_tasks
    ):
        """이벤트 날짜 ISO 8601 형식 테스트"""
        result = generate_calendar_events(sample_project.id, db_session)

        # 모든 이벤트 날짜가 ISO 8601 형식인지 확인
        for event in result.events:
            # 파싱 가능한지 확인
            event_date = date.fromisoformat(event.date)
            assert isinstance(event_date, date)
