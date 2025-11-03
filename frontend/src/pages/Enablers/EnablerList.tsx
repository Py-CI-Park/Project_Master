/**
 * Enabler List Page
 *
 * Enabler 목록 페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Loading } from '../../components/Common';
import { getEnablers, deleteEnabler } from '../../services/enablerService';
import type { Enabler, EnablerStatus } from '../../types';
import {
  EnablerTypeLabels,
  EnablerStatusLabels,
  EnablerStatusColors,
  EnablerCriticalityLabels,
  EnablerCriticalityColors,
} from '../../types';

const EnablerList = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [enablers, setEnablers] = useState<Enabler[]>([]);
  const [filteredEnablers, setFilteredEnablers] = useState<Enabler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EnablerStatus | 'all'>('all');

  useEffect(() => {
    if (projectId) {
      loadEnablers();
    }
  }, [projectId]);

  useEffect(() => {
    let result = [...enablers];

    // 상태 필터링
    if (statusFilter !== 'all') {
      result = result.filter((enabler) => enabler.status === statusFilter);
    }

    setFilteredEnablers(result);
  }, [enablers, statusFilter]);

  const loadEnablers = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getEnablers(Number(projectId));
      setEnablers(data);
    } catch (err) {
      setError('Enabler 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load enablers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (enablerId: number) => {
    if (!window.confirm('정말 이 Enabler를 삭제하시겠습니까?')) {
      return;
    }

    if (!projectId) return;

    try {
      await deleteEnabler(Number(projectId), enablerId);
      setEnablers(enablers.filter((e) => e.id !== enablerId));
    } catch (err) {
      alert('Enabler 삭제에 실패했습니다.');
      console.error('Failed to delete enabler:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const isDelayed = (enabler: Enabler) => {
    if (enabler.status === 'delivered') return false;
    const plannedDate = new Date(enabler.planned_delivery_date);
    const now = new Date();
    return now > plannedDate;
  };

  if (loading) {
    return <Loading message="Enabler 목록을 불러오는 중..." />;
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Key Enabler 목록
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/projects/${projectId}/enablers/new`)}
        >
          새 Enabler
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 필터 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="상태"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EnablerStatus | 'all')}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="requested">요청됨</MenuItem>
          <MenuItem value="in_progress">진행 중</MenuItem>
          <MenuItem value="delivered">전달 완료</MenuItem>
          <MenuItem value="delayed">지연됨</MenuItem>
          <MenuItem value="cancelled">취소됨</MenuItem>
        </TextField>
      </Box>

      {/* Enabler 카드 목록 */}
      {filteredEnablers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Enabler가 없습니다.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => navigate(`/projects/${projectId}/enablers/new`)}
          >
            첫 Enabler 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEnablers.map((enabler) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={enabler.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transition: 'box-shadow 0.3s',
                  },
                  border: isDelayed(enabler) ? '2px solid #ff9800' : 'none',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {enabler.name}
                    </Typography>
                    {isDelayed(enabler) && (
                      <WarningIcon color="warning" />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={EnablerStatusLabels[enabler.status]}
                      size="small"
                      sx={{
                        backgroundColor: EnablerStatusColors[enabler.status],
                        color: 'white',
                      }}
                    />
                    <Chip
                      label={EnablerCriticalityLabels[enabler.criticality]}
                      size="small"
                      sx={{
                        backgroundColor: EnablerCriticalityColors[enabler.criticality],
                        color: 'white',
                      }}
                    />
                    <Chip
                      label={EnablerTypeLabels[enabler.type]}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {enabler.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {enabler.description}
                    </Typography>
                  )}

                  <Typography variant="caption" display="block" color="text.secondary">
                    전달 예정: {formatDate(enabler.planned_delivery_date)}
                  </Typography>
                  {enabler.actual_delivery_date && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      실제 전달: {formatDate(enabler.actual_delivery_date)}
                    </Typography>
                  )}
                  {enabler.responsible_person && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      담당자: {enabler.responsible_person}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${projectId}/enablers/${enabler.id}`)}
                    title="보기"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${projectId}/enablers/${enabler.id}/edit`)}
                    title="수정"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(enabler.id)}
                    title="삭제"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EnablerList;
