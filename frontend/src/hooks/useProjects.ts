/**
 * useProjects Custom Hook
 *
 * 프로젝트 데이터 페칭 및 상태 관리
 */

import { useState, useCallback } from 'react';
import type { Project, ProjectCreate, ProjectUpdate } from '../types';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../services';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 프로젝트 목록 조회
   */
  const fetchProjects = useCallback(async (skip = 0, limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects(skip, limit);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 목록 조회 실패');
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 특정 프로젝트 조회
   */
  const fetchProject = useCallback(async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProject(projectId);
      setCurrentProject(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 조회 실패');
      console.error('Failed to fetch project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 새 프로젝트 생성
   */
  const addProject = useCallback(async (data: ProjectCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await createProject(data);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 생성 실패');
      console.error('Failed to create project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 프로젝트 수정
   */
  const modifyProject = useCallback(async (projectId: number, data: ProjectUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await updateProject(projectId, data);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 수정 실패');
      console.error('Failed to update project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  /**
   * 프로젝트 삭제
   */
  const removeProject = useCallback(async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로젝트 삭제 실패');
      console.error('Failed to delete project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    addProject,
    modifyProject,
    removeProject,
  };
};
