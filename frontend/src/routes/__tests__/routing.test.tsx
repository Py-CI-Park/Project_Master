/**
 * Routing Integration Tests
 *
 * 라우팅 통합 테스트
 */

import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../test/utils';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { ProjectList } from '../../pages/Projects';

describe('Routing', () => {
  it('should render Dashboard on root path', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Dashboard />,
        },
      ],
      {
        initialEntries: ['/'],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/대시보드/i)).toBeInTheDocument();
  });

  it('should render ProjectList on /projects path', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/projects',
          element: <ProjectList />,
        },
      ],
      {
        initialEntries: ['/projects'],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('프로젝트 목록')).toBeInTheDocument();

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
  });

  it('should handle navigation between routes', () => {
    const routes = [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/projects',
        element: <ProjectList />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);

    // Start at Dashboard
    expect(screen.getByText(/대시보드/i)).toBeInTheDocument();

    // Navigate to projects
    router.navigate('/projects');

    // Now should see ProjectList
    waitFor(() => {
      expect(screen.getByText('프로젝트 목록')).toBeInTheDocument();
    });
  });
});
