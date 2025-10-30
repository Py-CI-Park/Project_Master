"""
Gantt Service Tests

Gantt 차트 데이터 생성 서비스 테스트
"""

from datetime import date, timedelta

import pytest

from app.services.gantt_service import generate_gantt_data, get_gantt_view_data


class TestGanttDataGeneration:
    """Gantt 데이터 생성 테스트"""

    def test_generate_gantt_data(
        self, db_session, sample_project, sample_tasks, sample_dependencies, sample_enablers
    ):
        """Gantt 차트 데이터 생성 테스트"""
        result = generate_gantt_data(sample_project.id, db_session)

        assert result.project_id == sample_project.id
        assert result.project_name == sample_project.name
        assert len(result.tasks) == 5
        assert len(result.markers) == 3  # Enabler 마커
        assert len(result.dependencies) == 4

    def test_gantt_task_format(
        self, db_session, sample_project, sample_tasks, sample_dependencies
    ):
        """Gantt 태스크 형식 검증"""
        result = generate_gantt_data(sample_project.id, db_session, include_markers=False)

        task = result.tasks[0]

        # Frappe Gantt 형식 검증
        assert task.id.startswith("task-")
        assert task.name is not None
        assert task.start is not None  # ISO 8601 형식
        assert task.end is not None
        assert 0 <= task.progress <= 100
        assert task.task_id == sample_tasks[0].id

    def test_gantt_dependencies_format(
        self, db_session, sample_project, sample_tasks, sample_dependencies
    ):
        """Gantt 의존성 형식 검증"""
        result = generate_gantt_data(sample_project.id, db_session, include_markers=False)

        # 태스크 1 → 태스크 2 의존성
        task1_gantt = next(t for t in result.tasks if t.task_id == sample_tasks[0].id)

        # dependencies 문자열이 올바른지 확인 (Frappe Gantt 형식)
        # task1은 선행이므로 dependencies가 비어있어야 함
        assert task1_gantt.dependencies == ""

        # task2는 task1에 의존
        task2_gantt = next(t for t in result.tasks if t.task_id == sample_tasks[1].id)
        assert f"task-{sample_tasks[0].id}" in task2_gantt.dependencies

    def test_gantt_markers(
        self, db_session, sample_project, sample_enablers
    ):
        """Gantt 마커 생성 테스트"""
        result = generate_gantt_data(sample_project.id, db_session, include_markers=True)

        assert len(result.markers) == 3

        marker = result.markers[0]
        assert marker.id.startswith("marker-")
        assert marker.marker_type == "enabler"
        assert marker.enabler_id is not None
        assert marker.date is not None

    def test_project_not_found(self, db_session):
        """존재하지 않는 프로젝트 오류 테스트"""
        with pytest.raises(ValueError, match="프로젝트 ID .* 찾을 수 없습니다"):
            generate_gantt_data(99999, db_session)


class TestGanttViewData:
    """Gantt 뷰 데이터 테스트"""

    def test_view_mode_setting(
        self, db_session, sample_project, sample_tasks, sample_dependencies
    ):
        """뷰 모드 설정 테스트"""
        result = get_gantt_view_data(
            sample_project.id, db_session, view_mode="Week"
        )

        assert result.view_mode == "Week"

    def test_invalid_view_mode(
        self, db_session, sample_project
    ):
        """잘못된 뷰 모드 오류 테스트"""
        with pytest.raises(ValueError, match="view_mode"):
            get_gantt_view_data(
                sample_project.id, db_session, view_mode="Invalid"
            )

    def test_date_range_filtering(
        self, db_session, sample_project, sample_tasks, sample_dependencies
    ):
        """날짜 범위 필터링 테스트"""
        # 태스크 1과 2만 포함되는 날짜 범위 설정
        start_filter = date.today()
        end_filter = date.today() + timedelta(days=10)

        result = get_gantt_view_data(
            sample_project.id,
            db_session,
            view_mode="Day",
            date_range={"start": start_filter.isoformat(), "end": end_filter.isoformat()},
        )

        # 필터링된 태스크 수 확인
        assert len(result.tasks) <= 5
        # 모든 태스크가 날짜 범위 내에 있는지 확인
        for task in result.tasks:
            task_start = date.fromisoformat(task.start)
            task_end = date.fromisoformat(task.end)
            # 태스크가 필터 범위와 겹치는지 확인
            assert task_end >= start_filter and task_start <= end_filter
