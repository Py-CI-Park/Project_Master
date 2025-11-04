/**
 * useDependencies Custom Hook
 *
 * 태스크 의존성 데이터 페칭 및 상태 관리
 */

import { useState, useCallback } from 'react';
import type { Dependency, DependencyCreate } from '../types';
import {
  getDependencies,
  createDependency,
  deleteDependency,
} from '../services';

export const useDependencies = (projectId?: number) => {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 의존성 목록 조회
   */
  const fetchDependencies = useCallback(async (pid?: number, skip = 0, limit = 100) => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId) {
      setError('프로젝트 ID가 필요합니다');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDependencies(targetProjectId, skip, limit);
      setDependencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '의존성 목록 조회 실패');
      console.error('Failed to fetch dependencies:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * 새 의존성 생성
   */
  const addDependency = useCallback(async (data: DependencyCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newDependency = await createDependency(data);
      setDependencies((prev) => [...prev, newDependency]);
      return newDependency;
    } catch (err) {
      setError(err instanceof Error ? err.message : '의존성 생성 실패');
      console.error('Failed to create dependency:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 의존성 삭제
   */
  const removeDependency = useCallback(async (dependencyId: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDependency(dependencyId);
      setDependencies((prev) => prev.filter((d) => d.id !== dependencyId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '의존성 삭제 실패');
      console.error('Failed to delete dependency:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dependencies,
    loading,
    error,
    fetchDependencies,
    addDependency,
    removeDependency,
  };
};
