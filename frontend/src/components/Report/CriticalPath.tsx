/**
 * Critical Path Report Component
 *
 * 크리티컬 패스 리포트 컴포넌트
 */

import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { Task, Dependency, CriticalPathAnalysis } from '../../types';
import { calculateCriticalPath } from '../../utils/criticalPathCalculator';

export interface CriticalPathProps {
  tasks: Task[];
  dependencies: Dependency[];
}

const CriticalPath = ({ tasks, dependencies }: CriticalPathProps) => {
  const [analysis, setAnalysis] = useState<CriticalPathAnalysis | null>(null);

  useEffect(() => {
    if (tasks.length > 0) {
      const result = calculateCriticalPath(tasks, dependencies);
      setAnalysis(result);
    }
  }, [tasks, dependencies]);

  if (!analysis) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>크리티컬 패스를 계산할 데이터가 없습니다.</Typography>
      </Paper>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        크리티컬 패스 분석
      </Typography>

      {/* 전체 프로젝트 기간 */}
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          전체 프로젝트 기간: <strong>{analysis.totalDuration}일</strong>
        </Alert>
      </Box>

      {/* 크리티컬 태스크 목록 */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        크리티컬 태스크 ({analysis.criticalTasks.length}개)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>태스크명</TableCell>
              <TableCell>Early Start</TableCell>
              <TableCell>Early Finish</TableCell>
              <TableCell>Late Start</TableCell>
              <TableCell>Late Finish</TableCell>
              <TableCell>Slack (일)</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>진행률</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analysis.criticalTasks.map((cpt) => (
              <TableRow key={cpt.task.id}>
                <TableCell>{cpt.task.name}</TableCell>
                <TableCell>{formatDate(cpt.earlyStart)}</TableCell>
                <TableCell>{formatDate(cpt.earlyFinish)}</TableCell>
                <TableCell>{formatDate(cpt.lateStart)}</TableCell>
                <TableCell>{formatDate(cpt.lateFinish)}</TableCell>
                <TableCell>
                  <Chip
                    label={cpt.slack}
                    color={cpt.slack === 0 ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(cpt.task.status)}
                    size="small"
                    color={getStatusColor(cpt.task.status)}
                  />
                </TableCell>
                <TableCell>{cpt.task.progress}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 리스크 분석 */}
      {analysis.risks.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" gutterBottom>
            리스크 분석 ({analysis.risks.length}건)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {analysis.risks.map((risk) => (
              <Alert
                key={risk.taskId}
                severity={risk.riskLevel === 'high' ? 'error' : risk.riskLevel === 'medium' ? 'warning' : 'info'}
                icon={<WarningIcon />}
              >
                <Typography variant="subtitle2">
                  {risk.taskName} - {risk.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  영향: {risk.impact}
                </Typography>
              </Alert>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};

const getStatusLabel = (status: Task['status']): string => {
  const labels: Record<Task['status'], string> = {
    not_started: '미시작',
    in_progress: '진행중',
    completed: '완료',
    on_hold: '보류',
    cancelled: '취소',
  };
  return labels[status];
};

const getStatusColor = (
  status: Task['status']
): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'on_hold':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export default CriticalPath;
