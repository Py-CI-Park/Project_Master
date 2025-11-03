/**
 * Dependency Graph Types
 *
 * React-Flow 기반 의존성 그래프 타입 정의
 */

import type { Node, Edge } from '@xyflow/react';
import type { Task } from './task';

/**
 * 그래프 노드 데이터
 */
export interface GraphNodeData {
  label: string;
  taskId: number;
  status: Task['status'];
  priority: Task['priority'];
  progress: number;
  startDate: string;
  endDate: string;
  assignedTo?: string;
  duration?: number; // 일 단위
  isCriticalPath?: boolean;
}

/**
 * 그래프 노드 타입
 */
export type GraphNode = Node<GraphNodeData>;

/**
 * 그래프 엣지 데이터
 */
export interface GraphEdgeData {
  dependencyType?: 'FS' | 'SS' | 'FF' | 'SF'; // Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish
  lag?: number; // 지연 시간 (일)
  isCriticalPath?: boolean;
}

/**
 * 그래프 엣지 타입
 */
export type GraphEdge = Edge<GraphEdgeData>;

/**
 * 레이아웃 옵션
 */
export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL'; // Top-Bottom, Left-Right, Bottom-Top, Right-Left
  nodeSpacing?: number;
  levelSpacing?: number;
  edgeSpacing?: number;
}

/**
 * 의존성 매트릭스 셀
 */
export interface DependencyMatrixCell {
  sourceTaskId: number;
  targetTaskId: number;
  dependencyType?: 'FS' | 'SS' | 'FF' | 'SF';
  lag?: number;
  isCircular?: boolean; // 순환 의존성 여부
}

/**
 * 의존성 매트릭스 행
 */
export interface DependencyMatrixRow {
  taskId: number;
  taskName: string;
  dependencies: DependencyMatrixCell[];
}

/**
 * 상태별 노드 스타일 클래스
 */
export const GRAPH_NODE_STATUS_CLASSES: Record<string, string> = {
  not_started: 'graph-node-not-started',
  in_progress: 'graph-node-in-progress',
  completed: 'graph-node-completed',
  on_hold: 'graph-node-on-hold',
  cancelled: 'graph-node-cancelled',
};

/**
 * 우선순위별 노드 스타일 클래스
 */
export const GRAPH_NODE_PRIORITY_CLASSES: Record<string, string> = {
  low: 'graph-node-priority-low',
  medium: 'graph-node-priority-medium',
  high: 'graph-node-priority-high',
  urgent: 'graph-node-priority-urgent',
};

/**
 * 크리티컬 패스 스타일 클래스
 */
export const CRITICAL_PATH_CLASS = 'critical-path';
