/**
 * useNotifications Custom Hook
 *
 * 알림 데이터 페칭 및 상태 관리
 */

import { useState, useCallback, useEffect } from 'react';
import type { Notification, NotificationList } from '../types/notification';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 알림 목록 조회
   */
  const fetchNotifications = useCallback(async (skip = 0, limit = 50, unread_only = false) => {
    try {
      setLoading(true);
      setError(null);
      const data: NotificationList = await getNotifications(skip, limit, unread_only);
      setNotifications(data.notifications);
      setTotal(data.total);
      setUnreadCount(data.unread_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 목록 조회 실패');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 읽지 않은 알림 개수 조회
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  /**
   * 알림 읽음 처리
   */
  const readNotification = useCallback(async (notificationId: number) => {
    try {
      setError(null);
      await markAsRead(notificationId);

      // 상태 업데이트
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 읽음 처리 실패');
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  /**
   * 전체 알림 읽음 처리
   */
  const readAllNotifications = useCallback(async () => {
    try {
      setError(null);
      const result = await markAllAsRead();

      // 모든 알림을 읽음 상태로 업데이트
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '전체 읽음 처리 실패');
      console.error('Failed to mark all as read:', err);
      return null;
    }
  }, []);

  /**
   * 알림 삭제
   */
  const removeNotification = useCallback(async (notificationId: number) => {
    try {
      setError(null);
      await deleteNotification(notificationId);

      // 상태에서 제거
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
      setTotal((prev) => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알림 삭제 실패');
      console.error('Failed to delete notification:', err);
      return false;
    }
  }, []);

  return {
    notifications,
    total,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    readNotification,
    readAllNotifications,
    removeNotification,
  };
};
