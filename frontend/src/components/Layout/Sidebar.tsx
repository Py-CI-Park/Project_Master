/**
 * Sidebar Component
 *
 * 사이드 메뉴 컴포넌트
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as ProjectIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  textKey: string;
  icon: React.ReactElement;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    textKey: 'navigation.dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    textKey: 'navigation.projects',
    icon: <ProjectIcon />,
    path: '/projects',
  },
];

const adminMenuItems: MenuItem[] = [
  {
    textKey: 'navigation.users',
    icon: <PeopleIcon />,
    path: '/users',
  },
  {
    textKey: 'navigation.roles',
    icon: <SecurityIcon />,
    path: '/roles',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose(); // 모바일에서 메뉴 클릭 시 사이드바 닫기
  };

  const drawer = (
    <>
      <Toolbar /> {/* 헤더 높이만큼 공간 확보 */}
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.textKey)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />

      {/* 관리자 전용 메뉴 */}
      {user?.is_superuser && (
        <>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('navigation.admin')}
            </Typography>
          </Box>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={t(item.textKey)} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}
    </>
  );

  return (
    <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
      {/* 모바일 Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // 모바일 성능 향상
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* 데스크톱 Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
