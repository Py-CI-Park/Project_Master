/**
 * Project Service
 *
 * 프로젝트 API 통신 서비스
 */

import axiosInstance from '../config/axiosConfig';
import type { Project, ProjectCreate, ProjectUpdate } from '../types';

/**
 * 프로젝트 목록 조회
 */
export const getProjects = async (skip = 0, limit = 100): Promise<Project[]> => {
  const response = await axiosInstance.get<Project[]>('/projects/', {
    params: { skip, limit },
  });
  return response.data;
};

/**
 * 프로젝트 상세 조회
 */
export const getProject = async (projectId: number): Promise<Project> => {
  const response = await axiosInstance.get<Project>(`/projects/${projectId}`);
  return response.data;
};

/**
 * 프로젝트 생성
 */
export const createProject = async (data: ProjectCreate): Promise<Project> => {
  const response = await axiosInstance.post<Project>('/projects/', data);
  return response.data;
};

/**
 * 프로젝트 수정
 */
export const updateProject = async (
  projectId: number,
  data: ProjectUpdate
): Promise<Project> => {
  const response = await axiosInstance.put<Project>(`/projects/${projectId}`, data);
  return response.data;
};

/**
 * 프로젝트 삭제
 */
export const deleteProject = async (projectId: number): Promise<void> => {
  await axiosInstance.delete(`/projects/${projectId}`);
};

export default {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
