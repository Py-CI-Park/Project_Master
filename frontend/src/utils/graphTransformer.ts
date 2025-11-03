/**
 * Graph Data Transformer
 *
 * Task 데이터를 React-Flow 그래프 형식으로 변환
 */

import type { Task } from '../types';
import type {
  GraphNode,
  GraphEdge,
  GraphNodeData,
  LayoutOptions,
  DependencyMatrixRow,
  DependencyMatrixCell,
} from '../types/graph';
import { GRAPH_NODE_STATUS_CLASSES, GRAPH_NODE_PRIORITY_CLASSES } from '../types/graph';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

/**
 * Task 배열을 GraphNode 및 GraphEdge 배열로 변환
 *
 * @param tasks - 변환할 Task 배열
 * @returns { nodes, edges } - 그래프 노드 및 엣지
 */
export const transformTasksToGraph = (
  tasks: Task[]
): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes: GraphNode[] = tasks.map((task) => {
    const statusClass = GRAPH_NODE_STATUS_CLASSES[task.status] || '';
    const priorityClass = GRAPH_NODE_PRIORITY_CLASSES[task.priority] || '';

    // 기간 계산 (일 단위)
    const duration = calculateDuration(task.start_date, task.end_date);

    const data: GraphNodeData = {
      label: task.name,
      taskId: task.id,
      status: task.status,
      priority: task.priority,
      progress: task.progress || 0,
      startDate: task.start_date,
      endDate: task.end_date,
      duration,
    };

    return {
      id: task.id.toString(),
      type: 'custom', // 커스텀 노드 타입 사용
      position: { x: 0, y: 0 }, // 레이아웃 후 위치 결정
      data,
      className: `${statusClass} ${priorityClass}`.trim(),
    };
  });

  const edges: GraphEdge[] = [];
  tasks.forEach((task) => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach((depId) => {
        edges.push({
          id: `e${depId}-${task.id}`,
          source: depId.toString(),
          target: task.id.toString(),
          type: 'smoothstep',
          animated: false,
          data: {
            dependencyType: 'FS', // 기본값: Finish-to-Start
          },
        });
      });
    }
  });

  return { nodes, edges };
};

/**
 * 날짜 간 기간 계산 (일 단위)
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns 기간 (일)
 */
const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * ELK 레이아웃 적용
 *
 * @param nodes - 그래프 노드 배열
 * @param edges - 그래프 엣지 배열
 * @param options - 레이아웃 옵션
 * @returns 레이아웃이 적용된 노드 배열
 */
export const applyElkLayout = async (
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: LayoutOptions = {}
): Promise<GraphNode[]> => {
  const { direction = 'LR', nodeSpacing = 80, levelSpacing = 120 } = options;

  // ELK 그래프 구조로 변환
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': nodeSpacing.toString(),
      'elk.layered.spacing.nodeNodeBetweenLayers': levelSpacing.toString(),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: 180, // 노드 너비
      height: 80, // 노드 높이
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  // ELK 레이아웃 계산
  const layout = await elk.layout(elkGraph);

  // 노드 위치 업데이트
  const layoutedNodes = nodes.map((node) => {
    const elkNode = layout.children?.find((n) => n.id === node.id);
    if (elkNode) {
      return {
        ...node,
        position: {
          x: elkNode.x || 0,
          y: elkNode.y || 0,
        },
      };
    }
    return node;
  });

  return layoutedNodes;
};

/**
 * 의존성 매트릭스 생성
 *
 * @param tasks - Task 배열
 * @returns 의존성 매트릭스 행 배열
 */
export const createDependencyMatrix = (tasks: Task[]): DependencyMatrixRow[] => {
  return tasks.map((task) => {
    const dependencies: DependencyMatrixCell[] = [];

    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach((depId) => {
        dependencies.push({
          sourceTaskId: depId,
          targetTaskId: task.id,
          dependencyType: 'FS',
        });
      });
    }

    return {
      taskId: task.id,
      taskName: task.name,
      dependencies,
    };
  });
};

/**
 * 순환 의존성 감지
 *
 * @param tasks - Task 배열
 * @returns 순환 의존성이 있는 태스크 ID 배열
 */
export const detectCircularDependencies = (tasks: Task[]): number[] => {
  const visited = new Set<number>();
  const recursionStack = new Set<number>();
  const circularTasks = new Set<number>();

  const hasCycle = (taskId: number, taskMap: Map<number, Task>): boolean => {
    visited.add(taskId);
    recursionStack.add(taskId);

    const task = taskMap.get(taskId);
    if (task && task.dependencies) {
      for (const depId of task.dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId, taskMap)) {
            circularTasks.add(taskId);
            return true;
          }
        } else if (recursionStack.has(depId)) {
          circularTasks.add(taskId);
          circularTasks.add(depId);
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  };

  const taskMap = new Map(tasks.map((task) => [task.id, task]));

  tasks.forEach((task) => {
    if (!visited.has(task.id)) {
      hasCycle(task.id, taskMap);
    }
  });

  return Array.from(circularTasks);
};

/**
 * 크리티컬 패스 계산 (간단한 버전)
 *
 * @param tasks - Task 배열
 * @returns 크리티컬 패스에 속한 태스크 ID 배열
 */
export const calculateCriticalPath = (tasks: Task[]): number[] => {
  // 간단한 구현: 가장 긴 의존성 체인을 찾음
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const pathLengths = new Map<number, number>();

  const calculatePathLength = (taskId: number): number => {
    if (pathLengths.has(taskId)) {
      return pathLengths.get(taskId)!;
    }

    const task = taskMap.get(taskId);
    if (!task) return 0;

    const duration = calculateDuration(task.start_date, task.end_date);

    if (!task.dependencies || task.dependencies.length === 0) {
      pathLengths.set(taskId, duration);
      return duration;
    }

    const maxDependencyLength = Math.max(
      ...task.dependencies.map((depId) => calculatePathLength(depId))
    );

    const totalLength = duration + maxDependencyLength;
    pathLengths.set(taskId, totalLength);
    return totalLength;
  };

  // 모든 태스크의 경로 길이 계산
  tasks.forEach((task) => calculatePathLength(task.id));

  // 가장 긴 경로 찾기
  const maxLength = Math.max(...Array.from(pathLengths.values()));

  // 크리티컬 패스 추적
  const criticalPath: number[] = [];
  const tracePath = (taskId: number, targetLength: number) => {
    const task = taskMap.get(taskId);
    if (!task) return;

    const duration = calculateDuration(task.start_date, task.end_date);
    criticalPath.push(taskId);

    if (task.dependencies && task.dependencies.length > 0) {
      const criticalDep = task.dependencies.find((depId) => {
        const depLength = pathLengths.get(depId) || 0;
        return depLength + duration === targetLength;
      });

      if (criticalDep) {
        tracePath(criticalDep, targetLength - duration);
      }
    }
  };

  // 최대 길이를 가진 태스크에서 시작
  const startTask = Array.from(pathLengths.entries()).find(
    ([, length]) => length === maxLength
  );

  if (startTask) {
    tracePath(startTask[0], maxLength);
  }

  return criticalPath;
};
