/**
 * React Router Configuration
 *
 * 애플리케이션의 라우팅 설정
 */

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import Dashboard from '../pages/Dashboard';
import { ProjectList, ProjectForm } from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import { TaskList, TaskForm, TaskDetail } from '../pages/Tasks';
import { EnablerList, EnablerForm, EnablerDetail } from '../pages/Enablers';

/**
 * 라우터 설정
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'projects',
        element: <ProjectList />,
      },
      {
        path: 'projects/new',
        element: <ProjectForm />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetail />,
      },
      {
        path: 'projects/:projectId/edit',
        element: <ProjectForm />,
      },
      {
        path: 'projects/:projectId/gantt',
        element: <ProjectDetail />, // 탭으로 처리될 예정
      },
      {
        path: 'projects/:projectId/calendar',
        element: <ProjectDetail />, // 탭으로 처리될 예정
      },
      {
        path: 'projects/:projectId/dependencies',
        element: <ProjectDetail />, // 탭으로 처리될 예정
      },
      {
        path: 'projects/:projectId/tasks',
        element: <TaskList />,
      },
      {
        path: 'projects/:projectId/tasks/new',
        element: <TaskForm />,
      },
      {
        path: 'projects/:projectId/tasks/:taskId',
        element: <TaskDetail />,
      },
      {
        path: 'projects/:projectId/tasks/:taskId/edit',
        element: <TaskForm />,
      },
      {
        path: 'projects/:projectId/enablers',
        element: <EnablerList />,
      },
      {
        path: 'projects/:projectId/enablers/new',
        element: <EnablerForm />,
      },
      {
        path: 'projects/:projectId/enablers/:enablerId',
        element: <EnablerDetail />,
      },
      {
        path: 'projects/:projectId/enablers/:enablerId/edit',
        element: <EnablerForm />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
