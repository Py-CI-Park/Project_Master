/**
 * Project List Page
 *
 * 프로젝트 목록 페이지
 */

import { Box, Typography, Container } from '@mui/material';

const ProjectList = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          프로젝트 목록
        </Typography>
        <Typography variant="body1" color="text.secondary">
          프로젝트 목록 페이지입니다.
        </Typography>
      </Box>
    </Container>
  );
};

export default ProjectList;
