/**
 * useEnablers Custom Hook
 *
 * Enabler 데이터 페칭 및 상태 관리
 */

import { useState, useCallback } from 'react';
import type { Enabler, EnablerCreate, EnablerUpdate } from '../types';
import {
  getEnablers,
  getEnabler,
  createEnabler,
  updateEnabler,
  deleteEnabler,
} from '../services';

export const useEnablers = (projectId?: number) => {
  const [enablers, setEnablers] = useState<Enabler[]>([]);
  const [currentEnabler, setCurrentEnabler] = useState<Enabler | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Enabler 목록 조회
   */
  const fetchEnablers = useCallback(async (pid?: number, skip = 0, limit = 100) => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId) {
      setError('프로젝트 ID가 필요합니다');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getEnablers(targetProjectId, skip, limit);
      setEnablers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enabler 목록 조회 실패');
      console.error('Failed to fetch enablers:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * 특정 Enabler 조회
   */
  const fetchEnabler = useCallback(async (pid: number, enablerId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEnabler(pid, enablerId);
      setCurrentEnabler(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enabler 조회 실패');
      console.error('Failed to fetch enabler:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 새 Enabler 생성
   */
  const addEnabler = useCallback(async (data: EnablerCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newEnabler = await createEnabler(data);
      setEnablers((prev) => [...prev, newEnabler]);
      return newEnabler;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enabler 생성 실패');
      console.error('Failed to create enabler:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enabler 수정
   */
  const modifyEnabler = useCallback(
    async (pid: number, enablerId: number, data: EnablerUpdate) => {
      try {
        setLoading(true);
        setError(null);
        const updatedEnabler = await updateEnabler(pid, enablerId, data);
        setEnablers((prev) =>
          prev.map((e) => (e.id === enablerId ? updatedEnabler : e))
        );
        if (currentEnabler?.id === enablerId) {
          setCurrentEnabler(updatedEnabler);
        }
        return updatedEnabler;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enabler 수정 실패');
        console.error('Failed to update enabler:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [currentEnabler]
  );

  /**
   * Enabler 삭제
   */
  const removeEnabler = useCallback(
    async (pid: number, enablerId: number) => {
      try {
        setLoading(true);
        setError(null);
        await deleteEnabler(pid, enablerId);
        setEnablers((prev) => prev.filter((e) => e.id !== enablerId));
        if (currentEnabler?.id === enablerId) {
          setCurrentEnabler(null);
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enabler 삭제 실패');
        console.error('Failed to delete enabler:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentEnabler]
  );

  return {
    enablers,
    currentEnabler,
    loading,
    error,
    fetchEnablers,
    fetchEnabler,
    addEnabler,
    modifyEnabler,
    removeEnabler,
  };
};
