/**
 * Calendar Data Transformer
 *
 * Task 데이터를 FullCalendar 이벤트 형식으로 변환
 */

import type { Task } from '../types';
import type { CalendarEvent, CalendarFilterOptions } from '../types/calendar';
import { EVENT_TYPE_COLORS, EVENT_STATUS_COLORS } from '../types/calendar';

/**
 * Task 배열을 CalendarEvent 배열로 변환
 *
 * @param tasks - 변환할 Task 배열
 * @returns CalendarEvent 배열
 */
export const transformTasksToCalendarEvents = (tasks: Task[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  tasks.forEach((task) => {
    // 태스크 시작 이벤트
    const statusColors = EVENT_STATUS_COLORS[task.status];

    events.push({
      id: `task-start-${task.id}`,
      title: `시작: ${task.name}`,
      start: task.start_date,
      allDay: true,
      backgroundColor: statusColors.bg,
      borderColor: statusColors.border,
      textColor: '#ffffff',
      extendedProps: {
        eventType: 'task_start',
        taskId: task.id,
        status: task.status,
        priority: task.priority,
        description: task.description,
      },
    });

    // 태스크 종료 이벤트
    events.push({
      id: `task-end-${task.id}`,
      title: `종료: ${task.name}`,
      start: task.end_date,
      allDay: true,
      backgroundColor: statusColors.bg,
      borderColor: statusColors.border,
      textColor: '#ffffff',
      extendedProps: {
        eventType: 'task_end',
        taskId: task.id,
        status: task.status,
        priority: task.priority,
        description: task.description,
      },
    });
  });

  return events;
};

/**
 * 캘린더 이벤트 필터링
 *
 * @param events - 전체 이벤트 배열
 * @param filters - 필터 옵션
 * @returns 필터링된 이벤트 배열
 */
export const filterCalendarEvents = (
  events: CalendarEvent[],
  filters: CalendarFilterOptions
): CalendarEvent[] => {
  return events.filter((event) => {
    // 이벤트 타입 필터
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      if (!filters.eventTypes.includes(event.extendedProps.eventType)) {
        return false;
      }
    }

    // 상태 필터
    if (filters.statuses && filters.statuses.length > 0) {
      if (!event.extendedProps.status || !filters.statuses.includes(event.extendedProps.status)) {
        return false;
      }
    }

    // 담당자 필터
    if (filters.assignees && filters.assignees.length > 0) {
      if (!event.extendedProps.assignedTo || !filters.assignees.includes(event.extendedProps.assignedTo)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * 이벤트 색상 가져오기
 *
 * @param eventType - 이벤트 타입
 * @param status - 태스크 상태 (선택사항)
 * @returns 색상 객체
 */
export const getEventColor = (
  eventType: CalendarEvent['extendedProps']['eventType'],
  status?: Task['status']
) => {
  // 태스크 이벤트는 상태별 색상 사용
  if ((eventType === 'task_start' || eventType === 'task_end') && status) {
    return EVENT_STATUS_COLORS[status];
  }

  // 그 외는 이벤트 타입별 색상 사용
  return EVENT_TYPE_COLORS[eventType];
};
