/**
 * Enabler Form Page
 *
 * Enabler 생성/수정 폼 페이지
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
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Loading } from '../../components/common';
import { getEnabler, createEnabler, updateEnabler } from '../../services/enablerService';
import type { EnablerCreate, EnablerUpdate } from '../../types';

const EnablerForm = () => {
  const navigate = useNavigate();
  const { projectId, enablerId } = useParams<{ projectId: string; enablerId: string }>();
  const isEditMode = enablerId && enablerId !== 'new';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EnablerCreate>({
    project_id: Number(projectId),
    name: '',
    description: '',
    type: 'document',
    planned_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actual_delivery_date: '',
    status: 'requested',
    criticality: 'medium',
    responsible_person: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && projectId && enablerId) {
      loadEnabler();
    }
  }, [isEditMode, projectId, enablerId]);

  const loadEnabler = async () => {
    if (!projectId || !enablerId) return;

    try {
      setLoading(true);
      const enabler = await getEnabler(Number(projectId), Number(enablerId));
      setFormData({
        project_id: enabler.project_id,
        name: enabler.name,
        description: enabler.description || '',
        type: enabler.type,
        planned_delivery_date: enabler.planned_delivery_date.split('T')[0],
        actual_delivery_date: enabler.actual_delivery_date ? enabler.actual_delivery_date.split('T')[0] : '',
        status: enabler.status,
        criticality: enabler.criticality,
        responsible_person: enabler.responsible_person || '',
        notes: enabler.notes || '',
      });
    } catch (err) {
      setError('Enabler 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load enabler:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Enabler 이름을 입력해주세요.');
      return;
    }

    if (!projectId) return;

    try {
      setSaving(true);
      setError(null);

      if (isEditMode && enablerId) {
        const updateData: EnablerUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          type: formData.type,
          planned_delivery_date: formData.planned_delivery_date,
          actual_delivery_date: formData.actual_delivery_date || undefined,
          status: formData.status,
          criticality: formData.criticality,
          responsible_person: formData.responsible_person || undefined,
          notes: formData.notes || undefined,
        };
        await updateEnabler(Number(projectId), Number(enablerId), updateData);
        navigate(`/projects/${projectId}/enablers/${enablerId}`);
      } else {
        const newEnabler = await createEnabler(formData);
        navigate(`/projects/${projectId}/enablers/${newEnabler.id}`);
      }
    } catch (err) {
      setError(isEditMode ? 'Enabler 수정에 실패했습니다.' : 'Enabler 생성에 실패했습니다.');
      console.error('Failed to save enabler:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EnablerCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (loading) {
    return <Loading message="Enabler 정보를 불러오는 중..." />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Enabler 수정' : '새 Enabler'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Enabler 이름"
                required
                fullWidth
                value={formData.name}
                onChange={handleChange('name')}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="타입"
                required
                fullWidth
                value={formData.type}
                onChange={handleChange('type')}
                disabled={saving}
              >
                <MenuItem value="document">문서</MenuItem>
                <MenuItem value="equipment">장비</MenuItem>
                <MenuItem value="approval">승인</MenuItem>
                <MenuItem value="resource">리소스</MenuItem>
                <MenuItem value="license">라이선스</MenuItem>
                <MenuItem value="training">교육</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="중요도"
                required
                fullWidth
                value={formData.criticality}
                onChange={handleChange('criticality')}
                disabled={saving}
              >
                <MenuItem value="low">낮음</MenuItem>
                <MenuItem value="medium">보통</MenuItem>
                <MenuItem value="high">높음</MenuItem>
                <MenuItem value="critical">긴급</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="전달 예정일"
                type="date"
                required
                fullWidth
                value={formData.planned_delivery_date}
                onChange={handleChange('planned_delivery_date')}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="실제 전달일"
                type="date"
                fullWidth
                value={formData.actual_delivery_date}
                onChange={handleChange('actual_delivery_date')}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="상태"
                required
                fullWidth
                value={formData.status}
                onChange={handleChange('status')}
                disabled={saving}
              >
                <MenuItem value="requested">요청됨</MenuItem>
                <MenuItem value="in_progress">진행 중</MenuItem>
                <MenuItem value="delivered">전달 완료</MenuItem>
                <MenuItem value="delayed">지연됨</MenuItem>
                <MenuItem value="cancelled">취소됨</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="담당자"
                fullWidth
                value={formData.responsible_person}
                onChange={handleChange('responsible_person')}
                disabled={saving}
                placeholder="이름 또는 이메일"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="비고"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={handleChange('notes')}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/projects/${projectId}/enablers`)}
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

export default EnablerForm;
