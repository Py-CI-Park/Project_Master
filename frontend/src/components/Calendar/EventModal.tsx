/**
 * EventModal Component
 *
 * 캘린더 이벤트 상세 정보 모달
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import type { CalendarEvent } from '../../types/calendar';
import { EVENT_TYPE_LABELS } from '../../types/calendar';

export interface EventModalProps {
  event: CalendarEvent;
  open: boolean;
  onClose: () => void;
}

const EventModal = ({ event, open, onClose }: EventModalProps) => {
  const { title, start, end, extendedProps } = event;
  const {
    eventType,
    taskId,
    status,
    priority,
    description,
  } = extendedProps;

  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status?: string) => {
    const statusLabels: Record<string, string> = {
      not_started: '미시작',
      in_progress: '진행중',
      completed: '완료',
      on_hold: '보류',
      cancelled: '취소',
    };
    return status ? statusLabels[status] || status : '-';
  };

  const getPriorityLabel = (priority?: string) => {
    const priorityLabels: Record<string, string> = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      urgent: '긴급',
    };
    return priority ? priorityLabels[priority] || priority : '-';
  };

  const getPriorityColor = (priority?: string): 'default' | 'primary' | 'warning' | 'error' => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'primary';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip
            label={EVENT_TYPE_LABELS[eventType]}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 날짜 정보 */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              날짜
            </Typography>
            <Typography variant="body1">
              {formatDate(start)}
              {end && ` ~ ${formatDate(end)}`}
            </Typography>
          </Box>

          <Divider />

          {/* 태스크 정보 */}
          {taskId && (
            <>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  태스크 ID
                </Typography>
                <Typography variant="body1">#{taskId}</Typography>
              </Box>

              {/* 상태 */}
              {status && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    상태
                  </Typography>
                  <Typography variant="body1">{getStatusLabel(status)}</Typography>
                </Box>
              )}

              {/* 우선순위 */}
              {priority && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    우선순위
                  </Typography>
                  <Chip
                    label={getPriorityLabel(priority)}
                    size="small"
                    color={getPriorityColor(priority)}
                  />
                </Box>
              )}

              {/* 설명 */}
              {description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    설명
                  </Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventModal;
