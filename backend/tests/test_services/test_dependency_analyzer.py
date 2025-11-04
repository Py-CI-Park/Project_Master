"""
Dependency Analyzer Service Tests

의존성 분석 서비스 테스트
"""

import pytest

from app.models.dependency import Dependency
from app.services.dependency_analyzer import (
    analyze_task_impact,
    check_circular_dependency,
    generate_dependency_graph,
    get_dependency_chain,
)


class TestDependencyGraph:
    """의존성 그래프 생성 테스트"""

    def test_generate_dependency_graph(
        self, db_session, sample_project, sample_tasks, sample_dependencies
    ):
        """의존성 그래프 생성 테스트"""
        result = generate_dependency_graph(sample_project.id, db_session)

        assert result.project_id == sample_project.id
        assert len(result.nodes) == 5
        assert len(result.edges) == 4

        # 각 노드가 올바른 선행/후속 태스크 정보를 가지고 있는지 확인
        node_dict = {node.task_id: node for node in result.nodes}

        # 태스크 1 → 태스크 2
        assert sample_tasks[1].id in node_dict[sample_tasks[0].id].successors
        assert sample_tasks[0].id in node_dict[sample_tasks[1].id].predecessors


class TestCircularDependency:
    """순환 의존성 검증 테스트"""

    def test_no_circular_dependency(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """순환이 없는 경우 테스트"""
        # 태스크 1 → 태스크 3 추가 (순환 없음)
        result = check_circular_dependency(
            sample_tasks[0].id, sample_tasks[2].id, db_session
        )

        assert result.has_circular is False
        assert len(result.circular_path) == 0

    def test_circular_dependency_detected(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """순환이 발생하는 경우 테스트"""
        # 태스크 4 → 태스크 1 추가 (순환 발생)
        result = check_circular_dependency(
            sample_tasks[4].id, sample_tasks[0].id, db_session
        )

        assert result.has_circular is True
        assert len(result.circular_path) > 0
        assert "순환 의존성이 감지되었습니다" in result.error_message


class TestImpactAnalysis:
    """영향 분석 테스트"""

    def test_analyze_task_impact(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """태스크 변경 영향 분석 테스트"""
        # 태스크 1 변경 시 영향받는 태스크 분석
        result = analyze_task_impact(sample_tasks[0].id, db_session)

        assert result.source_task_id == sample_tasks[0].id
        assert len(result.impacted_tasks) > 0

        # 후속 태스크들이 영향받는지 확인
        impacted_ids = [task["task_id"] for task in result.impacted_tasks]
        assert sample_tasks[1].id in impacted_ids  # 태스크 2
        assert sample_tasks[2].id in impacted_ids  # 태스크 3

    def test_impact_depth_calculation(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """영향 깊이 계산 테스트"""
        result = analyze_task_impact(sample_tasks[0].id, db_session)

        # 영향 깊이가 올바르게 계산되는지 확인
        assert sample_tasks[1].id in result.impact_depth
        assert result.impact_depth[sample_tasks[1].id] == 1  # 1단계
        assert result.impact_depth[sample_tasks[2].id] == 2  # 2단계

    def test_task_not_found(self, db_session):
        """존재하지 않는 태스크 오류 테스트"""
        with pytest.raises(ValueError, match="태스크 ID .* 찾을 수 없습니다"):
            analyze_task_impact(99999, db_session)


class TestDependencyChain:
    """의존성 체인 조회 테스트"""

    def test_get_forward_chain(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """후속 태스크 체인 조회 테스트"""
        chain = get_dependency_chain(
            sample_tasks[0].id, db_session, direction="forward"
        )

        assert sample_tasks[0].id in chain
        assert sample_tasks[1].id in chain  # 후속 태스크
        assert len(chain) >= 2

    def test_get_backward_chain(
        self, db_session, sample_tasks, sample_dependencies
    ):
        """선행 태스크 체인 조회 테스트"""
        chain = get_dependency_chain(
            sample_tasks[2].id, db_session, direction="backward"
        )

        assert sample_tasks[2].id in chain
        assert sample_tasks[1].id in chain  # 선행 태스크
        assert sample_tasks[0].id in chain  # 선행의 선행 태스크
