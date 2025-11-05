/**
 * Notification Types
 *
 * 알림 시스템 관련 타입 정의
 */

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_entity_type?: string | null;
  related_entity_id?: number | null;
  project_id?: number | null;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationList {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface NotificationUpdate {
  is_read: boolean;
}
