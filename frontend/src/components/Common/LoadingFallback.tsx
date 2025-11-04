/**
 * LoadingFallback Component
 *
 * React.lazy Suspense용 로딩 컴포넌트
 */

import { Box, CircularProgress, Typography } from '@mui/material';

export interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback = ({ message = '로딩 중...' }: LoadingFallbackProps) => {
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
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
