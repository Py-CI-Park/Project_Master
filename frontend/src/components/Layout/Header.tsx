/**
 * Header Component
 *
 * 앱 바, 네비게이션, 다크 모드 토글을 포함하는 헤더 컴포넌트
 */

import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { mode, toggleTheme } = useTheme();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* 메뉴 버튼 (모바일) */}
        <IconButton
          color="inherit"
          aria-label="메뉴 열기"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* 앱 타이틀 */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          프로젝트 관리 시스템
        </Typography>

        {/* 다크 모드 토글 */}
        <Box>
          <IconButton color="inherit" onClick={toggleTheme} aria-label="테마 전환">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
