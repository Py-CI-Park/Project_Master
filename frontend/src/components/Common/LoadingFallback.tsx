/**
 * LoadingFallback Component
 *
 * React.lazy Suspense용 로딩 컴포넌트
 */

import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback = ({ message }: LoadingFallbackProps) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        {displayMessage}
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
