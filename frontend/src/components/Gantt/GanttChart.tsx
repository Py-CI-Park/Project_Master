/**
 * GanttChart Component
 *
 * Frappe Gantt 라이브러리를 사용한 간트 차트 컴포넌트
 */

import { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import type { GanttTask, GanttViewMode, GanttOptions } from '../../types/gantt';
import { createCustomPopupHtml } from '../../utils/ganttTransformer';
import './GanttChart.css';

export interface GanttChartProps {
  tasks: GanttTask[];
  viewMode?: GanttViewMode;
  onTaskClick?: (task: GanttTask) => void;
  onDateChange?: (task: GanttTask, start: Date, end: Date) => void;
  onProgressChange?: (task: GanttTask, progress: number) => void;
}

const GanttChart = ({
  tasks,
  viewMode = 'Week',
  onTaskClick,
  onDateChange,
  onProgressChange,
}: GanttChartProps) => {
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<any>(null);
  const [currentViewMode, setCurrentViewMode] = useState<GanttViewMode>(viewMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ganttContainerRef.current || tasks.length === 0) {
      return;
    }

    try {
      setError(null);

      // Gantt 옵션 설정
      const options: GanttOptions = {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month', 'Year'],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: currentViewMode,
        date_format: 'YYYY-MM-DD',
        popup_trigger: 'click',
        custom_popup_html: createCustomPopupHtml,
        language: 'ko',
        on_click: (task: GanttTask) => {
          if (onTaskClick) {
            onTaskClick(task);
          }
        },
        on_date_change: (task: GanttTask, start: Date, end: Date) => {
          if (onDateChange) {
            onDateChange(task, start, end);
          }
        },
        on_progress_change: (task: GanttTask, progress: number) => {
          if (onProgressChange) {
            onProgressChange(task, progress);
          }
        },
      };

      // 기존 Gantt 인스턴스 제거
      if (ganttInstanceRef.current) {
        ganttContainerRef.current.innerHTML = '';
      }

      // 새 Gantt 인스턴스 생성
      ganttInstanceRef.current = new Gantt(ganttContainerRef.current, tasks, options);
    } catch (err) {
      console.error('Failed to render Gantt chart:', err);
      setError('간트 차트를 렌더링하는데 실패했습니다.');
    }
  }, [tasks, currentViewMode, onTaskClick, onDateChange, onProgressChange]);

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: GanttViewMode | null
  ) => {
    if (newMode !== null) {
      setCurrentViewMode(newMode);
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current.change_view_mode(newMode);
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">표시할 태스크가 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">간트 차트</Typography>
        <ToggleButtonGroup
          value={currentViewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="Day">일</ToggleButton>
          <ToggleButton value="Week">주</ToggleButton>
          <ToggleButton value="Month">월</ToggleButton>
          <ToggleButton value="Year">년</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        ref={ganttContainerRef}
        sx={{
          width: '100%',
          overflow: 'auto',
          '& svg': {
            width: '100%',
            height: 'auto',
          },
        }}
      />
    </Paper>
  );
};

export default GanttChart;
