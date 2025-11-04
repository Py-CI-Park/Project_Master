/**
 * User List Page
 *
 * 사용자 목록 페이지 (관리자 전용)
 * - 사용자 목록 테이블 표시
 * - 검색, 필터링, 정렬
 * - 페이지네이션
 * - 사용자 상세/수정/삭제
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
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { useAuthStore, User } from '../../stores/authStore';
import { AxiosError } from 'axios';

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const UserList = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  /**
   * 사용자 목록 가져오기
   */
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get<UsersResponse>('/users', {
        params: {
          skip: page * rowsPerPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
        },
      });

      setUsers(response.data.users);
      setTotalUsers(response.data.total);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;

      if (axiosError.response?.status === 403) {
        setError('사용자 목록을 조회할 권한이 없습니다. 관리자에게 문의하세요.');
      } else if (axiosError.message === 'Network Error') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 및 페이지/검색 변경 시 사용자 목록 가져오기
   */
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  /**
   * 검색 핸들러
   */
  const handleSearch = () => {
    setPage(0); // 검색 시 첫 페이지로 이동
    fetchUsers();
  };

  /**
   * 검색 입력 엔터 키 핸들러
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 페이지 변경 핸들러
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * 페이지당 행 수 변경 핸들러
   */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * 사용자 상세 보기
   */
  const handleViewUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  /**
   * 사용자 수정
   */
  const handleEditUser = (userId: number) => {
    navigate(`/users/${userId}/edit`);
  };

  /**
   * 사용자 삭제
   */
  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`정말로 "${username}" 사용자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      setSuccess(`"${username}" 사용자가 삭제되었습니다.`);
      fetchUsers(); // 목록 새로고침
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;

      if (axiosError.response?.status === 403) {
        setError('사용자를 삭제할 권한이 없습니다.');
      } else if (axiosError.response?.status === 400) {
        setError(axiosError.response.data.detail || '자신의 계정은 삭제할 수 없습니다.');
      } else {
        setError('사용자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 관리자 권한 확인
  if (!currentUser?.is_superuser) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            이 페이지는 관리자만 접근할 수 있습니다.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              사용자 관리
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/register')}
          >
            신규 사용자 추가
          </Button>
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

        {/* 검색 바 */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="사용자명 또는 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button variant="contained" onClick={handleSearch}>
                    검색
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 사용자 목록 테이블 */}
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              사용자 목록을 불러오는 중...
            </Typography>
          </Box>
        ) : users.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {searchQuery
                ? '검색 결과가 없습니다.'
                : '등록된 사용자가 없습니다.'}
            </Typography>
          </Paper>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>사용자명</TableCell>
                    <TableCell>이메일</TableCell>
                    <TableCell>이름</TableCell>
                    <TableCell align="center">권한</TableCell>
                    <TableCell align="center">상태</TableCell>
                    <TableCell>가입일</TableCell>
                    <TableCell align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {user.is_superuser ? (
                            <AdminIcon sx={{ mr: 1, color: 'warning.main' }} fontSize="small" />
                          ) : (
                            <PersonIcon sx={{ mr: 1, color: 'action.active' }} fontSize="small" />
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            {user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell align="center">
                        {user.is_superuser ? (
                          <Chip label="관리자" color="warning" size="small" />
                        ) : (
                          <Chip label="일반" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {user.is_active ? (
                          <Chip label="활성" color="success" size="small" />
                        ) : (
                          <Chip label="비활성" color="error" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="상세 보기">
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user.id)}
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="수정">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user.id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.id !== currentUser?.id && (
                          <Tooltip title="삭제">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <TablePagination
              component="div"
              count={totalUsers}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="페이지당 행 수:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / 총 ${count}개`
              }
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default UserList;
