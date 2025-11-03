/**
 * Report Types
 *
 * 리포트 관련 타입 정의
 */

import type { Task } from './task';

/**
 * 크리티컬 패스 태스크 정보
 */
export interface CriticalPathTask {
  task: Task;
  earlyStart: Date;
  earlyFinish: Date;
  lateStart: Date;
  lateFinish: Date;
  slack: number; // 여유 시간 (일)
  isCritical: boolean;
}

/**
 * 크리티컬 패스 분석 결과
 */
export interface CriticalPathAnalysis {
  criticalTasks: CriticalPathTask[];
  totalDuration: number; // 전체 프로젝트 기간 (일)
  risks: RiskItem[];
}

/**
 * 리스크 항목
 */
export interface RiskItem {
  taskId: number;
  taskName: string;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

/**
 * 진행 현황 통계
 */
export interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  onHoldTasks: number;
  cancelledTasks: number;
  overallProgress: number; // 전체 진행률 (0-100)
}

/**
 * 상태별 태스크 분포
 */
export interface StatusDistribution {
  status: Task['status'];
  count: number;
  percentage: number;
}

/**
 * 담당자별 작업량
 */
export interface AssigneeWorkload {
  assignee: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  averageProgress: number;
}

/**
 * 우선순위별 분포
 */
export interface PriorityDistribution {
  priority: Task['priority'];
  count: number;
  percentage: number;
}

/**
 * 진행 현황 리포트 데이터
 */
export interface ProgressReportData {
  stats: ProgressStats;
  statusDistribution: StatusDistribution[];
  assigneeWorkload: AssigneeWorkload[];
  priorityDistribution: PriorityDistribution[];
  weeklyProgress: WeeklyProgress[];
}

/**
 * 주간 진행률
 */
export interface WeeklyProgress {
  week: string; // 'YYYY-WW' 형식
  completedTasks: number;
  progress: number; // 평균 진행률
}

/**
 * 지연 태스크 정보
 */
export interface DelayedTask {
  task: Task;
  plannedEndDate: Date;
  actualEndDate?: Date;
  delayDays: number;
  delayReasons: string[];
  enablerImpacts: EnablerDelayImpact[];
}

/**
 * Enabler 지연 영향
 */
export interface EnablerDelayImpact {
  enablerId: number;
  enablerName: string;
  delayDays: number;
  impactedTasks: number[];
}

/**
 * 지연 분석 리포트 데이터
 */
export interface DelayAnalysisData {
  delayedTasks: DelayedTask[];
  totalDelayDays: number;
  averageDelayDays: number;
  enablerDelays: EnablerDelayImpact[];
  delayReasons: DelayReasonStats[];
}

/**
 * 지연 원인 통계
 */
export interface DelayReasonStats {
  reason: string;
  count: number;
  percentage: number;
}

/**
 * 익스포트 옵션
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sections: {
    criticalPath: boolean;
    progress: boolean;
    delays: boolean;
  };
}
