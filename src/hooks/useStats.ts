import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { startOfDay, subDays, format, isSameDay } from "date-fns";

export interface DailyStats {
  date: string;
  minutes: number;
  tasksCompleted: number;
}

export interface StatsData {
  totalFocusHours: number;
  tasksCompleted: number;
  completionRate: number;
  currentStreak: number;
  dailyTrend: DailyStats[];
}

export function useStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["stats-dashboard"],
    staleTime: 0, // Mark data as stale immediately
    refetchOnWindowFocus: "always", // Always refetch when window gets focus
    queryFn: async (): Promise<StatsData> => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Fetch Focus Logs
      const { data: logs, error: logsError } = await supabase
        .from("focus_logs")
        .select("start_time, duration_seconds")
        .gte("start_time", thirtyDaysAgo);

      if (logsError) throw logsError;

      // Fetch Tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("is_completed, completed_at");

      if (tasksError) throw tasksError;

      // Aggregations
      const totalFocusSeconds =
        logs?.reduce((acc, log) => acc + (log.duration_seconds || 0), 0) || 0;
      const totalFocusHours = Math.round((totalFocusSeconds / 3600) * 10) / 10;

      const completedTasks = tasks?.filter((t) => t.is_completed).length || 0;
      const totalTasks = tasks?.length || 0;
      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Daily Trend (Last 7 Days for Chart)
      const dailyTrend: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "EEE"); // Mon, Tue...

        // Focus Minutes for this day
        const dayLogs =
          logs?.filter((log) => isSameDay(new Date(log.start_time), date)) ||
          [];
        const daySeconds = dayLogs.reduce(
          (acc, log) => acc + (log.duration_seconds || 0),
          0
        );

        dailyTrend.push({
          date: dateStr,
          minutes: Math.round(daySeconds / 60),
          tasksCompleted: 0, // Placeholder if we want to track this per day later
        });
      }

      // Calculate Streak (Simplified: consecutive days with at least one completed task or focus session)
      let streak = 0;

      return {
        totalFocusHours,
        tasksCompleted: completedTasks,
        completionRate,
        currentStreak: streak,
        dailyTrend,
      };
    },
  });
}
