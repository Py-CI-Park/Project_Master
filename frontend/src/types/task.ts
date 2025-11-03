/**
 * Task Types
 *
 * 태스크 관련 타입 정의
 */

/**
 * 태스크 상태
 */
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

/**
 * 태스크 우선순위
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * 태스크 인터페이스
 */
export interface Task {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  start_date: string;
  end_date: string;
  duration_days?: number;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  is_milestone: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 태스크 생성 요청
 */
export interface TaskCreate {
  name: string;
  description?: string;
  project_id: number;
  start_date: string;
  end_date: string;
  duration_days?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  is_milestone?: boolean;
}

/**
 * 태스크 수정 요청
 */
export interface TaskUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  is_milestone?: boolean;
}
