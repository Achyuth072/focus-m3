"use client";

import dynamic from "next/dynamic";
import { Target, CheckCircle2, Flame, Clock, Zap } from "lucide-react";
import { MetricCard } from "@/components/stats/MetricCard";
import { useStats } from "@/lib/hooks/useStats";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components (D3/Recharts are large)
const FocusTrendChart = dynamic(
  () =>
    import("@/components/stats/FocusTrendChart").then((mod) => ({
      default: mod.FocusTrendChart,
    })),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
    ssr: false,
  },
);

const ActivityHeatmap = dynamic(
  () =>
    import("@/components/stats/ActivityHeatmap").then((mod) => ({
      default: mod.ActivityHeatmap,
    })),
  {
    loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
    ssr: false,
  },
);

export default function StatsPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
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
          <h1 className="type-h1">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your productivity and progress
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Top Row - Key Metrics */}
          <MetricCard
            title="Total Focus"
            value={`${stats?.totalFocusHours || 0}h`}
            icon={Clock}
            trend={stats?.trends?.focus}
          />
          <MetricCard
            title="Total Sessions"
            value={stats?.totalSessions?.toString() || "0"}
            icon={Zap}
          />
          <MetricCard
            title="Tasks Completed"
            value={stats?.tasksCompleted?.toString() || "0"}
            icon={CheckCircle2}
            trend={stats?.trends?.tasks}
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
            trend={stats?.trends?.rate}
          />
        </div>

        {/* Heatmap */}
        <div>
          <ActivityHeatmap />
        </div>

        {/* Chart */}
        <div>
          <FocusTrendChart data={focusTrendData} />
        </div>
      </div>
    </div>
  );
}
