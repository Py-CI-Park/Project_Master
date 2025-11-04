/**
 * Register Page
 *
 * 사용자 회원가입 페이지
 * - Form validation
 * - Password strength indicator
 * - Error handling
 * - Auto redirect to login after successful registration
 */

import { useState, FormEvent, useEffect } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import axios, { AxiosError } from 'axios';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

interface RegisterError {
  detail: string;
}

/**
 * 비밀번호 강도 계산
 */
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;

  return Math.min(strength, 100);
};

/**
 * 비밀번호 강도 색상
 */
const getPasswordStrengthColor = (strength: number): 'error' | 'warning' | 'success' => {
  if (strength < 40) return 'error';
  if (strength < 70) return 'warning';
  return 'success';
};

/**
 * 비밀번호 강도 텍스트
 */
const getPasswordStrengthText = (strength: number): string => {
  if (strength === 0) return '';
  if (strength < 40) return '약함';
  if (strength < 70) return '보통';
  return '강함';
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  /**
   * 비밀번호 강도 계산
   */
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

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
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * 유효성 검증
   */
  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    // 사용자명 검증
    if (formData.username.length < 3) {
      errors.username = '사용자명은 최소 3자 이상이어야 합니다.';
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    // 비밀번호 검증
    if (formData.password.length < 8) {
      errors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 회원가입 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // 유효성 검증
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // 회원가입 API 호출
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || null,
        }
      );

      // 성공 메시지 표시
      setSuccess(true);

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<RegisterError>;

      if (axiosError.response?.status === 400) {
        const detail = axiosError.response.data.detail;
        if (detail.includes('Username')) {
          setError('이미 사용 중인 사용자명입니다.');
        } else if (detail.includes('Email')) {
          setError('이미 사용 중인 이메일 주소입니다.');
        } else {
          setError(detail || '회원가입에 실패했습니다.');
        }
      } else if (axiosError.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      setIsLoading(false);
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
            <PersonAdd sx={{ color: 'white', fontSize: 32 }} />
          </Box>

          {/* 제목 */}
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            회원가입
          </Typography>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 성공 메시지 */}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              회원가입이 완료되었습니다. 로그인 페이지로 이동합니다...
            </Alert>
          )}

          {/* 회원가입 폼 */}
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
              disabled={isLoading || success}
              error={!!validationErrors.username}
              helperText={validationErrors.username || '최소 3자 이상'}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || success}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              id="full_name"
              label="이름 (선택)"
              name="full_name"
              autoComplete="name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={isLoading || success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading || success}
              error={!!validationErrors.password}
              helperText={validationErrors.password || '최소 8자 이상, 영문자, 숫자, 특수문자 포함 권장'}
            />

            {/* 비밀번호 강도 표시 */}
            {formData.password && (
              <Box sx={{ mt: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    비밀번호 강도
                  </Typography>
                  <Typography
                    variant="caption"
                    color={`${getPasswordStrengthColor(passwordStrength)}.main`}
                    fontWeight="bold"
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  color={getPasswordStrengthColor(passwordStrength)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading || success}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>

            {/* 로그인 링크 */}
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                이미 계정이 있으신가요? 로그인
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

export default Register;
