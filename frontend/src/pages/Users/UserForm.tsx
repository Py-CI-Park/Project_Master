/**
 * User Form Page
 *
 * 사용자 정보 수정 페이지 (관리자 전용)
 * - 사용자 정보 수정
 * - 권한 변경 (is_active, is_superuser)
 * - 관리자만 접근 가능
 */

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { User, useAuthStore } from '../../stores/authStore';
import { AxiosError } from 'axios';

interface UserFormData {
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

const UserForm = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    is_active: true,
    is_superuser: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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
        const userData = response.data;
        setUser(userData);
        setFormData({
          email: userData.email,
          full_name: userData.full_name || '',
          is_active: userData.is_active,
          is_superuser: userData.is_superuser,
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ detail: string }>;

        if (axiosError.response?.status === 404) {
          setError('사용자를 찾을 수 없습니다.');
        } else if (axiosError.response?.status === 403) {
          setError('사용자 정보를 조회할 권한이 없습니다.');
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
   * 폼 입력 핸들러
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await axiosInstance.put(`/users/${userId}`, formData);
      setSuccess('사용자 정보가 성공적으로 업데이트되었습니다.');

      // 2초 후 상세 페이지로 이동
      setTimeout(() => {
        navigate(`/users/${userId}`);
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;

      if (axiosError.response?.status === 400) {
        const detail = axiosError.response.data.detail;
        if (detail.includes('Email')) {
          setError('이미 사용 중인 이메일 주소입니다.');
        } else {
          setError(detail || '사용자 정보 업데이트에 실패했습니다.');
        }
      } else if (axiosError.response?.status === 403) {
        setError('사용자 정보를 수정할 권한이 없습니다.');
      } else {
        setError('사용자 정보 업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    navigate(`/users/${userId}`);
  };

  // 관리자 권한 확인
  if (!currentUser?.is_superuser) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            이 페이지는 관리자만 접근할 수 있습니다.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/users')}
            sx={{ mt: 2 }}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

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

  if (error && !user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/users')}
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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(`/users/${userId}`)}
          >
            뒤로
          </Button>
          <Typography variant="h4" component="h1" sx={{ ml: 2 }}>
            사용자 정보 수정
          </Typography>
        </Box>

        {/* 성공/에러 메시지 */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 수정 폼 */}
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* 사용자명 (읽기 전용) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="사용자명"
                  value={user?.username || ''}
                  disabled
                  helperText="사용자명은 변경할 수 없습니다"
                />
              </Grid>

              {/* 사용자 ID (읽기 전용) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="사용자 ID"
                  value={user?.id || ''}
                  disabled
                />
              </Grid>

              {/* 이메일 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </Grid>

              {/* 이름 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="이름"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </Grid>

              {/* 계정 활성화 스위치 */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleChange}
                      name="is_active"
                      disabled={isSaving || user?.id === currentUser?.id}
                    />
                  }
                  label="계정 활성화"
                />
                {user?.id === currentUser?.id && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    자신의 계정은 비활성화할 수 없습니다
                  </Typography>
                )}
              </Grid>

              {/* 관리자 권한 스위치 */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_superuser}
                      onChange={handleChange}
                      name="is_superuser"
                      disabled={isSaving}
                    />
                  }
                  label="관리자 권한"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  관리자는 모든 사용자를 관리할 수 있습니다
                </Typography>
              </Grid>

              {/* 가입일 (읽기 전용) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="가입일"
                  value={user?.created_at ? new Date(user.created_at).toLocaleString('ko-KR') : ''}
                  disabled
                />
              </Grid>

              {/* 마지막 로그인 (읽기 전용) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="마지막 로그인"
                  value={
                    user?.last_login
                      ? new Date(user.last_login).toLocaleString('ko-KR')
                      : '기록 없음'
                  }
                  disabled
                />
              </Grid>

              {/* 버튼 그룹 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                    startIcon={<CancelIcon />}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSaving}
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserForm;
