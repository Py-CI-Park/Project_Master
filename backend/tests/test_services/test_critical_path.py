"""
Critical Path Service Tests

크리티컬 패스 계산 서비스 테스트
"""

import pytest

from app.services.critical_path import calculate_critical_path


class TestCriticalPathCalculation:
    """크리티컬 패스 계산 테스트"""

    def test_calculate_critical_path_simple(
        self, db_session, sample_project, sample_tasks, sample_dependencies
    ):
        """간단한 순차적 태스크 구조의 크리티컬 패스 계산"""
        result = calculate_critical_path(sample_project.id, db_session)

        assert result.project_id == sample_project.id
        assert result.has_circular_dependency is False
        assert len(result.tasks) == 5
        assert len(result.critical_path) > 0

        # 모든 태스크가 크리티컬 패스에 포함되어야 함 (순차 구조)
        assert all(task.task_id in result.critical_path for task in result.tasks)

    def test_calculate_critical_path_complex(
        self, db_session, sample_project, complex_task_graph
    ):
        """복잡한 태스크 그래프의 크리티컬 패스 계산"""
        tasks, dependencies = complex_task_graph

        result = calculate_critical_path(sample_project.id, db_session)

        assert result.project_id == sample_project.id
        assert result.has_circular_dependency is False
        assert len(result.tasks) == 6
        assert len(result.critical_path) > 0

        # 크리티컬 패스 검증 (B → D → E → F)
        task_names = {task.id: task.name for task in tasks}
        critical_names = [task_names[tid] for tid in result.critical_path]

        # B, D, E, F가 크리티컬 패스에 포함되어야 함
        assert "Task B" in critical_names
        assert "Task D" in critical_names
        assert "Task E" in critical_names
        assert "Task F" in critical_names

    def test_slack_calculation(
        self, db_session, sample_project, complex_task_graph
    ):
        """여유 시간 (Slack) 계산 테스트"""
        tasks, dependencies = complex_task_graph

        result = calculate_critical_path(sample_project.id, db_session)

        # 크리티컬 패스의 태스크들은 Slack이 0이어야 함
        for task_schedule in result.tasks:
            if task_schedule.task_id in result.critical_path:
                assert task_schedule.total_slack == 0

    def test_project_not_found(self, db_session):
        """존재하지 않는 프로젝트 오류 테스트"""
        with pytest.raises(ValueError, match="프로젝트 ID .* 찾을 수 없습니다"):
            calculate_critical_path(99999, db_session)

    def test_empty_project(self, db_session, sample_project):
        """태스크가 없는 프로젝트 오류 테스트"""
        with pytest.raises(ValueError, match="태스크가 없습니다"):
            calculate_critical_path(sample_project.id, db_session)
