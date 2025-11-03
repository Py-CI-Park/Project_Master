/**
 * Critical Path Method (CPM) Calculator
 *
 * 크리티컬 패스 계산 유틸리티
 */

import type { Task, Dependency } from '../types';
import type { CriticalPathTask, CriticalPathAnalysis, RiskItem } from '../types';

/**
 * 크리티컬 패스 계산
 */
export const calculateCriticalPath = (
  tasks: Task[],
  dependencies: Dependency[]
): CriticalPathAnalysis => {
  if (tasks.length === 0) {
    return {
      criticalTasks: [],
      totalDuration: 0,
      risks: [],
    };
  }

  // 태스크 ID로 인덱싱
  const taskMap = new Map<number, Task>();
  tasks.forEach((task) => taskMap.set(task.id, task));

  // 의존성 맵 생성 (predecessor -> successors)
  const successorsMap = new Map<number, number[]>();
  const predecessorsMap = new Map<number, number[]>();

  dependencies.forEach((dep) => {
    if (!successorsMap.has(dep.predecessor_id)) {
      successorsMap.set(dep.predecessor_id, []);
    }
    successorsMap.get(dep.predecessor_id)!.push(dep.successor_id);

    if (!predecessorsMap.has(dep.successor_id)) {
      predecessorsMap.set(dep.successor_id, []);
    }
    predecessorsMap.get(dep.successor_id)!.push(dep.predecessor_id);
  });

  // Forward Pass: Early Start/Finish 계산
  const earlyStart = new Map<number, Date>();
  const earlyFinish = new Map<number, Date>();

  // 시작 태스크 찾기 (predecessor가 없는 태스크)
  const startTasks = tasks.filter((task) => !predecessorsMap.has(task.id));

  // 모든 태스크를 토폴로지컬 정렬
  const sorted = topologicalSort(tasks, predecessorsMap);

  sorted.forEach((task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const duration = Math.ceil(
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Early Start 계산
    const predecessors = predecessorsMap.get(task.id) || [];
    if (predecessors.length === 0) {
      // 시작 태스크
      earlyStart.set(task.id, taskStart);
    } else {
      // 모든 predecessor의 Early Finish 중 최대값
      const maxPredFinish = Math.max(
        ...predecessors.map((predId) => earlyFinish.get(predId)?.getTime() || 0)
      );
      earlyStart.set(task.id, new Date(maxPredFinish));
    }

    // Early Finish 계산
    const es = earlyStart.get(task.id)!;
    const ef = new Date(es.getTime() + duration * 24 * 60 * 60 * 1000);
    earlyFinish.set(task.id, ef);
  });

  // 전체 프로젝트 종료일 계산
  const projectEnd = Math.max(
    ...Array.from(earlyFinish.values()).map((date) => date.getTime())
  );

  // Backward Pass: Late Start/Finish 계산
  const lateStart = new Map<number, Date>();
  const lateFinish = new Map<number, Date>();

  // 역순으로 처리
  const reverseSorted = [...sorted].reverse();

  reverseSorted.forEach((task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const duration = Math.ceil(
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Late Finish 계산
    const successors = successorsMap.get(task.id) || [];
    if (successors.length === 0) {
      // 종료 태스크
      lateFinish.set(task.id, new Date(projectEnd));
    } else {
      // 모든 successor의 Late Start 중 최소값
      const minSuccStart = Math.min(
        ...successors.map((succId) => lateStart.get(succId)?.getTime() || projectEnd)
      );
      lateFinish.set(task.id, new Date(minSuccStart));
    }

    // Late Start 계산
    const lf = lateFinish.get(task.id)!;
    const ls = new Date(lf.getTime() - duration * 24 * 60 * 60 * 1000);
    lateStart.set(task.id, ls);
  });

  // Slack 계산 및 크리티컬 태스크 식별
  const criticalPathTasks: CriticalPathTask[] = tasks.map((task) => {
    const es = earlyStart.get(task.id)!;
    const ef = earlyFinish.get(task.id)!;
    const ls = lateStart.get(task.id)!;
    const lf = lateFinish.get(task.id)!;

    const slackMs = ls.getTime() - es.getTime();
    const slackDays = Math.round(slackMs / (1000 * 60 * 60 * 24));

    return {
      task,
      earlyStart: es,
      earlyFinish: ef,
      lateStart: ls,
      lateFinish: lf,
      slack: slackDays,
      isCritical: slackDays === 0,
    };
  });

  // 크리티컬 태스크만 필터링
  const criticalTasks = criticalPathTasks.filter((cpt) => cpt.isCritical);

  // 리스크 분석
  const risks = analyzeRisks(criticalTasks);

  // 전체 프로젝트 기간 계산
  const projectStart = Math.min(
    ...tasks.map((task) => new Date(task.start_date).getTime())
  );
  const totalDuration = Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24));

  return {
    criticalTasks,
    totalDuration,
    risks,
  };
};

/**
 * 토폴로지컬 정렬 (Kahn's Algorithm)
 */
const topologicalSort = (
  tasks: Task[],
  predecessorsMap: Map<number, number[]>
): Task[] => {
  const sorted: Task[] = [];
  const queue: Task[] = [];

  // 진입 차수 계산
  const inDegree = new Map<number, number>();
  tasks.forEach((task) => {
    inDegree.set(task.id, predecessorsMap.get(task.id)?.length || 0);
    if (inDegree.get(task.id) === 0) {
      queue.push(task);
    }
  });

  const taskMap = new Map<number, Task>();
  tasks.forEach((task) => taskMap.set(task.id, task));

  while (queue.length > 0) {
    const task = queue.shift()!;
    sorted.push(task);

    // 해당 태스크를 predecessor로 가진 태스크들의 진입 차수 감소
    tasks.forEach((t) => {
      const preds = predecessorsMap.get(t.id) || [];
      if (preds.includes(task.id)) {
        const newDegree = (inDegree.get(t.id) || 0) - 1;
        inDegree.set(t.id, newDegree);
        if (newDegree === 0) {
          queue.push(t);
        }
      }
    });
  }

  return sorted;
};

/**
 * 리스크 분석
 */
const analyzeRisks = (criticalTasks: CriticalPathTask[]): RiskItem[] => {
  const risks: RiskItem[] = [];

  criticalTasks.forEach((cpt) => {
    const task = cpt.task;

    // 진행 중이거나 미시작 상태인 크리티컬 태스크는 높은 리스크
    if (task.status === 'in_progress' || task.status === 'not_started') {
      let riskLevel: 'high' | 'medium' | 'low' = 'medium';
      let description = '';
      let impact = '';

      // 우선순위가 높고 진행률이 낮으면 리스크 증가
      if (task.priority === 'urgent' || task.priority === 'high') {
        if (task.progress < 50) {
          riskLevel = 'high';
          description = '높은 우선순위의 크리티컬 태스크가 진행이 느립니다.';
          impact = '프로젝트 전체 일정에 직접적인 영향을 미칩니다.';
        } else {
          riskLevel = 'medium';
          description = '높은 우선순위의 크리티컬 태스크입니다.';
          impact = '주의 깊은 모니터링이 필요합니다.';
        }
      } else {
        if (task.progress < 30) {
          riskLevel = 'medium';
          description = '크리티컬 태스크의 진행이 늦습니다.';
          impact = '프로젝트 일정 지연 가능성이 있습니다.';
        } else {
          riskLevel = 'low';
          description = '크리티컬 태스크이지만 진행 중입니다.';
          impact = '정상적으로 모니터링하면 됩니다.';
        }
      }

      risks.push({
        taskId: task.id,
        taskName: task.name,
        riskLevel,
        description,
        impact,
      });
    }
  });

  return risks;
};

/**
 * 진행 현황 통계 계산
 */
export const calculateProgressStats = (tasks: Task[]) => {
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in_progress').length,
    notStartedTasks: tasks.filter((t) => t.status === 'not_started').length,
    onHoldTasks: tasks.filter((t) => t.status === 'on_hold').length,
    cancelledTasks: tasks.filter((t) => t.status === 'cancelled').length,
    overallProgress: 0,
  };

  // 전체 진행률 계산 (평균)
  if (tasks.length > 0) {
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    stats.overallProgress = Math.round(totalProgress / tasks.length);
  }

  return stats;
};

/**
 * 지연 분석
 */
export const analyzeDelays = (tasks: Task[]) => {
  const today = new Date();
  const delayedTasks = tasks
    .filter((task) => {
      const endDate = new Date(task.end_date);
      return endDate < today && task.status !== 'completed';
    })
    .map((task) => {
      const plannedEnd = new Date(task.end_date);
      const delayDays = Math.ceil((today.getTime() - plannedEnd.getTime()) / (1000 * 60 * 60 * 24));

      return {
        task,
        plannedEndDate: plannedEnd,
        delayDays,
        delayReasons: ['일정 지연'], // 실제로는 태스크 메타데이터에서 가져와야 함
        enablerImpacts: [], // 실제로는 Enabler 데이터와 연결
      };
    });

  const totalDelayDays = delayedTasks.reduce((sum, dt) => sum + dt.delayDays, 0);
  const averageDelayDays = delayedTasks.length > 0 ? totalDelayDays / delayedTasks.length : 0;

  return {
    delayedTasks,
    totalDelayDays,
    averageDelayDays: Math.round(averageDelayDays),
    enablerDelays: [],
    delayReasons: [
      {
        reason: '일정 지연',
        count: delayedTasks.length,
        percentage: 100,
      },
    ],
  };
};
