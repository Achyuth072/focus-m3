'use client';

import dynamic from 'next/dynamic';
import { Target, CheckCircle2, Flame, Clock } from 'lucide-react';
import { MetricCard } from '@/components/stats/MetricCard';
import { useStats } from '@/lib/hooks/useStats';
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
      <div className="p-6">
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Statistics</h1>
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

        {/* Chart */}
        <div>
          <FocusTrendChart 
            data={focusTrendData}
          />

        </div>
      </div>
    </div>
  );
}
