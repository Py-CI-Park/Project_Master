/**
 * Role Form Page
 *
 * 역할 생성/수정 페이지 (관리자 전용)
 * - 역할 이름, 설명 입력
 * - 권한 편집 (PermissionEditor 사용)
 * - 생성/수정 API 호출
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';
import { AxiosError } from 'axios';
import PermissionEditor from '../../components/Roles/PermissionEditor';

interface RoleFormData {
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

const RoleForm = () => {
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const { user: currentUser } = useAuthStore();

  const isEdit = Boolean(roleId);

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: {},
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // 권한 없음 체크
  useEffect(() => {
    if (!currentUser?.is_superuser) {
      setError('역할 관리 페이지는 관리자만 접근할 수 있습니다.');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [currentUser, navigate]);

  /**
   * 역할 데이터 가져오기 (수정 모드)
   */
  useEffect(() => {
    if (!isEdit || !currentUser?.is_superuser) return;

    const fetchRole = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await axiosInstance.get(`/roles/${roleId}`);
        const role = response.data;

        setFormData({
          name: role.name,
          description: role.description || '',
          permissions: role.permissions,
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ detail: string }>;
        setError(
          axiosError.response?.data?.detail ||
            '역할 정보를 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [isEdit, roleId, currentUser]);

  /**
   * 입력 필드 변경 핸들러
   */
  const handleInputChange = (field: keyof RoleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 유효성 검사 에러 초기화
    if (validationErrors[field as 'name' | 'description']) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * 권한 변경 핸들러
   */
  const handlePermissionsChange = (permissions: Record<string, boolean>) => {
    setFormData((prev) => ({ ...prev, permissions }));
  };

  /**
   * 유효성 검사
   */
  const validate = (): boolean => {
    const errors: { name?: string; description?: string } = {};

    if (!formData.name.trim()) {
      errors.name = '역할 이름을 입력해주세요.';
    } else if (formData.name.length > 50) {
      errors.name = '역할 이름은 50자 이하로 입력해주세요.';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = '역할 설명은 500자 이하로 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (isEdit) {
        // 역할 수정
        await axiosInstance.put(`/roles/${roleId}`, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          permissions: formData.permissions,
        });
      } else {
        // 역할 생성
        await axiosInstance.post('/roles', {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          permissions: formData.permissions,
        });
      }

      navigate('/roles');
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;

      if (axiosError.response?.status === 400) {
        if (axiosError.response.data.detail?.includes('already exists')) {
          setValidationErrors({ name: '이미 존재하는 역할 이름입니다.' });
        } else {
          setError(axiosError.response.data.detail);
        }
      } else if (axiosError.response?.status === 403) {
        setError('역할을 생성/수정할 권한이 없습니다.');
      } else {
        setError(
          isEdit
            ? '역할 수정 중 오류가 발생했습니다.'
            : '역할 생성 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    navigate('/roles');
  };

  if (!currentUser?.is_superuser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || '권한이 없습니다.'}</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? '역할 수정' : '역할 생성'}
      </Typography>

      {/* 알림 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 폼 */}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        {/* 역할 이름 */}
        <TextField
          label="역할 이름"
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={Boolean(validationErrors.name)}
          helperText={validationErrors.name}
          required
          fullWidth
          margin="normal"
          disabled={isSaving}
          inputProps={{ maxLength: 50 }}
        />

        {/* 역할 설명 */}
        <TextField
          label="역할 설명"
          name="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={Boolean(validationErrors.description)}
          helperText={validationErrors.description}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          disabled={isSaving}
          inputProps={{ maxLength: 500 }}
        />

        {/* 권한 편집기 */}
        <Box sx={{ mt: 3 }}>
          <PermissionEditor
            permissions={formData.permissions}
            onChange={handlePermissionsChange}
            disabled={isSaving}
          />
        </Box>

        {/* 버튼 */}
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : isEdit ? '수정' : '생성'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RoleForm;
