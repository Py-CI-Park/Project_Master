/**
 * React Router Configuration with Code Splitting
 *
 * 애플리케이션의 라우팅 설정 (React.lazy 코드 스플리팅 적용)
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '../components/Layout';
import { LoadingFallback } from '../components/Common';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy-loaded page components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProjectList = lazy(() => import('../pages/Projects/ProjectList'));
const ProjectForm = lazy(() => import('../pages/Projects/ProjectForm'));
const ProjectDetail = lazy(() => import('../pages/ProjectDetail'));
const TaskList = lazy(() => import('../pages/Tasks/TaskList'));
const TaskForm = lazy(() => import('../pages/Tasks/TaskForm'));
const TaskDetail = lazy(() => import('../pages/Tasks/TaskDetail'));
const EnablerList = lazy(() => import('../pages/Enablers/EnablerList'));
const EnablerForm = lazy(() => import('../pages/Enablers/EnablerForm'));
const EnablerDetail = lazy(() => import('../pages/Enablers/EnablerDetail'));

// Auth pages
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));

/**
 * Suspense Wrapper Component
 */
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
};

/**
 * 라우터 설정
 */
export const router = createBrowserRouter([
  // 인증 라우트 (보호되지 않음)
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <SuspenseWrapper>
        <Register />
      </SuspenseWrapper>
    ),
  },

  // 보호된 라우트 (인증 필요)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dashboard',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'projects',
        element: (
          <SuspenseWrapper>
            <ProjectList />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/new',
        element: (
          <SuspenseWrapper>
            <ProjectForm />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId',
        element: (
          <SuspenseWrapper>
            <ProjectDetail />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/edit',
        element: (
          <SuspenseWrapper>
            <ProjectForm />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/gantt',
        element: (
          <SuspenseWrapper>
            <ProjectDetail />
          </SuspenseWrapper>
        ), // 탭으로 처리될 예정
      },
      {
        path: 'projects/:projectId/calendar',
        element: (
          <SuspenseWrapper>
            <ProjectDetail />
          </SuspenseWrapper>
        ), // 탭으로 처리될 예정
      },
      {
        path: 'projects/:projectId/dependencies',
        element: (
          <SuspenseWrapper>
            <ProjectDetail />
          </SuspenseWrapper>
        ), // 탭으로 처리될 예정
      },
      {
        path: 'projects/:projectId/tasks',
        element: (
          <SuspenseWrapper>
            <TaskList />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/tasks/new',
        element: (
          <SuspenseWrapper>
            <TaskForm />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/tasks/:taskId',
        element: (
          <SuspenseWrapper>
            <TaskDetail />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/tasks/:taskId/edit',
        element: (
          <SuspenseWrapper>
            <TaskForm />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/enablers',
        element: (
          <SuspenseWrapper>
            <EnablerList />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/enablers/new',
        element: (
          <SuspenseWrapper>
            <EnablerForm />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/enablers/:enablerId',
        element: (
          <SuspenseWrapper>
            <EnablerDetail />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'projects/:projectId/enablers/:enablerId/edit',
        element: (
          <SuspenseWrapper>
            <EnablerForm />
          </SuspenseWrapper>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
