/**
 * useTasks Custom Hook
 *
 * 태스크 데이터 페칭 및 상태 관리
 */

import { useState, useCallback } from 'react';
import type { Task, TaskCreate, TaskUpdate } from '../types';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../services';

export const useTasks = (projectId?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 태스크 목록 조회
   */
  const fetchTasks = useCallback(async (pid?: number, skip = 0, limit = 100) => {
    const targetProjectId = pid || projectId;
    if (!targetProjectId) {
      setError('프로젝트 ID가 필요합니다');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(targetProjectId, skip, limit);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '태스크 목록 조회 실패');
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * 특정 태스크 조회
   */
  const fetchTask = useCallback(async (pid: number, taskId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTask(pid, taskId);
      setCurrentTask(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '태스크 조회 실패');
      console.error('Failed to fetch task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 새 태스크 생성
   */
  const addTask = useCallback(async (data: TaskCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await createTask(data);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : '태스크 생성 실패');
      console.error('Failed to create task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 태스크 수정
   */
  const modifyTask = useCallback(async (pid: number, taskId: number, data: TaskUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await updateTask(pid, taskId, data);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
      if (currentTask?.id === taskId) {
        setCurrentTask(updatedTask);
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : '태스크 수정 실패');
      console.error('Failed to update task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentTask]);

  /**
   * 태스크 삭제
   */
  const removeTask = useCallback(async (pid: number, taskId: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteTask(pid, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (currentTask?.id === taskId) {
        setCurrentTask(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '태스크 삭제 실패');
      console.error('Failed to delete task:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentTask]);

  return {
    tasks,
    currentTask,
    loading,
    error,
    fetchTasks,
    fetchTask,
    addTask,
    modifyTask,
    removeTask,
  };
};
