/**
 * Project Detail Page
 *
 * 프로젝트 상세 페이지
 */

import { useParams } from 'react-router-dom';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import { GanttChart } from '../../components/Gantt';
import { DependencyGraph, DependencyMatrix } from '../../components/Graph';
import { CalendarView } from '../../components/Calendar';
import { useTasks } from '../../hooks';
import { transformTasksToGantt } from '../../utils/ganttTransformer';
import type { GanttTask } from '../../types';

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
  const { tasks, fetchTasks, modifyTask } = useTasks(Number(projectId));
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchTasks(Number(projectId));
    }
  }, [projectId, fetchTasks]);

  useEffect(() => {
    if (tasks.length > 0) {
      const transformedTasks = transformTasksToGantt(tasks);
      setGanttTasks(transformedTasks);
    }
  }, [tasks]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGanttDateChange = async (task: GanttTask, start: Date, end: Date) => {
    if (!projectId) return;

    try {
      await modifyTask(Number(projectId), Number(task.id), {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
      });
      // Refresh tasks
      fetchTasks(Number(projectId));
    } catch (err) {
      console.error('Failed to update task dates:', err);
    }
  };

  const handleGanttProgressChange = async (task: GanttTask, progress: number) => {
    if (!projectId) return;

    try {
      await modifyTask(Number(projectId), Number(task.id), {
        progress,
      });
      // Refresh tasks
      fetchTasks(Number(projectId));
    } catch (err) {
      console.error('Failed to update task progress:', err);
    }
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
          <GanttChart
            tasks={ganttTasks}
            onDateChange={handleGanttDateChange}
            onProgressChange={handleGanttProgressChange}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <CalendarView tasks={tasks} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 3 }}>
            <DependencyGraph tasks={tasks} />
          </Box>
          <DependencyMatrix tasks={tasks} />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ProjectDetail;
