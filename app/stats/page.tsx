'use client';

import dynamic from 'next/dynamic';
import { Target, CheckCircle2, Flame, Clock } from 'lucide-react';
import { MetricCard } from '@/components/stats/MetricCard';
import { useStats } from '@/hooks/useStats';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the chart component (Recharts is ~80KB+)
const FocusTrendChart = dynamic(
  () => import('@/components/stats/FocusTrendChart').then(mod => ({ default: mod.FocusTrendChart })),
  { loading: () => <Skeleton className="h-64 w-full rounded-xl" />, ssr: false }
);

export default function StatsPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Use real data or fallbacks
  const focusTrendData = stats?.dailyTrend || [];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your productivity and progress
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top Row - Key Metrics */}
          <MetricCard
            title="Total Focus"
            value={`${stats?.totalFocusHours || 0}h`}
            icon={Clock}
            trend={{ value: 15, isPositive: true }}
          />
          <MetricCard
            title="Tasks Completed"
            value={stats?.tasksCompleted.toString() || "0"}
            icon={CheckCircle2}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Current Streak"
            value={`${stats?.currentStreak || 0} days`}
            icon={Flame}
          />
          <MetricCard
            title="Completion Rate"
            value={`${stats?.completionRate || 0}%`}
            icon={Target}
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Middle Row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FocusTrendChart 
            data={focusTrendData} 
            className="lg:col-span-2"
          />
          
          {/* Recent Achievements */}
          <div className="p-6 border border-border/50 rounded-lg bg-card">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">7-Day Streak</p>
                  <p className="text-xs text-muted-foreground">Completed tasks every day this week</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Focus Master</p>
                  <p className="text-xs text-muted-foreground">Completed 10 focus sessions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Early Bird</p>
                  <p className="text-xs text-muted-foreground">Started work before 9 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
