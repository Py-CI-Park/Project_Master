/**
 * Project Types
 *
 * 프로젝트 관련 타입 정의
 */

/**
 * 프로젝트 상태
 */
export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

/**
 * 프로젝트 인터페이스
 */
export interface Project {
  id: number;
  name: string;
  description?: string;
  start_date: string; // ISO 8601 format
  end_date: string; // ISO 8601 format
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

/**
 * 프로젝트 생성 요청
 */
export interface ProjectCreate {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status?: ProjectStatus;
}

/**
 * 프로젝트 수정 요청
 */
export interface ProjectUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
}

/**
 * 프로젝트 상태 라벨 매핑
 */
export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  planning: '계획 중',
  in_progress: '진행 중',
  on_hold: '보류',
  completed: '완료',
  cancelled: '취소',
};

/**
 * 프로젝트 상태 색상 매핑
 */
export const ProjectStatusColors: Record<ProjectStatus, string> = {
  planning: '#1976d2', // blue
  in_progress: '#2e7d32', // green
  on_hold: '#ed6c02', // orange
  completed: '#9c27b0', // purple
  cancelled: '#d32f2f', // red
};
