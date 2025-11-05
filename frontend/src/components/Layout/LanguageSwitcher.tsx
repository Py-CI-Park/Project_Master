/**
 * LanguageSwitcher Component
 *
 * 언어 전환 컴포넌트 - 한국어/영어 지원
 */

import { useState, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 현재 선택된 언어
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  // 메뉴 열기
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 메뉴 닫기
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 언어 변경
  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* 언어 전환 버튼 */}
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="언어 전환"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <LanguageIcon />
      </IconButton>

      {/* 언어 선택 메뉴 */}
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Typography variant="caption" color="text.secondary">
            언어 선택 / Select Language
          </Typography>
        </MenuItem>

        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === currentLanguage.code}
          >
            <ListItemIcon>
              {language.code === currentLanguage.code && (
                <Typography variant="body2" color="primary">
                  ✓
                </Typography>
              )}
            </ListItemIcon>
            <ListItemText
              primary={language.nativeName}
              secondary={language.name}
              primaryTypographyProps={{
                fontWeight: language.code === currentLanguage.code ? 600 : 400,
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
