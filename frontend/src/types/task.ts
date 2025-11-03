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
  duration_days: number;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number; // 0-100
  assignee?: string;
  is_milestone: boolean;
  color?: string;
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
  assignee?: string;
  is_milestone?: boolean;
  color?: string;
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
  assignee?: string;
  is_milestone?: boolean;
  color?: string;
}

/**
 * Task 상태 레이블
 */
export const TaskStatusLabels: Record<TaskStatus, string> = {
  not_started: '시작 전',
  in_progress: '진행 중',
  completed: '완료',
  blocked: '차단됨',
};

/**
 * Task 상태 색상
 */
export const TaskStatusColors: Record<TaskStatus, string> = {
  not_started: '#9e9e9e',
  in_progress: '#2196f3',
  completed: '#4caf50',
  blocked: '#f44336',
};

/**
 * Task 우선순위 레이블
 */
export const TaskPriorityLabels: Record<TaskPriority, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  critical: '긴급',
};

/**
 * Task 우선순위 색상
 */
export const TaskPriorityColors: Record<TaskPriority, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#ff5722',
  critical: '#d32f2f',
};
