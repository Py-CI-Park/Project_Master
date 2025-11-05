/**
 * Loading Component
 *
 * 로딩 스피너 컴포넌트
 */

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
  message?: string;
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({ message, size = 40 }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {displayMessage && (
        <Typography variant="body2" color="text.secondary">
          {displayMessage}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
