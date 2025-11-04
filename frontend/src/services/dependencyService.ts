/**
 * Dependency API Service
 *
 * 태스크 의존성 관련 API 호출 함수
 */

import axiosInstance from '../config/axiosConfig';
import type { Dependency, DependencyCreate } from '../types';

/**
 * 프로젝트의 모든 의존성 조회
 *
 * @param projectId - 프로젝트 ID
 * @param skip - 건너뛸 레코드 수
 * @param limit - 최대 조회 레코드 수
 * @returns 의존성 목록
 */
export const getDependencies = async (
  projectId: number,
  skip = 0,
  limit = 100
): Promise<Dependency[]> => {
  const response = await axiosInstance.get<Dependency[]>(
    `/projects/${projectId}/dependencies/`,
    {
      params: { skip, limit },
    }
  );
  return response.data;
};

/**
 * 새 의존성 생성
 *
 * @param data - 의존성 생성 데이터
 * @returns 생성된 의존성
 */
export const createDependency = async (data: DependencyCreate): Promise<Dependency> => {
  const response = await axiosInstance.post<Dependency>('/dependencies/', data);
  return response.data;
};

/**
 * 의존성 삭제
 *
 * @param dependencyId - 의존성 ID
 */
export const deleteDependency = async (dependencyId: number): Promise<void> => {
  await axiosInstance.delete(`/dependencies/${dependencyId}`);
};
