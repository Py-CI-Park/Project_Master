/**
 * Dashboard Page
 *
 * 프로젝트 관리 시스템의 메인 대시보드
 */

import { Box, Typography, Container } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary">
          프로젝트 관리 시스템 대시보드 페이지입니다.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
