/**
 * Project Detail Page
 *
 * 프로젝트 상세 페이지
 */

import { useParams } from 'react-router-dom';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          프로젝트 상세 - ID: {projectId}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="프로젝트 탭">
            <Tab label="개요" />
            <Tab label="태스크" />
            <Tab label="간트 차트" />
            <Tab label="캘린더" />
            <Tab label="의존성" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography>프로젝트 개요</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography>태스크 목록</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography>간트 차트</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Typography>캘린더</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Typography>의존성 그래프</Typography>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ProjectDetail;
