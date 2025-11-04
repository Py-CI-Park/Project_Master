/**
 * Project List Page
 *
 * 프로젝트 목록 페이지
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { Loading } from '../../components/Common';
import { getProjects, deleteProject } from '../../services/projectService';
import type { Project, ProjectStatus } from '../../types';
import { ProjectStatusLabels, ProjectStatusColors } from '../../types';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'start_date' | 'status'>('start_date');

  // 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, []);

  // 검색, 필터링, 정렬 적용
  useEffect(() => {
    let result = [...projects];

    // 검색
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      result = result.filter((project) => project.status === statusFilter);
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'start_date':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredProjects(result);
  }, [projects, searchTerm, statusFilter, sortBy]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      alert('프로젝트 삭제에 실패했습니다.');
      console.error('Failed to delete project:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return <Loading message="프로젝트 목록을 불러오는 중..." />;
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          프로젝트 목록
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
        >
          새 프로젝트
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 검색 및 필터 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="검색"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
          placeholder="프로젝트 이름 또는 설명으로 검색"
        />
        <TextField
          select
          label="상태"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="planning">계획 중</MenuItem>
          <MenuItem value="in_progress">진행 중</MenuItem>
          <MenuItem value="on_hold">보류</MenuItem>
          <MenuItem value="completed">완료</MenuItem>
          <MenuItem value="cancelled">취소</MenuItem>
        </TextField>
        <TextField
          select
          label="정렬"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="name">이름순</MenuItem>
          <MenuItem value="start_date">시작일순</MenuItem>
          <MenuItem value="status">상태순</MenuItem>
        </TextField>
      </Box>

      {/* 프로젝트 카드 목록 */}
      {filteredProjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            프로젝트가 없습니다.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => navigate('/projects/new')}
          >
            첫 프로젝트 만들기
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transition: 'box-shadow 0.3s',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {project.name}
                    </Typography>
                    <Chip
                      label={ProjectStatusLabels[project.status]}
                      size="small"
                      sx={{
                        backgroundColor: ProjectStatusColors[project.status],
                        color: 'white',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description || '설명 없음'}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    시작: {formatDate(project.start_date)}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    종료: {formatDate(project.end_date)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    title="보기"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    title="수정"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(project.id)}
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

export default ProjectList;
