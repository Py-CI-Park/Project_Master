/**
 * DependencyMatrix Component
 *
 * 의존성 매트릭스 뷰 - 테이블 형식으로 의존성 표시
 */

import { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { Task } from '../../types';
import { createDependencyMatrix, detectCircularDependencies } from '../../utils/graphTransformer';

export interface DependencyMatrixProps {
  tasks: Task[];
}

const DependencyMatrix = ({ tasks }: DependencyMatrixProps) => {
  // 의존성 매트릭스 생성
  const matrix = useMemo(() => createDependencyMatrix(tasks), [tasks]);

  // 순환 의존성 감지
  const circularDeps = useMemo(() => detectCircularDependencies(tasks), [tasks]);

  // 태스크 ID → 태스크 맵
  const taskMap = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task]));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">표시할 태스크가 없습니다.</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          의존성 매트릭스
        </Typography>
        <Typography variant="body2" color="text.secondary">
          각 태스크가 의존하는 선행 태스크를 표시합니다.
        </Typography>
      </Box>

      {/* 순환 의존성 경고 */}
      {circularDeps.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            순환 의존성이 감지되었습니다!
          </Typography>
          <Typography variant="body2">
            태스크 ID: {circularDeps.join(', ')}
          </Typography>
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            순환 의존성은 프로젝트 실행을 방해할 수 있으므로 즉시 수정해야 합니다.
          </Typography>
        </Alert>
      )}

      {/* 의존성 테이블 */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '40%' }}>태스크</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '60%' }}>선행 태스크 (의존성)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matrix.map((row) => {
              const isCircular = circularDeps.includes(row.taskId);

              return (
                <TableRow
                  key={row.taskId}
                  sx={{
                    backgroundColor: isCircular ? 'rgba(255, 152, 0, 0.1)' : 'inherit',
                  }}
                >
                  {/* 태스크 이름 */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isCircular && (
                        <WarningIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                      )}
                      <Typography variant="body2" fontWeight={isCircular ? 600 : 400}>
                        {row.taskName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (ID: {row.taskId})
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* 의존성 목록 */}
                  <TableCell>
                    {row.dependencies.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        없음
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {row.dependencies.map((dep) => {
                          const sourceTask = taskMap.get(dep.sourceTaskId);
                          const isDepCircular = circularDeps.includes(dep.sourceTaskId);

                          return (
                            <Chip
                              key={`${dep.sourceTaskId}-${dep.targetTaskId}`}
                              label={
                                sourceTask
                                  ? `${sourceTask.name} (ID: ${dep.sourceTaskId})`
                                  : `ID: ${dep.sourceTaskId}`
                              }
                              size="small"
                              color={isDepCircular ? 'warning' : 'default'}
                              variant={isDepCircular ? 'filled' : 'outlined'}
                              icon={isDepCircular ? <WarningIcon /> : undefined}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 통계 */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2">
          <strong>총 태스크:</strong> {tasks.length}개 |{' '}
          <strong>의존성이 있는 태스크:</strong>{' '}
          {matrix.filter((row) => row.dependencies.length > 0).length}개 |{' '}
          <strong>순환 의존성:</strong>{' '}
          <span style={{ color: circularDeps.length > 0 ? '#f57c00' : '#4caf50' }}>
            {circularDeps.length > 0 ? `${circularDeps.length}개 발견` : '없음'}
          </span>
        </Typography>
      </Box>
    </Paper>
  );
};

export default DependencyMatrix;
