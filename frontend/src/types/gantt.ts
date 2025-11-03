/**
 * Gantt Chart Type Definitions
 *
 * Frappe Gantt 라이브러리용 TypeScript 타입 정의
 */

/**
 * Gantt 뷰 모드
 */
export type GanttViewMode = 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month' | 'Year';

/**
 * Gantt Task 인터페이스
 */
export interface GanttTask {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD 형식
  end: string; // YYYY-MM-DD 형식
  progress: number; // 0-100
  dependencies?: string; // 쉼표로 구분된 task id 목록
  custom_class?: string; // CSS 클래스
}

/**
 * Gantt 옵션
 */
export interface GanttOptions {
  header_height?: number;
  column_width?: number;
  step?: number;
  view_modes?: GanttViewMode[];
  bar_height?: number;
  bar_corner_radius?: number;
  arrow_curve?: number;
  padding?: number;
  view_mode?: GanttViewMode;
  date_format?: string;
  popup_trigger?: 'click' | 'hover';
  custom_popup_html?: ((task: GanttTask) => string) | null;
  language?: string;
  on_click?: (task: GanttTask) => void;
  on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
  on_progress_change?: (task: GanttTask, progress: number) => void;
  on_view_change?: (mode: GanttViewMode) => void;
}

/**
 * Task 상태별 CSS 클래스
 */
export const TASK_STATUS_CLASSES: Record<string, string> = {
  not_started: 'gantt-task-not-started',
  in_progress: 'gantt-task-in-progress',
  completed: 'gantt-task-completed',
  on_hold: 'gantt-task-on-hold',
  cancelled: 'gantt-task-cancelled',
};

/**
 * Task 우선순위별 CSS 클래스
 */
export const TASK_PRIORITY_CLASSES: Record<string, string> = {
  low: 'gantt-task-priority-low',
  medium: 'gantt-task-priority-medium',
  high: 'gantt-task-priority-high',
  urgent: 'gantt-task-priority-urgent',
};
