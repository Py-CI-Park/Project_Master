/**
 * CustomNode Component
 *
 * 의존성 그래프의 커스텀 노드 컴포넌트
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Box, Typography, LinearProgress } from '@mui/material';
import type { GraphNodeData } from '../../types/graph';

const CustomNode = ({ data }: NodeProps) => {
  const { label, status, priority, progress, duration, isCriticalPath } = data as GraphNodeData;

  // 상태별 색상
  const statusColors: Record<string, string> = {
    not_started: '#9e9e9e',
    in_progress: '#2196f3',
    completed: '#4caf50',
    on_hold: '#ff9800',
    cancelled: '#f44336',
  };

  // 우선순위별 테두리 스타일
  const priorityBorderWidth: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 3,
  };

  const backgroundColor = statusColors[status] || '#1976d2';
  const borderWidth = priorityBorderWidth[priority] || 2;
  const isCritical = priority === 'critical';

  return (
    <Box
      sx={{
        width: 180,
        backgroundColor: '#fff',
        border: `${borderWidth}px solid ${backgroundColor}`,
        borderRadius: 1,
        boxShadow: isCriticalPath ? '0 0 10px rgba(255, 165, 0, 0.8)' : 2,
        overflow: 'hidden',
        animation: isCritical ? 'pulse 2s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.7,
          },
        },
      }}
    >
      {/* 상단 헤더 */}
      <Box
        sx={{
          backgroundColor,
          color: '#fff',
          padding: '6px 10px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Box>

      {/* 본문 */}
      <Box sx={{ padding: '8px 10px' }}>
        {/* 기간 정보 */}
        {duration !== undefined && (
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: '#616161' }}>
            기간: {duration}일
          </Typography>
        )}

        {/* 진행률 */}
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#757575' }}>
              진행률
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600 }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor,
              },
            }}
          />
        </Box>

        {/* 크리티컬 패스 표시 */}
        {isCriticalPath && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              color: '#ff9800',
              fontWeight: 600,
              fontSize: '10px',
            }}
          >
            ★ Critical Path
          </Typography>
        )}
      </Box>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: backgroundColor,
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: backgroundColor,
          width: 8,
          height: 8,
        }}
      />
    </Box>
  );
};

export default memo(CustomNode);
