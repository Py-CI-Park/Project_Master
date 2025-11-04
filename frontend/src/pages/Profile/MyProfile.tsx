/**
 * My Profile Page
 *
 * 현재 로그인한 사용자의 프로필 정보를 보고 수정하는 페이지
 * - 사용자 정보 표시 및 수정
 * - 비밀번호 변경
 * - 프로필 업데이트
 */

import { useState, useEffect, FormEvent } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import axiosInstance from '../../api/axios';
import { AxiosError } from 'axios';
import ChangePassword from '../../components/Profile/ChangePassword';

interface ProfileFormData {
  email: string;
  full_name: string;
}

interface UpdateError {
  detail: string;
}

const MyProfile = () => {
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState<ProfileFormData>({
    email: '',
    full_name: '',
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>({
    email: '',
    full_name: '',
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      const data = {
        email: user.email || '',
        full_name: user.full_name || '',
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  /**
   * 폼 입력 핸들러
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 메시지 초기화
    if (error) setError('');
    if (success) setSuccess('');
  };

  /**
   * 프로필 업데이트 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // 내 정보 수정 API 호출
      const response = await axiosInstance.put('/users/me', formData);

      // Zustand 스토어 업데이트
      updateUser(response.data);

      // 원본 데이터 업데이트
      setOriginalData(formData);

      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
    } catch (err) {
      const axiosError = err as AxiosError<UpdateError>;

      if (axiosError.response?.status === 400) {
        const detail = axiosError.response.data.detail;
        if (detail.includes('Email')) {
          setError('이미 사용 중인 이메일 주소입니다.');
        } else {
          setError(detail || '프로필 업데이트에 실패했습니다.');
        }
      } else if (axiosError.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('프로필 업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 수정 취소 핸들러
   */
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  /**
   * 수정 모드 시작
   */
  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  if (!user) {
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            내 프로필
          </Typography>
        </Box>

        {/* 성공/에러 메시지 */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 프로필 정보 카드 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mr: 3,
                      bgcolor: 'primary.main',
                      fontSize: 32,
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{user.full_name || user.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* 프로필 수정 폼 */}
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* 사용자명 (읽기 전용) */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="사용자명"
                        value={user.username}
                        disabled
                        helperText="사용자명은 변경할 수 없습니다"
                      />
                    </Grid>

                    {/* 이메일 */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="이메일"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                        required
                      />
                    </Grid>

                    {/* 이름 */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="이름"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                      />
                    </Grid>

                    {/* 계정 정보 (읽기 전용) */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="계정 상태"
                        value={user.is_active ? '활성' : '비활성'}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="권한"
                        value={user.is_superuser ? '관리자' : '일반 사용자'}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="가입일"
                        value={new Date(user.created_at).toLocaleDateString('ko-KR')}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="마지막 로그인"
                        value={
                          user.last_login
                            ? new Date(user.last_login).toLocaleString('ko-KR')
                            : '기록 없음'
                        }
                        disabled
                      />
                    </Grid>

                    {/* 버튼 그룹 */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {!isEditing ? (
                          <Button
                            variant="contained"
                            onClick={handleEdit}
                            startIcon={<PersonIcon />}
                          >
                            프로필 수정
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              onClick={handleCancel}
                              disabled={isLoading}
                              startIcon={<CancelIcon />}
                            >
                              취소
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={isLoading}
                              startIcon={
                                isLoading ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  <SaveIcon />
                                )
                              }
                            >
                              {isLoading ? '저장 중...' : '저장'}
                            </Button>
                          </>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 비밀번호 변경 섹션 */}
          <Grid item xs={12}>
            <ChangePassword />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default MyProfile;
