/**
 * Enabler API Service
 *
 * Enabler API 호출 함수
 */

import { axiosInstance } from '../config/axiosConfig';
import type { Enabler, EnablerCreate, EnablerUpdate } from '../types';

/**
 * 프로젝트의 Enabler 목록 조회
 *
 * @param projectId - 프로젝트 ID
 * @param skip - 건너뛸 항목 수
 * @param limit - 조회할 최대 항목 수
 * @returns Promise<Enabler[]>
 */
export const getEnablers = async (
  projectId: number,
  skip = 0,
  limit = 100
): Promise<Enabler[]> => {
  const response = await axiosInstance.get<Enabler[]>(
    `/projects/${projectId}/enablers/`,
    {
      params: { skip, limit },
    }
  );
  return response.data;
};

/**
 * 특정 Enabler 조회
 *
 * @param projectId - 프로젝트 ID
 * @param enablerId - Enabler ID
 * @returns Promise<Enabler>
 */
export const getEnabler = async (
  projectId: number,
  enablerId: number
): Promise<Enabler> => {
  const response = await axiosInstance.get<Enabler>(
    `/projects/${projectId}/enablers/${enablerId}`
  );
  return response.data;
};

/**
 * 새 Enabler 생성
 *
 * @param data - Enabler 생성 데이터
 * @returns Promise<Enabler>
 */
export const createEnabler = async (data: EnablerCreate): Promise<Enabler> => {
  const response = await axiosInstance.post<Enabler>(
    `/projects/${data.project_id}/enablers/`,
    data
  );
  return response.data;
};

/**
 * Enabler 정보 수정
 *
 * @param projectId - 프로젝트 ID
 * @param enablerId - Enabler ID
 * @param data - 수정할 Enabler 데이터
 * @returns Promise<Enabler>
 */
export const updateEnabler = async (
  projectId: number,
  enablerId: number,
  data: EnablerUpdate
): Promise<Enabler> => {
  const response = await axiosInstance.put<Enabler>(
    `/projects/${projectId}/enablers/${enablerId}`,
    data
  );
  return response.data;
};

/**
 * Enabler 삭제
 *
 * @param projectId - 프로젝트 ID
 * @param enablerId - Enabler ID
 * @returns Promise<void>
 */
export const deleteEnabler = async (
  projectId: number,
  enablerId: number
): Promise<void> => {
  await axiosInstance.delete(`/projects/${projectId}/enablers/${enablerId}`);
};
