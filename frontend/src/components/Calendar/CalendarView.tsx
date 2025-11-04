/**
 * CalendarView Component
 *
 * FullCalendar 기반 캘린더 뷰 컴포넌트
 * React.memo로 최적화됨
 */

import { useEffect, useState, memo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { Box, Paper, Typography } from '@mui/material';
import type { Task } from '../../types';
import type { CalendarEvent, CalendarFilterOptions } from '../../types/calendar';
import {
  transformTasksToCalendarEvents,
  filterCalendarEvents,
} from '../../utils/calendarTransformer';
import EventModal from './EventModal';

export interface CalendarViewProps {
  tasks: Task[];
  filters?: CalendarFilterOptions;
}

const CalendarView = ({ tasks, filters }: CalendarViewProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Task를 CalendarEvent로 변환 및 필터링
  useEffect(() => {
    const calendarEvents = transformTasksToCalendarEvents(tasks);
    const filteredEvents = filters
      ? filterCalendarEvents(calendarEvents, filters)
      : calendarEvents;
    setEvents(filteredEvents);
  }, [tasks, filters]);

  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps as CalendarEvent['extendedProps'],
    };
    setSelectedEvent(calendarEvent);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>표시할 태스크가 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        프로젝트 캘린더
      </Typography>

      <Box sx={{ '& .fc': { fontSize: '0.9rem' } }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          locale="ko"
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          displayEventTime={false}
          buttonText={{
            today: '오늘',
            month: '월',
            week: '주',
            day: '일',
          }}
        />
      </Box>

      {/* 이벤트 상세 모달 */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Paper>
  );
};

export default memo(CalendarView);
