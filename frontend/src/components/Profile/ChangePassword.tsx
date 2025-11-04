/**
 * Change Password Component
 *
 * 비밀번호 변경 컴포넌트
 * - 현재 비밀번호 확인
 * - 새 비밀번호 입력 및 검증
 * - 비밀번호 강도 표시
 */

import { useState, useEffect, FormEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  LinearProgress,
  Paper,
} from '@mui/material';
import { Lock as LockIcon, Save as SaveIcon } from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { AxiosError } from 'axios';

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordError {
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

const ChangePassword = () => {
  const [formData, setFormData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  /**
   * 비밀번호 강도 계산
   */
  useEffect(() => {
    if (formData.new_password) {
      setPasswordStrength(calculatePasswordStrength(formData.new_password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.new_password]);

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
    if (success) setSuccess('');
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

    // 현재 비밀번호
    if (!formData.current_password) {
      errors.current_password = '현재 비밀번호를 입력해주세요.';
    }

    // 새 비밀번호 검증
    if (formData.new_password.length < 8) {
      errors.new_password = '새 비밀번호는 최소 8자 이상이어야 합니다.';
    }

    // 현재 비밀번호와 새 비밀번호 같은지 확인
    if (formData.current_password === formData.new_password) {
      errors.new_password = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    // 비밀번호 확인 검증
    if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = '비밀번호가 일치하지 않습니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 비밀번호 변경 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 유효성 검증
    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // 비밀번호 변경 API 호출
      // Note: 백엔드에서 현재 비밀번호 검증 API가 필요할 수 있습니다.
      // 현재는 PUT /users/me를 사용하지만, 별도의 비밀번호 변경 엔드포인트가 필요할 수 있습니다.
      await axiosInstance.put('/users/me/password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      // 성공 메시지 표시
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');

      // 폼 초기화
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      const axiosError = err as AxiosError<PasswordError>;

      if (axiosError.response?.status === 400) {
        setError('현재 비밀번호가 올바르지 않습니다.');
      } else if (axiosError.response?.status === 404) {
        // 비밀번호 변경 엔드포인트가 아직 구현되지 않은 경우
        setError('비밀번호 변경 기능은 곧 구현될 예정입니다.');
      } else if (axiosError.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">비밀번호 변경</Typography>
      </Box>

      {/* 성공 메시지 */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 비밀번호 변경 폼 */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* 현재 비밀번호 */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="current_password"
          label="현재 비밀번호"
          type="password"
          autoComplete="current-password"
          value={formData.current_password}
          onChange={handleChange}
          disabled={isLoading}
          error={!!validationErrors.current_password}
          helperText={validationErrors.current_password}
        />

        {/* 새 비밀번호 */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="new_password"
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          value={formData.new_password}
          onChange={handleChange}
          disabled={isLoading}
          error={!!validationErrors.new_password}
          helperText={
            validationErrors.new_password ||
            '최소 8자 이상, 영문자, 숫자, 특수문자 포함 권장'
          }
        />

        {/* 비밀번호 강도 표시 */}
        {formData.new_password && (
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

        {/* 새 비밀번호 확인 */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirm_password"
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          value={formData.confirm_password}
          onChange={handleChange}
          disabled={isLoading}
          error={!!validationErrors.confirm_password}
          helperText={validationErrors.confirm_password}
        />

        {/* 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {isLoading ? '변경 중...' : '비밀번호 변경'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChangePassword;
