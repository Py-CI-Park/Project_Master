/**
 * Progress Report Component
 *
 * 진행 현황 리포트 컴포넌트 (Recharts 차트 포함)
 */

import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Task, ProgressStats, StatusDistribution, PriorityDistribution } from '../../types';
import { calculateProgressStats } from '../../utils/criticalPathCalculator';

export interface ProgressReportProps {
  tasks: Task[];
}

const ProgressReport = ({ tasks }: ProgressReportProps) => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);

  useEffect(() => {
    if (tasks.length > 0) {
      const progressStats = calculateProgressStats(tasks);
      setStats(progressStats);

      // 상태별 분포 계산
      const statusDist: StatusDistribution[] = [
        {
          status: 'not_started',
          count: progressStats.notStartedTasks,
          percentage: (progressStats.notStartedTasks / progressStats.totalTasks) * 100,
        },
        {
          status: 'in_progress',
          count: progressStats.inProgressTasks,
          percentage: (progressStats.inProgressTasks / progressStats.totalTasks) * 100,
        },
        {
          status: 'completed',
          count: progressStats.completedTasks,
          percentage: (progressStats.completedTasks / progressStats.totalTasks) * 100,
        },
        {
          status: 'on_hold',
          count: progressStats.onHoldTasks,
          percentage: (progressStats.onHoldTasks / progressStats.totalTasks) * 100,
        },
        {
          status: 'cancelled',
          count: progressStats.cancelledTasks,
          percentage: (progressStats.cancelledTasks / progressStats.totalTasks) * 100,
        },
      ].filter((d) => d.count > 0);
      setStatusDistribution(statusDist);

      // 우선순위별 분포 계산
      const priorityCounts = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const priorityDist: PriorityDistribution[] = Object.entries(priorityCounts).map(
        ([priority, count]) => ({
          priority: priority as Task['priority'],
          count,
          percentage: (count / tasks.length) * 100,
        })
      );
      setPriorityDistribution(priorityDist);
    }
  }, [tasks]);

  if (!stats) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>진행 현황 데이터가 없습니다.</Typography>
      </Paper>
    );
  }

  // 상태별 색상
  const STATUS_COLORS: Record<Task['status'], string> = {
    not_started: '#9e9e9e',
    in_progress: '#2196f3',
    completed: '#4caf50',
    on_hold: '#ff9800',
    cancelled: '#f44336',
  };

  // 우선순위별 색상
  const PRIORITY_COLORS: Record<Task['priority'], string> = {
    low: '#4caf50',
    medium: '#2196f3',
    high: '#ff9800',
    urgent: '#f44336',
  };

  const getStatusLabel = (status: Task['status']): string => {
    const labels: Record<Task['status'], string> = {
      not_started: '미시작',
      in_progress: '진행중',
      completed: '완료',
      on_hold: '보류',
      cancelled: '취소',
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: Task['priority']): string => {
    const labels: Record<Task['priority'], string> = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      urgent: '긴급',
    };
    return labels[priority];
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        진행 현황 리포트
      </Typography>

      {/* 전체 통계 카드 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                전체 태스크
              </Typography>
              <Typography variant="h4">{stats.totalTasks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                완료
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completedTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                진행중
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.inProgressTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                전체 진행률
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.overallProgress}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 차트 */}
      <Grid container spacing={3}>
        {/* 상태별 분포 파이 차트 */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            상태별 태스크 분포
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution.map((d) => ({
                  name: getStatusLabel(d.status),
                  value: d.count,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        {/* 우선순위별 분포 바 차트 */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            우선순위별 태스크 분포
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={priorityDistribution.map((d) => ({
                name: getPriorityLabel(d.priority),
                count: d.count,
                priority: d.priority,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8">
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProgressReport;
