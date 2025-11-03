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
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
