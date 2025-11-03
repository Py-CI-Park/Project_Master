/**
 * Enabler Types
 *
 * Enabler(Key Enabler) 관련 타입 정의
 */

/**
 * Enabler Type
 */
export type EnablerType =
  | 'document'
  | 'equipment'
  | 'approval'
  | 'resource'
  | 'license'
  | 'training';

/**
 * Enabler Status
 */
export type EnablerStatus =
  | 'requested'
  | 'in_progress'
  | 'delivered'
  | 'delayed'
  | 'cancelled';

/**
 * Enabler Criticality
 */
export type EnablerCriticality = 'low' | 'medium' | 'high' | 'critical';

/**
 * Enabler 인터페이스
 */
export interface Enabler {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  type: EnablerType;
  planned_delivery_date: string;
  actual_delivery_date?: string;
  status: EnablerStatus;
  criticality: EnablerCriticality;
  responsible_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Enabler 생성 요청 인터페이스
 */
export interface EnablerCreate {
  project_id: number;
  name: string;
  description?: string;
  type: EnablerType;
  planned_delivery_date: string;
  actual_delivery_date?: string;
  status?: EnablerStatus;
  criticality?: EnablerCriticality;
  responsible_person?: string;
  notes?: string;
}

/**
 * Enabler 수정 요청 인터페이스
 */
export interface EnablerUpdate {
  name?: string;
  description?: string;
  type?: EnablerType;
  planned_delivery_date?: string;
  actual_delivery_date?: string;
  status?: EnablerStatus;
  criticality?: EnablerCriticality;
  responsible_person?: string;
  notes?: string;
}

/**
 * Enabler 타입 레이블
 */
export const EnablerTypeLabels: Record<EnablerType, string> = {
  document: '문서',
  equipment: '장비',
  approval: '승인',
  resource: '리소스',
  license: '라이선스',
  training: '교육',
};

/**
 * Enabler 상태 레이블
 */
export const EnablerStatusLabels: Record<EnablerStatus, string> = {
  requested: '요청됨',
  in_progress: '진행 중',
  delivered: '전달 완료',
  delayed: '지연됨',
  cancelled: '취소됨',
};

/**
 * Enabler 상태 색상
 */
export const EnablerStatusColors: Record<EnablerStatus, string> = {
  requested: '#9e9e9e',
  in_progress: '#2196f3',
  delivered: '#4caf50',
  delayed: '#ff9800',
  cancelled: '#f44336',
};

/**
 * Enabler 중요도 레이블
 */
export const EnablerCriticalityLabels: Record<EnablerCriticality, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  critical: '긴급',
};

/**
 * Enabler 중요도 색상
 */
export const EnablerCriticalityColors: Record<EnablerCriticality, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#ff5722',
  critical: '#d32f2f',
};
