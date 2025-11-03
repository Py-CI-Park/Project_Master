/**
 * Task Form Page
 *
 * 태스크 생성/수정 폼 페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Alert,
  Grid,
  Slider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Loading } from '../../components/Common';
import { getTask, createTask, updateTask } from '../../services/taskService';
import type { TaskCreate, TaskUpdate } from '../../types';

const TaskForm = () => {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const isEditMode = taskId && taskId !== 'new';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaskCreate>({
    project_id: Number(projectId),
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration_days: 7,
    status: 'not_started',
    priority: 'medium',
    progress: 0,
    assignee: '',
    is_milestone: false,
    color: '',
  });

  useEffect(() => {
    if (isEditMode && projectId && taskId) {
      loadTask();
    }
  }, [isEditMode, projectId, taskId]);

  const loadTask = async () => {
    if (!projectId || !taskId) return;

    try {
      setLoading(true);
      const task = await getTask(Number(projectId), Number(taskId));
      setFormData({
        project_id: task.project_id,
        name: task.name,
        description: task.description || '',
        start_date: task.start_date.split('T')[0],
        end_date: task.end_date.split('T')[0],
        duration_days: task.duration_days,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        assignee: task.assignee || '',
        is_milestone: task.is_milestone,
        color: task.color || '',
      });
    } catch (err) {
      setError('태스크 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('태스크 이름을 입력해주세요.');
      return;
    }

    if (!projectId) return;

    try {
      setSaving(true);
      setError(null);

      if (isEditMode && taskId) {
        const updateData: TaskUpdate = {
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          duration_days: formData.duration_days,
          status: formData.status,
          priority: formData.priority,
          progress: formData.progress,
          assignee: formData.assignee,
          is_milestone: formData.is_milestone,
          color: formData.color,
        };
        await updateTask(Number(projectId), Number(taskId), updateData);
        navigate(`/projects/${projectId}/tasks/${taskId}`);
      } else {
        const newTask = await createTask(formData);
        navigate(`/projects/${projectId}/tasks/${newTask.id}`);
      }
    } catch (err) {
      setError(isEditMode ? '태스크 수정에 실패했습니다.' : '태스크 생성에 실패했습니다.');
      console.error('Failed to save task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof TaskCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleProgressChange = (_event: Event, value: number | number[]) => {
    setFormData({ ...formData, progress: value as number });
  };

  const handleCheckboxChange = (field: keyof TaskCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.checked });
  };

  if (loading) {
    return <Loading message="태스크 정보를 불러오는 중..." />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? '태스크 수정' : '새 태스크'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="태스크 이름"
                required
                fullWidth
                value={formData.name}
                onChange={handleChange('name')}
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="설명"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={handleChange('description')}
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="시작일"
                type="date"
                required
                fullWidth
                value={formData.start_date}
                onChange={handleChange('start_date')}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="종료일"
                type="date"
                required
                fullWidth
                value={formData.end_date}
                onChange={handleChange('end_date')}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="소요 기간 (일)"
                type="number"
                fullWidth
                value={formData.duration_days}
                onChange={handleChange('duration_days')}
                disabled={saving}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="상태"
                fullWidth
                value={formData.status}
                onChange={handleChange('status')}
                disabled={saving}
              >
                <MenuItem value="not_started">시작 전</MenuItem>
                <MenuItem value="in_progress">진행 중</MenuItem>
                <MenuItem value="completed">완료</MenuItem>
                <MenuItem value="blocked">차단됨</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="우선순위"
                fullWidth
                value={formData.priority}
                onChange={handleChange('priority')}
                disabled={saving}
              >
                <MenuItem value="low">낮음</MenuItem>
                <MenuItem value="medium">보통</MenuItem>
                <MenuItem value="high">높음</MenuItem>
                <MenuItem value="critical">긴급</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="담당자"
                fullWidth
                value={formData.assignee}
                onChange={handleChange('assignee')}
                disabled={saving}
                placeholder="이름 또는 이메일"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography gutterBottom>진행률: {formData.progress}%</Typography>
              <Slider
                value={formData.progress}
                onChange={handleProgressChange}
                min={0}
                max={100}
                step={5}
                marks
                valueLabelDisplay="auto"
                disabled={saving}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="색상 (hex 코드)"
                fullWidth
                value={formData.color}
                onChange={handleChange('color')}
                disabled={saving}
                placeholder="#1976d2"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_milestone}
                    onChange={handleCheckboxChange('is_milestone')}
                    disabled={saving}
                  />
                }
                label="마일스톤으로 표시"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/projects/${projectId}/tasks`)}
                  disabled={saving}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : isEditMode ? '수정' : '생성'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm;
