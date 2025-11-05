/**
 * NotificationDropdown Component
 *
 * 알림 드롭다운 컴포넌트 - 알림 목록 표시 및 관리
 */

import { useState, useEffect, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton as MuiIconButton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    readNotification,
    readAllNotifications,
    removeNotification,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // 컴포넌트 마운트 시 알림 목록 조회
  useEffect(() => {
    fetchNotifications(0, 10, false);
  }, [fetchNotifications]);

  // Popover 열기
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // 드롭다운 열 때마다 최신 알림 조회
    fetchNotifications(0, 10, false);
  };

  // Popover 닫기
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.is_read) {
      await readNotification(notification.id);
    }

    // 관련 페이지로 이동
    if (notification.related_entity_type && notification.related_entity_id) {
      switch (notification.related_entity_type) {
        case 'project':
          navigate(`/projects/${notification.related_entity_id}`);
          break;
        case 'task':
          if (notification.project_id) {
            navigate(`/projects/${notification.project_id}/tasks/${notification.related_entity_id}`);
          }
          break;
        case 'enabler':
          if (notification.project_id) {
            navigate(`/projects/${notification.project_id}/enablers/${notification.related_entity_id}`);
          }
          break;
        default:
          break;
      }
    }

    handleClose();
  };

  // 알림 삭제 처리
  const handleDelete = async (notificationId: number, event: MouseEvent) => {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    await removeNotification(notificationId);
  };

  // 전체 읽음 처리
  const handleMarkAllAsRead = async () => {
    await readAllNotifications();
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return t('notification.timeAgo.justNow');
    if (diffInMinutes < 60) return t('notification.timeAgo.minutesAgo', { count: diffInMinutes });
    if (diffInHours < 24) return t('notification.timeAgo.hoursAgo', { count: diffInHours });
    if (diffInDays < 7) return t('notification.timeAgo.daysAgo', { count: diffInDays });
    return date.toLocaleDateString();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      {/* 알림 아이콘 버튼 */}
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
        aria-label={t('header.unreadNotifications', { count: unreadCount })}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* 알림 드롭다운 */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1.5,
          },
        }}
      >
        {/* 헤더 */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            {t('notification.title')}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              {t('notification.markAllAsRead')}
            </Button>
          )}
        </Box>

        <Divider />

        {/* 알림 목록 */}
        <List sx={{ p: 0, maxHeight: 480, overflow: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('notification.noNotifications')}
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                disablePadding
                secondaryAction={
                  <MuiIconButton
                    edge="end"
                    aria-label={t('notification.delete')}
                    size="small"
                    onClick={(e) => handleDelete(notification.id, e)}
                  >
                    <CloseIcon fontSize="small" />
                  </MuiIconButton>
                }
                sx={{
                  bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemButton onClick={() => handleNotificationClick(notification)}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          fontWeight: notification.is_read ? 400 : 600,
                          pr: 1,
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>

        {/* 푸터 */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  navigate('/notifications');
                  handleClose();
                }}
              >
                {t('notification.viewAll')}
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
};

export default NotificationDropdown;
