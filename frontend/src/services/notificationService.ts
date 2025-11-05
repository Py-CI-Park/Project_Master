/**
 * Notification API Service
 *
 * 알림 API 호출 함수
 */

import { axiosInstance } from '../config/axiosConfig';
import type { Notification, NotificationList } from '../types/notification';

/**
 * 내 알림 목록 조회
 *
 * @param skip - 건너뛸 항목 수
 * @param limit - 조회할 최대 항목 수
 * @param unread_only - 읽지 않은 알림만 조회
 * @returns Promise<NotificationList>
 */
export const getNotifications = async (
  skip = 0,
  limit = 50,
  unread_only = false
): Promise<NotificationList> => {
  const response = await axiosInstance.get<NotificationList>('/api/v1/notifications/', {
    params: { skip, limit, unread_only },
  });
  return response.data;
};

/**
 * 읽지 않은 알림 개수 조회
 *
 * @returns Promise<{ unread_count: number }>
 */
export const getUnreadCount = async (): Promise<{ unread_count: number }> => {
  const response = await axiosInstance.get<{ unread_count: number }>(
    '/api/v1/notifications/unread-count'
  );
  return response.data;
};

/**
 * 알림 읽음 처리
 *
 * @param notificationId - 알림 ID
 * @returns Promise<Notification>
 */
export const markAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await axiosInstance.put<Notification>(
    `/api/v1/notifications/${notificationId}/read`
  );
  return response.data;
};

/**
 * 전체 알림 읽음 처리
 *
 * @returns Promise<{ count: number; message: string }>
 */
export const markAllAsRead = async (): Promise<{ count: number; message: string }> => {
  const response = await axiosInstance.put<{ count: number; message: string }>(
    '/api/v1/notifications/read-all'
  );
  return response.data;
};

/**
 * 알림 삭제
 *
 * @param notificationId - 알림 ID
 * @returns Promise<void>
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/notifications/${notificationId}`);
};
