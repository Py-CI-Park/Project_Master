/**
 * Gantt Data Transformer
 *
 * Task 데이터를 Gantt 차트 형식으로 변환
 */

import type { Task } from '../types';
import type { GanttTask } from '../types/gantt';
import { TASK_STATUS_CLASSES, TASK_PRIORITY_CLASSES } from '../types/gantt';

/**
 * Task 배열을 GanttTask 배열로 변환
 *
 * @param tasks - 변환할 Task 배열
 * @returns GanttTask 배열
 */
export const transformTasksToGantt = (tasks: Task[]): GanttTask[] => {
  return tasks.map((task) => {
    // 상태 및 우선순위 기반 CSS 클래스 결정
    const statusClass = TASK_STATUS_CLASSES[task.status] || '';
    const priorityClass = TASK_PRIORITY_CLASSES[task.priority] || '';
    const customClass = `${statusClass} ${priorityClass}`.trim();

    return {
      id: task.id.toString(),
      name: task.name,
      start: task.start_date,
      end: task.end_date,
      progress: task.progress || 0,
      dependencies: task.dependencies?.map((d) => d.toString()).join(',') || undefined,
      custom_class: customClass || undefined,
    };
  });
};

/**
 * GanttTask를 Task 업데이트 데이터로 변환
 *
 * @param ganttTask - Gantt 차트에서 변경된 task
 * @returns Task 업데이트 객체
 */
export const transformGanttToTaskUpdate = (ganttTask: GanttTask) => {
  return {
    start_date: ganttTask.start,
    end_date: ganttTask.end,
    progress: ganttTask.progress,
  };
};

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 *
 * @param date - Date 객체 또는 날짜 문자열
 * @returns YYYY-MM-DD 형식 문자열
 */
export const formatDateForGantt = (date: Date | string): string => {
  if (typeof date === 'string') {
    return date.split('T')[0]; // ISO 문자열에서 날짜 부분만 추출
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gantt 차트용 커스텀 팝업 HTML 생성
 *
 * @param task - GanttTask 객체
 * @returns 팝업 HTML 문자열
 */
export const createCustomPopupHtml = (task: GanttTask): string => {
  return `
    <div class="gantt-popup">
      <div class="popup-title">${task.name}</div>
      <div class="popup-info">
        <div><strong>시작:</strong> ${task.start}</div>
        <div><strong>종료:</strong> ${task.end}</div>
        <div><strong>진행률:</strong> ${task.progress}%</div>
      </div>
    </div>
  `;
};
