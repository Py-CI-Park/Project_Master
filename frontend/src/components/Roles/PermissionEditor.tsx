/**
 * Permission Editor Component
 *
 * 권한 편집 컴포넌트
 * - 권한 카테고리별 체크박스 표시
 * - 전체 선택/해제 기능
 * - 권한 변경 시 콜백 호출
 */

import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import {
  Folder as ProjectIcon,
  Task as TaskIcon,
  Star as EnablerIcon,
  Person as UserIcon,
  Security as RoleIcon,
} from '@mui/icons-material';

interface PermissionEditorProps {
  permissions: Record<string, boolean>;
  onChange: (permissions: Record<string, boolean>) => void;
  disabled?: boolean;
}

// 권한 카테고리 정의
const PERMISSION_CATEGORIES = [
  {
    key: 'project',
    label: '프로젝트',
    icon: <ProjectIcon />,
    permissions: [
      { key: 'project:create', label: '생성' },
      { key: 'project:read', label: '조회' },
      { key: 'project:update', label: '수정' },
      { key: 'project:delete', label: '삭제' },
    ],
  },
  {
    key: 'task',
    label: '태스크',
    icon: <TaskIcon />,
    permissions: [
      { key: 'task:create', label: '생성' },
      { key: 'task:read', label: '조회' },
      { key: 'task:update', label: '수정' },
      { key: 'task:delete', label: '삭제' },
    ],
  },
  {
    key: 'enabler',
    label: '이네이블러',
    icon: <EnablerIcon />,
    permissions: [
      { key: 'enabler:create', label: '생성' },
      { key: 'enabler:read', label: '조회' },
      { key: 'enabler:update', label: '수정' },
      { key: 'enabler:delete', label: '삭제' },
    ],
  },
  {
    key: 'user',
    label: '사용자',
    icon: <UserIcon />,
    permissions: [
      { key: 'user:read', label: '조회' },
      { key: 'user:manage', label: '관리' },
    ],
  },
  {
    key: 'role',
    label: '역할',
    icon: <RoleIcon />,
    permissions: [
      { key: 'role:read', label: '조회' },
      { key: 'role:manage', label: '관리' },
    ],
  },
];

const PermissionEditor = ({
  permissions,
  onChange,
  disabled = false,
}: PermissionEditorProps) => {
  /**
   * 개별 권한 토글
   */
  const handlePermissionToggle = (permissionKey: string) => {
    const newPermissions = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    onChange(newPermissions);
  };

  /**
   * 카테고리 전체 선택/해제
   */
  const handleCategoryToggle = (categoryKey: string) => {
    const category = PERMISSION_CATEGORIES.find((c) => c.key === categoryKey);
    if (!category) return;

    const allSelected = category.permissions.every(
      (p) => permissions[p.key] === true
    );

    const newPermissions = { ...permissions };
    category.permissions.forEach((p) => {
      newPermissions[p.key] = !allSelected;
    });

    onChange(newPermissions);
  };

  /**
   * 카테고리 선택 상태 확인
   */
  const isCategorySelected = (categoryKey: string): boolean => {
    const category = PERMISSION_CATEGORIES.find((c) => c.key === categoryKey);
    if (!category) return false;

    return category.permissions.every((p) => permissions[p.key] === true);
  };

  /**
   * 카테고리 부분 선택 상태 확인
   */
  const isCategoryIndeterminate = (categoryKey: string): boolean => {
    const category = PERMISSION_CATEGORIES.find((c) => c.key === categoryKey);
    if (!category) return false;

    const selectedCount = category.permissions.filter(
      (p) => permissions[p.key] === true
    ).length;

    return selectedCount > 0 && selectedCount < category.permissions.length;
  };

  /**
   * 전체 선택
   */
  const handleSelectAll = () => {
    const newPermissions: Record<string, boolean> = {};
    PERMISSION_CATEGORIES.forEach((category) => {
      category.permissions.forEach((permission) => {
        newPermissions[permission.key] = true;
      });
    });
    onChange(newPermissions);
  };

  /**
   * 전체 해제
   */
  const handleDeselectAll = () => {
    const newPermissions: Record<string, boolean> = {};
    PERMISSION_CATEGORIES.forEach((category) => {
      category.permissions.forEach((permission) => {
        newPermissions[permission.key] = false;
      });
    });
    onChange(newPermissions);
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">권한 설정</Typography>
        <Box>
          <Button size="small" onClick={handleSelectAll} disabled={disabled} sx={{ mr: 1 }}>
            전체 선택
          </Button>
          <Button size="small" onClick={handleDeselectAll} disabled={disabled}>
            전체 해제
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 권한 그리드 */}
      <Grid container spacing={2}>
        {PERMISSION_CATEGORIES.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.key}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {/* 카테고리 헤더 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ mr: 1, color: 'primary.main' }}>{category.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {category.label}
                </Typography>
              </Box>

              {/* 카테고리 전체 선택 체크박스 */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCategorySelected(category.key)}
                    indeterminate={isCategoryIndeterminate(category.key)}
                    onChange={() => handleCategoryToggle(category.key)}
                    disabled={disabled}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    전체
                  </Typography>
                }
              />

              <Divider sx={{ my: 1 }} />

              {/* 개별 권한 체크박스 */}
              <FormGroup>
                {category.permissions.map((permission) => (
                  <FormControlLabel
                    key={permission.key}
                    control={
                      <Checkbox
                        checked={permissions[permission.key] === true}
                        onChange={() => handlePermissionToggle(permission.key)}
                        disabled={disabled}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {permission.label}
                      </Typography>
                    }
                    sx={{ ml: 2 }}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 권한 요약 */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          선택된 권한: {Object.values(permissions).filter((v) => v === true).length}개
        </Typography>
      </Box>
    </Box>
  );
};

export default PermissionEditor;
