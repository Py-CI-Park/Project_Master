/**
 * Project Form Page
 *
 * 프로젝트 생성/수정 폼 페이지
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
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Loading } from '../../components/common';
import { getProject, createProject, updateProject } from '../../services/projectService';
import type { ProjectCreate, ProjectUpdate, ProjectStatus } from '../../types';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const isEditMode = projectId && projectId !== 'new';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planning',
  });

  useEffect(() => {
    if (isEditMode) {
      loadProject();
    }
  }, [isEditMode, projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const project = await getProject(Number(projectId));
      setFormData({
        name: project.name,
        description: project.description || '',
        start_date: project.start_date.split('T')[0],
        end_date: project.end_date.split('T')[0],
        status: project.status,
      });
    } catch (err) {
      setError('프로젝트 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('프로젝트 이름을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditMode) {
        const updateData: ProjectUpdate = {
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
        };
        await updateProject(Number(projectId), updateData);
        navigate(`/projects/${projectId}`);
      } else {
        const newProject = await createProject(formData);
        navigate(`/projects/${newProject.id}`);
      }
    } catch (err) {
      setError(isEditMode ? '프로젝트 수정에 실패했습니다.' : '프로젝트 생성에 실패했습니다.');
      console.error('Failed to save project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ProjectCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (loading) {
    return <Loading message="프로젝트 정보를 불러오는 중..." />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? '프로젝트 수정' : '새 프로젝트'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="프로젝트 이름"
              required
              fullWidth
              value={formData.name}
              onChange={handleChange('name')}
              disabled={saving}
            />

            <TextField
              label="설명"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleChange('description')}
              disabled={saving}
            />

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

            <TextField
              select
              label="상태"
              fullWidth
              value={formData.status}
              onChange={handleChange('status')}
              disabled={saving}
            >
              <MenuItem value="planning">계획 중</MenuItem>
              <MenuItem value="in_progress">진행 중</MenuItem>
              <MenuItem value="on_hold">보류</MenuItem>
              <MenuItem value="completed">완료</MenuItem>
              <MenuItem value="cancelled">취소</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/projects')}
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
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm;
