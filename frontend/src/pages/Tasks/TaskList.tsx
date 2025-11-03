/**
 * Task List Page
 *
 * 태스크 목록 페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { Loading } from '../../components/common';
import { getTasks, deleteTask } from '../../services/taskService';
import type { Task, TaskStatus, TaskPriority } from '../../types';
import { TaskStatusLabels, TaskStatusColors, TaskPriorityLabels, TaskPriorityColors } from '../../types';

const TaskList = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(Number(projectId));
      setTasks(data);
    } catch (err) {
      setError('태스크 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!window.confirm('정말 이 태스크를 삭제하시겠습니까?')) {
      return;
    }

    if (!projectId) return;

    try {
      await deleteTask(Number(projectId), taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      alert('태스크 삭제에 실패했습니다.');
      console.error('Failed to delete task:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusChip = (status: TaskStatus) => (
    <Chip
      label={TaskStatusLabels[status]}
      size="small"
      sx={{
        backgroundColor: TaskStatusColors[status],
        color: 'white',
      }}
    />
  );

  const getPriorityChip = (priority: TaskPriority) => (
    <Chip
      label={TaskPriorityLabels[priority]}
      size="small"
      icon={<FlagIcon />}
      sx={{
        backgroundColor: TaskPriorityColors[priority],
        color: 'white',
      }}
    />
  );

  const getProgressBar = (progress: number) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: progress >= 100 ? '#4caf50' : '#2196f3',
            },
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45 }}>
        {progress.toFixed(0)}%
      </Typography>
    </Box>
  );

  if (loading) {
    return <Loading message="태스크 목록을 불러오는 중..." />;
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          태스크 목록
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
        >
          새 태스크
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 태스크 테이블 */}
      {tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            태스크가 없습니다.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
          >
            첫 태스크 만들기
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>태스크 이름</TableCell>
                <TableCell align="center">상태</TableCell>
                <TableCell align="center">우선순위</TableCell>
                <TableCell>진행률</TableCell>
                <TableCell>시작일</TableCell>
                <TableCell>종료일</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell align="center">마일스톤</TableCell>
                <TableCell align="right">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.name}
                    </Typography>
                    {task.description && (
                      <Typography variant="caption" color="text.secondary">
                        {task.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">{getStatusChip(task.status)}</TableCell>
                  <TableCell align="center">{getPriorityChip(task.priority)}</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    {getProgressBar(task.progress)}
                  </TableCell>
                  <TableCell>{formatDate(task.start_date)}</TableCell>
                  <TableCell>{formatDate(task.end_date)}</TableCell>
                  <TableCell>
                    {task.assignee || (
                      <Typography variant="body2" color="text.secondary">
                        미할당
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {task.is_milestone && (
                      <Chip label="M" size="small" color="primary" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                      title="보기"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}/edit`)}
                      title="수정"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(task.id)}
                      title="삭제"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TaskList;
