/**
 * Delay Analysis Report Component
 *
 * 지연 분석 리포트 컴포넌트
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
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import type { Task, DelayAnalysisData } from '../../types';
import { analyzeDelays } from '../../utils/criticalPathCalculator';

export interface DelayAnalysisProps {
  tasks: Task[];
}

const DelayAnalysis = ({ tasks }: DelayAnalysisProps) => {
  const [analysis, setAnalysis] = useState<DelayAnalysisData | null>(null);

  useEffect(() => {
    if (tasks.length > 0) {
      const result = analyzeDelays(tasks);
      setAnalysis(result);
    }
  }, [tasks]);

  if (!analysis) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>지연 분석 데이터가 없습니다.</Typography>
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        지연 분석 리포트
      </Typography>

      {/* 전체 통계 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                지연된 태스크
              </Typography>
              <Typography variant="h4" color="error">
                {analysis.delayedTasks.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                총 지연 일수
              </Typography>
              <Typography variant="h4" color="warning.main">
                {analysis.totalDelayDays}일
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                평균 지연 일수
              </Typography>
              <Typography variant="h4" color="warning.main">
                {analysis.averageDelayDays}일
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 지연 태스크 목록 */}
      {analysis.delayedTasks.length > 0 ? (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            지연된 태스크 목록
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>태스크명</TableCell>
                  <TableCell>계획 종료일</TableCell>
                  <TableCell>지연 일수</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>진행률</TableCell>
                  <TableCell>지연 원인</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analysis.delayedTasks.map((delayed) => (
                  <TableRow key={delayed.task.id}>
                    <TableCell>{delayed.task.name}</TableCell>
                    <TableCell>{formatDate(delayed.plannedEndDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${delayed.delayDays}일`}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(delayed.task.status)}
                        size="small"
                        color={getStatusColor(delayed.task.status)}
                      />
                    </TableCell>
                    <TableCell>{delayed.task.progress}%</TableCell>
                    <TableCell>
                      {delayed.delayReasons.join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Enabler 지연 영향 */}
          {analysis.enablerDelays.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Enabler 지연 영향
              </Typography>
              <Alert severity="warning">
                {analysis.enablerDelays.length}개의 Enabler 지연이 태스크에 영향을 미치고 있습니다.
              </Alert>
              <Box sx={{ mt: 2 }}>
                {analysis.enablerDelays.map((enablerDelay) => (
                  <Alert key={enablerDelay.enablerId} severity="info" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">
                      {enablerDelay.enablerName} - {enablerDelay.delayDays}일 지연
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      영향받는 태스크: {enablerDelay.impactedTasks.length}개
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </>
          )}
        </>
      ) : (
        <Alert severity="success" sx={{ mt: 3 }}>
          현재 지연된 태스크가 없습니다.
        </Alert>
      )}
    </Paper>
  );
};

export default DelayAnalysis;
