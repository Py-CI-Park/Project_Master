/**
 * Dependency Type Definitions
 *
 * 태스크 의존성 타입 정의
 */

/**
 * 의존성 타입
 * - FS (Finish-Start): 선행 태스크 완료 후 후속 태스크 시작
 * - SS (Start-Start): 선행 태스크 시작과 동시에 후속 태스크 시작
 * - FF (Finish-Finish): 선행 태스크 완료와 동시에 후속 태스크 완료
 * - SF (Start-Finish): 선행 태스크 시작 후 후속 태스크 완료
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

/**
 * 의존성 인터페이스
 */
export interface Dependency {
  id: number;
  predecessor_task_id: number;
  successor_task_id: number;
  dependency_type: DependencyType;
  lag_days: number;
  created_at: string;
}

/**
 * 의존성 생성 요청
 */
export interface DependencyCreate {
  predecessor_task_id: number;
  successor_task_id: number;
  dependency_type?: DependencyType;
  lag_days?: number;
}

/**
 * 의존성 수정 요청
 */
export interface DependencyUpdate {
  dependency_type?: DependencyType;
  lag_days?: number;
}

/**
 * 의존성 타입 한글 라벨
 */
export const DependencyTypeLabels: Record<DependencyType, string> = {
  FS: '완료-시작 (FS)',
  SS: '시작-시작 (SS)',
  FF: '완료-완료 (FF)',
  SF: '시작-완료 (SF)',
};

/**
 * 의존성 타입 설명
 */
export const DependencyTypeDescriptions: Record<DependencyType, string> = {
  FS: '선행 태스크 완료 후 후속 태스크 시작',
  SS: '선행 태스크 시작과 동시에 후속 태스크 시작',
  FF: '선행 태스크 완료와 동시에 후속 태스크 완료',
  SF: '선행 태스크 시작 후 후속 태스크 완료',
};
