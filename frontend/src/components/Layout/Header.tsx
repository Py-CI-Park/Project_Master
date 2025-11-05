/**
 * Header Component
 *
 * 앱 바, 네비게이션, 다크 모드 토글, 알림, 언어 전환을 포함하는 헤더 컴포넌트
 */

import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { mode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* 메뉴 버튼 (모바일) */}
        <IconButton
          color="inherit"
          aria-label={t('header.menu')}
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* 앱 타이틀 */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t('common.appName')}
        </Typography>

        {/* 알림 드롭다운 */}
        <Box sx={{ mr: 1 }}>
          <NotificationDropdown />
        </Box>

        {/* 언어 전환 */}
        <Box sx={{ mr: 1 }}>
          <LanguageSwitcher />
        </Box>

        {/* 다크 모드 토글 */}
        <Box>
          <IconButton color="inherit" onClick={toggleTheme} aria-label={t('header.theme')}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
