/**
 * Task Detail Page
 *
 * 태스크 상세 페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Divider,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Loading } from '../../components/Common';
import { getTask, deleteTask } from '../../services/taskService';
import type { Task } from '../../types';
import { TaskStatusLabels, TaskStatusColors, TaskPriorityLabels, TaskPriorityColors } from '../../types';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && taskId) {
      loadTask();
    }
  }, [projectId, taskId]);

  const loadTask = async () => {
    if (!projectId || !taskId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTask(Number(projectId), Number(taskId));
      setTask(data);
    } catch (err) {
      setError('태스크 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 태스크를 삭제하시겠습니까?')) {
      return;
    }

    if (!projectId || !taskId) return;

    try {
      await deleteTask(Number(projectId), Number(taskId));
      navigate(`/projects/${projectId}/tasks`);
    } catch (err) {
      alert('태스크 삭제에 실패했습니다.');
      console.error('Failed to delete task:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return <Loading message="태스크 정보를 불러오는 중..." />;
  }

  if (error || !task) {
    return (
      <Box>
        <Alert severity="error">{error || '태스크를 찾을 수 없습니다.'}</Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/projects/${projectId}/tasks`)}
          sx={{ mt: 2 }}
        >
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(`/projects/${projectId}/tasks`)}
          >
            목록
          </Button>
          <Typography variant="h4" component="h1">
            {task.name}
          </Typography>
          {task.is_milestone && (
            <Chip label="마일스톤" color="primary" size="small" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            삭제
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 기본 정보 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              태스크 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {task.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  설명
                </Typography>
                <Typography variant="body1">{task.description}</Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  시작일
                </Typography>
                <Typography variant="body1">{formatDate(task.start_date)}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  종료일
                </Typography>
                <Typography variant="body1">{formatDate(task.end_date)}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  소요 기간
                </Typography>
                <Typography variant="body1">{task.duration_days}일</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  담당자
                </Typography>
                <Typography variant="body1">
                  {task.assignee || (
                    <Typography component="span" color="text.secondary">
                      미할당
                    </Typography>
                  )}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  진행률
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={task.progress}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          backgroundColor: task.progress >= 100 ? '#4caf50' : '#2196f3',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body1" fontWeight="medium" sx={{ minWidth: 50 }}>
                    {task.progress.toFixed(0)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 상태 정보 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              상태
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  진행 상태
                </Typography>
                <Chip
                  label={TaskStatusLabels[task.status]}
                  sx={{
                    backgroundColor: TaskStatusColors[task.status],
                    color: 'white',
                  }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  우선순위
                </Typography>
                <Chip
                  label={TaskPriorityLabels[task.priority]}
                  icon={<FlagIcon />}
                  sx={{
                    backgroundColor: TaskPriorityColors[task.priority],
                    color: 'white',
                  }}
                />
              </Box>
              {task.color && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    색상
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        backgroundColor: task.color,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                    <Typography variant="body2">{task.color}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              메타데이터
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  생성일시
                </Typography>
                <Typography variant="body2">{formatDateTime(task.created_at)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  수정일시
                </Typography>
                <Typography variant="body2">{formatDateTime(task.updated_at)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 향후 확장: 의존성, Enabler, 활동 이력 등 */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              의존성 및 연결된 항목
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              향후 구현 예정: 태스크 의존성, 연결된 Enabler, 활동 이력 등
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDetail;
