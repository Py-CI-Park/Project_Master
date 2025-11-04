/**
 * Role List Page
 *
 * 역할 관리 페이지 (관리자 전용)
 * - 역할 목록 테이블 표시
 * - 역할 생성/수정/삭제
 * - 권한 표시 및 관리
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManageIcon,
  Visibility as ViewIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { useAuthStore } from '../../stores/authStore';
import { AxiosError } from 'axios';

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Record<string, boolean>;
  created_at: string;
}

const RoleList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // 권한 없음 체크
  useEffect(() => {
    if (!currentUser?.is_superuser) {
      setError('역할 관리 페이지는 관리자만 접근할 수 있습니다.');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [currentUser, navigate]);

  /**
   * 역할 목록 가져오기
   */
  const fetchRoles = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get<Role[]>('/roles');
      setRoles(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;

      if (axiosError.response?.status === 403) {
        setError('역할 목록을 조회할 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (axiosError.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('역할 목록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.is_superuser) {
      fetchRoles();
    }
  }, [currentUser]);

  /**
   * 역할 삭제 확인 다이얼로그 열기
   */
  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  /**
   * 역할 삭제 확인
   */
  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await axiosInstance.delete(`/roles/${roleToDelete.id}`);
      setSuccess(`역할 "${roleToDelete.name}"이(가) 삭제되었습니다.`);
      fetchRoles();
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(
        axiosError.response?.data?.detail ||
          '역할 삭제 중 오류가 발생했습니다.'
      );
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  /**
   * 역할 삭제 취소
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  /**
   * 권한 개수 계산
   */
  const countPermissions = (permissions: Record<string, boolean>): number => {
    return Object.values(permissions).filter((v) => v === true).length;
  };

  /**
   * 역할 아이콘 반환
   */
  const getRoleIcon = (roleName: string) => {
    if (roleName === 'Admin') return <AdminIcon />;
    if (roleName === 'Project Manager') return <ManageIcon />;
    if (roleName === 'Team Member') return <GroupIcon />;
    if (roleName === 'Viewer') return <ViewIcon />;
    return <SecurityIcon />;
  };

  /**
   * 역할 색상 반환
   */
  const getRoleColor = (
    roleName: string
  ): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    if (roleName === 'Admin') return 'error';
    if (roleName === 'Project Manager') return 'warning';
    if (roleName === 'Team Member') return 'info';
    if (roleName === 'Viewer') return 'success';
    return 'default';
  };

  if (!currentUser?.is_superuser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || '권한이 없습니다.'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          역할 관리
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/roles/new')}
        >
          역할 추가
        </Button>
      </Box>

      {/* 알림 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* 역할 목록 테이블 */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : roles.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              역할이 없습니다. 새 역할을 추가해주세요.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>역할</TableCell>
                  <TableCell>설명</TableCell>
                  <TableCell align="center">권한 수</TableCell>
                  <TableCell align="center">생성일</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoleIcon(role.name)}
                        <Chip
                          label={role.name}
                          color={getRoleColor(role.name)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {role.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${countPermissions(role.permissions)}개`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(role.created_at).toLocaleDateString('ko-KR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="수정">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/roles/${role.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(role)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>역할 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            역할 <strong>{roleToDelete?.name}</strong>을(를) 정말 삭제하시겠습니까?
            <br />
            <br />
            이 작업은 되돌릴 수 없으며, 해당 역할이 할당된 사용자의 권한에
            영향을 줄 수 있습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoleList;
