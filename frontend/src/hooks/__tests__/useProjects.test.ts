/**
 * useProjects Hook Tests
 *
 * useProjects 커스텀 훅 테스트
 */

import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '../useProjects';

describe('useProjects', () => {
  it('should initialize with empty projects array', () => {
    const { result } = renderHook(() => useProjects());

    expect(result.current.projects).toEqual([]);
    expect(result.current.currentProject).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch projects successfully', async () => {
    const { result } = renderHook(() => useProjects());

    // Call fetchProjects
    result.current.fetchProjects();

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toHaveLength(2);
    expect(result.current.projects[0].name).toBe('Test Project 1');
    expect(result.current.projects[1].name).toBe('Test Project 2');
    expect(result.current.error).toBeNull();
  });

  it('should handle loading state', async () => {
    const { result } = renderHook(() => useProjects());

    // Start fetching
    result.current.fetchProjects();

    // Should be loading immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Wait for completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should fetch a single project', async () => {
    const { result } = renderHook(() => useProjects());

    // Fetch single project
    const project = await result.current.fetchProject(1);

    await waitFor(() => {
      expect(result.current.currentProject).not.toBeNull();
    });

    expect(result.current.currentProject?.id).toBe(1);
    expect(result.current.currentProject?.name).toBe('Test Project 1');
    expect(project).not.toBeNull();
    expect(project?.id).toBe(1);
  });

  it('should add a new project', async () => {
    const { result } = renderHook(() => useProjects());

    // First fetch existing projects
    result.current.fetchProjects();

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });

    // Add new project
    const newProject = await result.current.addProject({
      name: 'New Project',
      description: 'New Description',
      start_date: '2025-03-01',
      end_date: '2025-12-31',
      status: 'planning',
    });

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(3);
    });

    expect(newProject).not.toBeNull();
    expect(newProject?.name).toBe('New Project');
  });

  it('should update a project', async () => {
    const { result } = renderHook(() => useProjects());

    // First fetch projects
    result.current.fetchProjects();

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });

    // Update project
    const updatedProject = await result.current.modifyProject(1, {
      name: 'Updated Project Name',
    });

    expect(updatedProject).not.toBeNull();
    expect(updatedProject?.name).toBe('Updated Project Name');

    await waitFor(() => {
      const project = result.current.projects.find((p) => p.id === 1);
      expect(project?.name).toBe('Updated Project Name');
    });
  });

  it('should delete a project', async () => {
    const { result } = renderHook(() => useProjects());

    // First fetch projects
    result.current.fetchProjects();

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });

    // Delete project
    const success = await result.current.removeProject(1);

    expect(success).toBe(true);

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(1);
    });

    expect(result.current.projects.find((p) => p.id === 1)).toBeUndefined();
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useProjects());

    // Try to fetch non-existent project
    const project = await result.current.fetchProject(999);

    expect(project).toBeNull();
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });
});
