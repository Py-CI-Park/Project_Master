/**
 * Calendar Event Types
 *
 * FullCalendar 기반 캘린더 이벤트 타입 정의
 */

import type { EventInput } from '@fullcalendar/core';
import type { Task } from './task';

/**
 * 이벤트 타입
 */
export type CalendarEventType = 'task_start' | 'task_end' | 'milestone' | 'enabler' | 'custom';

/**
 * 캘린더 이벤트 확장 속성
 */
export interface CalendarEventExtendedProps {
  eventType: CalendarEventType;
  taskId?: number;
  enablerId?: number;
  status?: Task['status'];
  priority?: Task['priority'];
  description?: string;
  assignedTo?: string;
}

/**
 * 캘린더 이벤트 (FullCalendar EventInput 확장)
 */
export interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: CalendarEventExtendedProps;
}

/**
 * 캘린더 필터 옵션
 */
export interface CalendarFilterOptions {
  eventTypes?: CalendarEventType[];
  projectIds?: number[];
  assignees?: string[];
  statuses?: Task['status'][];
}

/**
 * 이벤트 타입별 색상
 */
export const EVENT_TYPE_COLORS: Record<CalendarEventType, { bg: string; border: string; text: string }> = {
  task_start: {
    bg: '#2196f3',
    border: '#1976d2',
    text: '#ffffff',
  },
  task_end: {
    bg: '#4caf50',
    border: '#388e3c',
    text: '#ffffff',
  },
  milestone: {
    bg: '#ff9800',
    border: '#f57c00',
    text: '#ffffff',
  },
  enabler: {
    bg: '#9c27b0',
    border: '#7b1fa2',
    text: '#ffffff',
  },
  custom: {
    bg: '#607d8b',
    border: '#455a64',
    text: '#ffffff',
  },
};

/**
 * 상태별 이벤트 색상 (task_start, task_end에서 사용)
 */
export const EVENT_STATUS_COLORS: Record<Task['status'], { bg: string; border: string }> = {
  not_started: {
    bg: '#9e9e9e',
    border: '#757575',
  },
  in_progress: {
    bg: '#2196f3',
    border: '#1976d2',
  },
  completed: {
    bg: '#4caf50',
    border: '#388e3c',
  },
  blocked: {
    bg: '#f44336',
    border: '#d32f2f',
  },
  on_hold: {
    bg: '#ff9800',
    border: '#f57c00',
  },
  cancelled: {
    bg: '#757575',
    border: '#616161',
  },
};

/**
 * 이벤트 타입별 라벨
 */
export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  task_start: '태스크 시작',
  task_end: '태스크 종료',
  milestone: '마일스톤',
  enabler: 'Enabler',
  custom: '사용자 정의',
};
