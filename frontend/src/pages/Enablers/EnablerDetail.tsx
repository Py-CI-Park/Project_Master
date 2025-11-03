/**
 * Enabler Detail Page
 *
 * Enabler 상세 페이지
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
  Divider,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Loading } from '../../components/Common';
import { getEnabler, deleteEnabler } from '../../services/enablerService';
import type { Enabler } from '../../types';
import {
  EnablerTypeLabels,
  EnablerStatusLabels,
  EnablerStatusColors,
  EnablerCriticalityLabels,
  EnablerCriticalityColors,
} from '../../types';

const EnablerDetail = () => {
  const navigate = useNavigate();
  const { projectId, enablerId } = useParams<{ projectId: string; enablerId: string }>();
  const [enabler, setEnabler] = useState<Enabler | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && enablerId) {
      loadEnabler();
    }
  }, [projectId, enablerId]);

  const loadEnabler = async () => {
    if (!projectId || !enablerId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getEnabler(Number(projectId), Number(enablerId));
      setEnabler(data);
    } catch (err) {
      setError('Enabler 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load enabler:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 Enabler를 삭제하시겠습니까?')) {
      return;
    }

    if (!projectId || !enablerId) return;

    try {
      await deleteEnabler(Number(projectId), Number(enablerId));
      navigate(`/projects/${projectId}/enablers`);
    } catch (err) {
      alert('Enabler 삭제에 실패했습니다.');
      console.error('Failed to delete enabler:', err);
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

  const isDelayed = (enabler: Enabler) => {
    if (enabler.status === 'delivered') return false;
    const plannedDate = new Date(enabler.planned_delivery_date);
    const now = new Date();
    return now > plannedDate;
  };

  if (loading) {
    return <Loading message="Enabler 정보를 불러오는 중..." />;
  }

  if (error || !enabler) {
    return (
      <Box>
        <Alert severity="error">{error || 'Enabler를 찾을 수 없습니다.'}</Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(`/projects/${projectId}/enablers`)}
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
            onClick={() => navigate(`/projects/${projectId}/enablers`)}
          >
            목록
          </Button>
          <Typography variant="h4" component="h1">
            {enabler.name}
          </Typography>
          {isDelayed(enabler) && (
            <WarningIcon color="warning" fontSize="large" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${projectId}/enablers/${enablerId}/edit`)}
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

      {isDelayed(enabler) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>경고:</strong> 이 Enabler는 전달 예정일을 초과했습니다.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 기본 정보 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enabler 정보
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {enabler.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  설명
                </Typography>
                <Typography variant="body1">{enabler.description}</Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  타입
                </Typography>
                <Chip
                  label={EnablerTypeLabels[enabler.type]}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  중요도
                </Typography>
                <Chip
                  label={EnablerCriticalityLabels[enabler.criticality]}
                  sx={{
                    backgroundColor: EnablerCriticalityColors[enabler.criticality],
                    color: 'white',
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  전달 예정일
                </Typography>
                <Typography variant="body1">{formatDate(enabler.planned_delivery_date)}</Typography>
              </Grid>

              {enabler.actual_delivery_date && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    실제 전달일
                  </Typography>
                  <Typography variant="body1">{formatDate(enabler.actual_delivery_date)}</Typography>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  담당자
                </Typography>
                <Typography variant="body1">
                  {enabler.responsible_person || (
                    <Typography component="span" color="text.secondary">
                      미지정
                    </Typography>
                  )}
                </Typography>
              </Grid>
            </Grid>

            {enabler.notes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  비고
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {enabler.notes}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 상태 정보 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              상태
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Chip
                label={EnablerStatusLabels[enabler.status]}
                sx={{
                  backgroundColor: EnablerStatusColors[enabler.status],
                  color: 'white',
                  fontSize: '1rem',
                  height: 'auto',
                  padding: '8px 12px',
                }}
              />
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
                <Typography variant="body2">{formatDateTime(enabler.created_at)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  수정일시
                </Typography>
                <Typography variant="body2">{formatDateTime(enabler.updated_at)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 향후 확장: 영향받는 태스크 등 */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              영향받는 태스크
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              향후 구현 예정: 이 Enabler에 의해 차단된 태스크 목록, 영향도 분석 등
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnablerDetail;
