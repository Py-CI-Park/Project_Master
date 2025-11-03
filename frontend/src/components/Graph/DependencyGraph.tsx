/**
 * DependencyGraph Component
 *
 * React-Flow 기반 의존성 그래프 컴포넌트
 * React.memo로 최적화됨
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography, Alert } from '@mui/material';
import CustomNode from './CustomNode';
import type { Task } from '../../types';
import type { GraphNode, GraphEdge, LayoutOptions } from '../../types/graph';
import {
  transformTasksToGraph,
  applyElkLayout,
  calculateCriticalPath,
  detectCircularDependencies,
} from '../../utils/graphTransformer';

export interface DependencyGraphProps {
  tasks: Task[];
  onNodeClick?: (taskId: number) => void;
  showCriticalPath?: boolean;
}

const DependencyGraph = ({ tasks, onNodeClick, showCriticalPath = true }: DependencyGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<GraphNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<GraphEdge>([]);
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [circularDeps, setCircularDeps] = useState<number[]>([]);

  // 커스텀 노드 타입 정의
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // 그래프 데이터 초기화 및 레이아웃 적용
  useEffect(() => {
    if (tasks.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const initializeGraph = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 순환 의존성 감지
        const circular = detectCircularDependencies(tasks);
        setCircularDeps(circular);

        // 크리티컬 패스 계산
        const criticalPathTasks = showCriticalPath ? calculateCriticalPath(tasks) : [];

        // Task → Graph 변환
        const { nodes: graphNodes, edges: graphEdges } = transformTasksToGraph(tasks);

        // 크리티컬 패스 표시
        const nodesWithCriticalPath = graphNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isCriticalPath: criticalPathTasks.includes(node.data.taskId),
          },
        }));

        const edgesWithCriticalPath = graphEdges.map((edge) => ({
          ...edge,
          animated: criticalPathTasks.includes(Number(edge.source)) && criticalPathTasks.includes(Number(edge.target)),
          style: {
            ...edge.style,
            strokeWidth: criticalPathTasks.includes(Number(edge.source)) && criticalPathTasks.includes(Number(edge.target)) ? 3 : 2,
            stroke: criticalPathTasks.includes(Number(edge.source)) && criticalPathTasks.includes(Number(edge.target)) ? '#ff9800' : '#b1b1b7',
          },
        }));

        // ELK 레이아웃 적용
        const layoutOptions: LayoutOptions = {
          direction: layoutDirection,
          nodeSpacing: 80,
          levelSpacing: 120,
        };

        const layoutedNodes = await applyElkLayout(
          nodesWithCriticalPath,
          edgesWithCriticalPath,
          layoutOptions
        );

        setNodes(layoutedNodes);
        setEdges(edgesWithCriticalPath);
      } catch (err) {
        console.error('Failed to initialize graph:', err);
        setError('그래프를 초기화하는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGraph();
  }, [tasks, layoutDirection, showCriticalPath]);

  // 레이아웃 방향 변경
  const handleLayoutChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDirection: 'LR' | 'TB' | null
  ) => {
    if (newDirection !== null) {
      setLayoutDirection(newDirection);
    }
  };

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: GraphNode) => {
      if (onNodeClick) {
        onNodeClick(node.data.taskId);
      }
    },
    [onNodeClick]
  );

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">표시할 태스크가 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '600px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">의존성 그래프</Typography>
        <ToggleButtonGroup
          value={layoutDirection}
          exclusive
          onChange={handleLayoutChange}
          size="small"
        >
          <ToggleButton value="LR">가로</ToggleButton>
          <ToggleButton value="TB">세로</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 순환 의존성 경고 */}
      {circularDeps.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          순환 의존성이 감지되었습니다. 태스크 ID: {circularDeps.join(', ')}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* React Flow */}
      <Box sx={{ height: 'calc(100% - 80px)', border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange as OnNodesChange}
          onEdgesChange={onEdgesChange as OnEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
          }}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as GraphNode['data'];
              const statusColors: Record<string, string> = {
                not_started: '#9e9e9e',
                in_progress: '#2196f3',
                completed: '#4caf50',
                on_hold: '#ff9800',
                cancelled: '#f44336',
              };
              return statusColors[data.status] || '#1976d2';
            }}
          />
        </ReactFlow>
      </Box>

      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <Typography>레이아웃 계산 중...</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default memo(DependencyGraph);
