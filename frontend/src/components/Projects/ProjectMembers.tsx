/**
 * Project Members Component
 *
 * 프로젝트 멤버 관리 컴포넌트
 * - 프로젝트에 할당된 멤버 목록 표시
 * - 멤버 추가/제거
 * - 역할 할당/변경
 */

import { useState, useEffect } from 'react';
import {
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManageIcon,
  Group as GroupIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { useAuthStore, User } from '../../stores/authStore';
import { AxiosError } from 'axios';

interface Role {
  id: number;
  name: string;
  description: string | null;
}

interface UserRoleWithDetails {
  user_id: number;
  role_id: number;
  project_id: number | null;
  assigned_at: string;
  role: Role;
}

interface ProjectMembersProps {
  projectId: number;
}

const ProjectMembers = ({ projectId }: ProjectMembersProps) => {
  const { user: currentUser } = useAuthStore();

  const [members, setMembers] = useState<UserRoleWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // 멤버 추가 다이얼로그
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | ''>('');
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);

  /**
   * 멤버 목록 가져오기
   */
  const fetchMembers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get<UserRoleWithDetails[]>(
        `/roles/projects/${projectId}/members`
      );
      setMembers(response.data);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(
        axiosError.response?.data?.detail ||
          '프로젝트 멤버 목록을 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 사용자 목록 가져오기
   */
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users', {
        params: { limit: 100 },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  /**
   * 역할 목록 가져오기
   */
  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get<Role[]>('/roles');
      setRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchUsers();
    fetchRoles();
  }, [projectId]);

  /**
   * 멤버 추가 다이얼로그 열기
   */
  const handleAddDialogOpen = () => {
    setSelectedUser(null);
    setSelectedRole('');
    setAddDialogOpen(true);
  };

  /**
   * 멤버 추가 다이얼로그 닫기
   */
  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  /**
   * 멤버 추가
   */
  const handleAddMember = async () => {
    if (!selectedUser || !selectedRole) {
      setError('사용자와 역할을 선택해주세요.');
      return;
    }

    setIsAddingMember(true);
    setError('');

    try {
      await axiosInstance.post(`/roles/${selectedRole}/assign`, {
        user_id: selectedUser.id,
        role_id: selectedRole,
        project_id: projectId,
      });

      setSuccess(`${selectedUser.username}님이 프로젝트에 추가되었습니다.`);
      fetchMembers();
      handleAddDialogClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(
        axiosError.response?.data?.detail ||
          '멤버 추가 중 오류가 발생했습니다.'
      );
    } finally {
      setIsAddingMember(false);
    }
  };

  /**
   * 멤버 제거
   */
  const handleRemoveMember = async (member: UserRoleWithDetails) => {
    if (!confirm(`${member.role.name} 역할을 제거하시겠습니까?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/roles/${member.role_id}/revoke`, {
        params: {
          user_id: member.user_id,
          project_id: projectId,
        },
      });

      setSuccess('멤버 역할이 제거되었습니다.');
      fetchMembers();
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(
        axiosError.response?.data?.detail ||
          '멤버 제거 중 오류가 발생했습니다.'
      );
    }
  };

  /**
   * 역할 아이콘 반환
   */
  const getRoleIcon = (roleName: string) => {
    if (roleName === 'Admin') return <AdminIcon fontSize="small" />;
    if (roleName === 'Project Manager')
      return <ManageIcon fontSize="small" />;
    if (roleName === 'Team Member') return <GroupIcon fontSize="small" />;
    if (roleName === 'Viewer') return <ViewIcon fontSize="small" />;
    return <GroupIcon fontSize="small" />;
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

  // 이미 추가된 멤버의 user_id 목록
  const memberUserIds = members.map((m) => m.user_id);

  // 추가 가능한 사용자 목록 (이미 추가되지 않은 사용자)
  const availableUsers = users.filter(
    (user) => !memberUserIds.includes(user.id)
  );

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">프로젝트 멤버</Typography>
        {currentUser?.is_superuser && (
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={handleAddDialogOpen}
          >
            멤버 추가
          </Button>
        )}
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

      {/* 멤버 목록 테이블 */}
      <Paper variant="outlined">
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : members.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              프로젝트에 할당된 멤버가 없습니다.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>사용자 ID</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>할당일</TableCell>
                  {currentUser?.is_superuser && (
                    <TableCell align="center">작업</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={`${member.user_id}-${member.role_id}`} hover>
                    <TableCell>{member.user_id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoleIcon(member.role.name)}
                        <Chip
                          label={member.role.name}
                          color={getRoleColor(member.role.name)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(member.assigned_at).toLocaleDateString('ko-KR')}
                    </TableCell>
                    {currentUser?.is_superuser && (
                      <TableCell align="center">
                        <Tooltip title="역할 제거">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* 멤버 추가 다이얼로그 */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>프로젝트 멤버 추가</DialogTitle>
        <DialogContent>
          {/* 사용자 선택 */}
          <Autocomplete
            options={availableUsers}
            getOptionLabel={(option) =>
              `${option.username} (${option.email || 'N/A'})`
            }
            value={selectedUser}
            onChange={(_, newValue) => setSelectedUser(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="사용자 선택"
                margin="normal"
                required
              />
            )}
            disabled={isAddingMember}
          />

          {/* 역할 선택 */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>역할 선택</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as number)}
              label="역할 선택"
              disabled={isAddingMember}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} disabled={isAddingMember}>
            취소
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={isAddingMember || !selectedUser || !selectedRole}
          >
            {isAddingMember ? '추가 중...' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectMembers;
