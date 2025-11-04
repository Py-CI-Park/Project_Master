/**
 * Login Page
 *
 * 사용자 로그인 페이지
 * - OAuth2 Password Flow 사용
 * - Form validation
 * - Error handling
 * - Auto redirect after login
 */

import { useState, FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../../stores/authStore';
import axiosInstance from '../../api/axios';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginError {
  detail: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, setLoading, isLoading } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [error, setError] = useState<string>('');

  /**
   * 폼 입력 핸들러
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 에러 메시지 초기화
    if (error) setError('');
  };

  /**
   * 로그인 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // OAuth2 Password Flow: application/x-www-form-urlencoded
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('username', formData.username);
      formDataEncoded.append('password', formData.password);

      // 로그인 API 호출
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/login`,
        formDataEncoded,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token } = response.data;

      // 현재 사용자 정보 조회
      const userResponse = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // 스토어에 로그인 정보 저장
      login(access_token, refresh_token, userResponse.data);

      // 대시보드로 이동
      navigate('/');
    } catch (err) {
      const axiosError = err as AxiosError<LoginError>;

      if (axiosError.response?.status === 401) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (axiosError.response?.status === 400) {
        setError(axiosError.response.data.detail || '로그인에 실패했습니다.');
      } else if (axiosError.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* 로고 */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <LockOutlined sx={{ color: 'white', fontSize: 32 }} />
          </Box>

          {/* 제목 */}
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            로그인
          </Typography>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 로그인 폼 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="사용자명"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>

            {/* 회원가입 링크 */}
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                계정이 없으신가요? 회원가입
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* 하단 정보 */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {'Closed Network Project Manager v2.0'}
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
