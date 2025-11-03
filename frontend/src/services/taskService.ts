/**
 * Task API Service
 *
 * 태스크 API 호출 함수
 */

import { axiosInstance } from '../config/axiosConfig';
import type { Task, TaskCreate, TaskUpdate } from '../types';

/**
 * 프로젝트의 태스크 목록 조회
 *
 * @param projectId - 프로젝트 ID
 * @param skip - 건너뛸 항목 수
 * @param limit - 조회할 최대 항목 수
 * @returns Promise<Task[]>
 */
export const getTasks = async (
  projectId: number,
  skip = 0,
  limit = 100
): Promise<Task[]> => {
  const response = await axiosInstance.get<Task[]>(`/projects/${projectId}/tasks/`, {
    params: { skip, limit },
  });
  return response.data;
};

/**
 * 특정 태스크 조회
 *
 * @param projectId - 프로젝트 ID
 * @param taskId - 태스크 ID
 * @returns Promise<Task>
 */
export const getTask = async (projectId: number, taskId: number): Promise<Task> => {
  const response = await axiosInstance.get<Task>(`/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};

/**
 * 새 태스크 생성
 *
 * @param data - 태스크 생성 데이터
 * @returns Promise<Task>
 */
export const createTask = async (data: TaskCreate): Promise<Task> => {
  const response = await axiosInstance.post<Task>(
    `/projects/${data.project_id}/tasks/`,
    data
  );
  return response.data;
};

/**
 * 태스크 정보 수정
 *
 * @param projectId - 프로젝트 ID
 * @param taskId - 태스크 ID
 * @param data - 수정할 태스크 데이터
 * @returns Promise<Task>
 */
export const updateTask = async (
  projectId: number,
  taskId: number,
  data: TaskUpdate
): Promise<Task> => {
  const response = await axiosInstance.put<Task>(
    `/projects/${projectId}/tasks/${taskId}`,
    data
  );
  return response.data;
};

/**
 * 태스크 삭제
 *
 * @param projectId - 프로젝트 ID
 * @param taskId - 태스크 ID
 * @returns Promise<void>
 */
export const deleteTask = async (projectId: number, taskId: number): Promise<void> => {
  await axiosInstance.delete(`/projects/${projectId}/tasks/${taskId}`);
};
