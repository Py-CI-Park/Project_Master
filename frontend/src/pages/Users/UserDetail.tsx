/**
 * User Detail Page
 *
 * 사용자 상세 정보 페이지
 * - 사용자 정보 표시
 * - 활동 로그 표시 (Phase 향후 구현)
 * - 할당된 태스크 (Phase 향후 구현)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { User } from '../../stores/authStore';
import { AxiosError } from 'axios';

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  /**
   * 사용자 정보 가져오기
   */
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('사용자 ID가 제공되지 않았습니다.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await axiosInstance.get<User>(`/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ detail: string }>;

        if (axiosError.response?.status === 404) {
          setError('사용자를 찾을 수 없습니다.');
        } else if (axiosError.response?.status === 403) {
          setError('사용자 정보를 조회할 권한이 없습니다.');
        } else if (axiosError.message === 'Network Error') {
          setError('서버에 연결할 수 없습니다.');
        } else {
          setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  /**
   * 뒤로 가기
   */
  const handleBack = () => {
    navigate('/users');
  };

  /**
   * 수정 페이지로 이동
   */
  const handleEdit = () => {
    navigate(`/users/${userId}/edit`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            사용자 정보를 불러오는 중...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error || '사용자를 찾을 수 없습니다.'}</Alert>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleBack}
          >
            목록으로
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            수정
          </Button>
        </Box>

        {/* 사용자 정보 카드 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mr: 3,
                  bgcolor: 'primary.main',
                  fontSize: 40,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" component="h1">
                    {user.full_name || user.username}
                  </Typography>
                  {user.is_superuser && (
                    <Chip
                      icon={<AdminIcon />}
                      label="관리자"
                      color="warning"
                      sx={{ ml: 2 }}
                    />
                  )}
                  <Chip
                    label={user.is_active ? '활성' : '비활성'}
                    color={user.is_active ? 'success' : 'error'}
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="body1" color="text.secondary">
                  @{user.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 상세 정보 */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  사용자 ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  #{user.id}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  이메일
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user.email}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  이름
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user.full_name || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  권한
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user.is_superuser ? '관리자' : '일반 사용자'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  계정 상태
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user.is_active ? '활성' : '비활성'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  가입일
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(user.created_at).toLocaleString('ko-KR')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  마지막 업데이트
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(user.updated_at).toLocaleString('ko-KR')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  마지막 로그인
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString('ko-KR')
                    : '기록 없음'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 활동 로그 - 향후 구현 */}
        <Paper sx={{ mt: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">활동 로그</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            활동 로그 기능은 향후 구현될 예정입니다.
          </Typography>
        </Paper>

        {/* 할당된 태스크 - 향후 구현 */}
        <Paper sx={{ mt: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">할당된 태스크</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            할당된 태스크 목록은 향후 구현될 예정입니다.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserDetail;
