/**
 * MSW Request Handlers
 *
 * API 모킹을 위한 MSW 핸들러
 */

import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock 데이터
const mockProjects = [
  {
    id: 1,
    name: 'Test Project 1',
    description: 'Test Description 1',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'active',
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  },
  {
    id: 2,
    name: 'Test Project 2',
    description: 'Test Description 2',
    start_date: '2025-02-01',
    end_date: '2025-11-30',
    status: 'planning',
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  },
];

const mockTasks = [
  {
    id: 1,
    project_id: 1,
    name: 'Test Task 1',
    description: 'Test Task Description',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    status: 'in_progress',
    priority: 'high',
    progress: 50,
    assigned_to: 'User 1',
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  },
];

const mockEnablers = [
  {
    id: 1,
    project_id: 1,
    name: 'Test Enabler',
    description: 'Test Enabler Description',
    type: 'document',
    planned_delivery_date: '2025-01-15',
    status: 'requested',
    criticality: 'medium',
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  },
];

export const handlers = [
  // Projects
  http.get(`${API_BASE}/projects/`, () => {
    return HttpResponse.json(mockProjects);
  }),

  http.get(`${API_BASE}/projects/:id`, ({ params }) => {
    const project = mockProjects.find((p) => p.id === Number(params.id));
    if (!project) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  http.post(`${API_BASE}/projects/`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newProject = {
      id: mockProjects.length + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.put(`${API_BASE}/projects/:id`, async ({ params, request }) => {
    const project = mockProjects.find((p) => p.id === Number(params.id));
    if (!project) {
      return new HttpResponse(null, { status: 404 });
    }
    const data = (await request.json()) as any;
    const updatedProject = {
      ...project,
      ...data,
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(updatedProject);
  }),

  http.delete(`${API_BASE}/projects/:id`, ({ params }) => {
    const project = mockProjects.find((p) => p.id === Number(params.id));
    if (!project) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Tasks
  http.get(`${API_BASE}/projects/:projectId/tasks/`, () => {
    return HttpResponse.json(mockTasks);
  }),

  http.get(`${API_BASE}/projects/:projectId/tasks/:id`, ({ params }) => {
    const task = mockTasks.find((t) => t.id === Number(params.id));
    if (!task) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(task);
  }),

  http.post(`${API_BASE}/projects/:projectId/tasks/`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newTask = {
      id: mockTasks.length + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newTask, { status: 201 });
  }),

  // Enablers
  http.get(`${API_BASE}/projects/:projectId/enablers/`, () => {
    return HttpResponse.json(mockEnablers);
  }),

  http.get(`${API_BASE}/projects/:projectId/enablers/:id`, ({ params }) => {
    const enabler = mockEnablers.find((e) => e.id === Number(params.id));
    if (!enabler) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(enabler);
  }),

  http.post(`${API_BASE}/projects/:projectId/enablers/`, async ({ request }) => {
    const data = (await request.json()) as any;
    const newEnabler = {
      id: mockEnablers.length + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newEnabler, { status: 201 });
  }),
];
