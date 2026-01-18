import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { subDays, format, isSameDay } from "date-fns";
import { useAuth } from "@/components/AuthProvider";
import { mockStore } from "@/lib/mock/mock-store";

export interface DailyStats {
  date: string;
  hours: number;
  totalSessions: number;
  tasksCompleted: number;
}

export interface StatsTrend {
  value: number;
  isPositive: boolean;
}

export interface StatsData {
  totalFocusHours: number;
  totalSessions: number;
  tasksCompleted: number;
  completionRate: number;
  currentStreak: number;
  dailyTrend: DailyStats[];
  trends: {
    focus: StatsTrend;
    tasks: StatsTrend;
    rate: StatsTrend;
  };
}

export function useStats() {
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useQuery({
    queryKey: ["stats-dashboard", isGuestMode],
    staleTime: 0,
    refetchOnWindowFocus: "always",
    queryFn: async (): Promise<StatsData> => {
      // Helper to calculate streak
      const calculateCurrentStreak = (
        logs: { start_time: string }[],
        tasks: { is_completed: boolean; completed_at: string | null }[]
      ) => {
        const activityDates = new Set<string>();
        logs.forEach((l) =>
          activityDates.add(new Date(l.start_time).toDateString())
        );
        tasks.forEach((t) => {
          if (t.is_completed && t.completed_at) {
            activityDates.add(new Date(t.completed_at).toDateString());
          }
        });

        if (activityDates.size === 0) return 0;

        let streak = 0;
        const today = new Date();
        const checkDate = new Date(today);

        // If no activity today, check yesterday to see if streak is still alive
        if (!activityDates.has(checkDate.toDateString())) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (activityDates.has(checkDate.toDateString())) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        return streak;
      };

      // Guest Mode
      if (isGuestMode) {
        const tasks = mockStore.getTasks();
        const logs = mockStore.getFocusLogs();

        const totalFocusSeconds =
          logs?.reduce((acc, log) => acc + (log.duration_seconds || 0), 0) || 0;
        const totalFocusHours =
          Math.round((totalFocusSeconds / 3600) * 10) / 10;
        const totalSessions = logs?.length || 0;

        const completedTasks = tasks.filter((t) => t.is_completed).length;
        const totalTasks = tasks.length;
        const completionRate =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const dailyTrend: DailyStats[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, "EEE");

          const dayLogs =
            logs?.filter((log) => isSameDay(new Date(log.start_time), date)) ||
            [];
          const daySeconds = dayLogs.reduce(
            (acc, log) => acc + (log.duration_seconds || 0),
            0
          );

          dailyTrend.push({
            date: dateStr,
            hours: Math.round((daySeconds / 3600) * 10) / 10,
            totalSessions: dayLogs.length,
            tasksCompleted: tasks.filter(
              (t) =>
                t.is_completed &&
                t.completed_at &&
                isSameDay(new Date(t.completed_at), date)
            ).length,
          });
        }

        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const fourteenDaysAgo = subDays(now, 14);

        const currentLogs = logs.filter(
          (l) => new Date(l.start_time) >= sevenDaysAgo
        );
        const prevLogs = logs.filter(
          (l) =>
            new Date(l.start_time) >= fourteenDaysAgo &&
            new Date(l.start_time) < sevenDaysAgo
        );

        const currentFocusSec = currentLogs.reduce(
          (acc, log) => acc + (log.duration_seconds || 0),
          0
        );
        const prevFocusSec = prevLogs.reduce(
          (acc, log) => acc + (log.duration_seconds || 0),
          0
        );

        const currentCompleted = tasks.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= sevenDaysAgo
        ).length;
        const prevCompleted = tasks.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo
        ).length;

        const currentTotal = tasks.filter(
          (t) => !t.completed_at || new Date(t.completed_at) >= sevenDaysAgo
        ).length;
        const prevTotal = tasks.filter(
          (t) =>
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo
        ).length;

        const currentRate =
          currentTotal > 0 ? (currentCompleted / currentTotal) * 100 : 0;
        const prevRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;

        const calculateTrend = (curr: number, prev: number): StatsTrend => {
          if (prev === 0)
            return { value: curr > 0 ? 100 : 0, isPositive: curr > 0 };
          const diff = ((curr - prev) / prev) * 100;
          return {
            value: Math.abs(Math.round(diff * 10) / 10),
            isPositive: diff >= 0,
          };
        };

        return {
          totalFocusHours,
          totalSessions,
          tasksCompleted: completedTasks,
          completionRate,
          currentStreak: calculateCurrentStreak(logs, tasks),
          dailyTrend,
          trends: {
            focus: calculateTrend(currentFocusSec, prevFocusSec),
            tasks: calculateTrend(currentCompleted, prevCompleted),
            rate: calculateTrend(currentRate, prevRate),
          },
        };
      }

      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Fetch Focus Logs
      const { data: logs, error: logsError } = await supabase
        .from("focus_logs")
        .select("start_time, duration_seconds")
        .gte("start_time", thirtyDaysAgo);

      if (logsError) throw logsError;

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("is_completed, completed_at, user_id")
        .eq("user_id", userId);

      if (tasksError) throw tasksError;

      // Aggregations
      const totalFocusSeconds =
        logs?.reduce((acc, log) => acc + (log.duration_seconds || 0), 0) || 0;
      const totalFocusHours = Math.round((totalFocusSeconds / 3600) * 10) / 10;
      const totalSessions = logs?.length || 0;

      const completedTasks = tasks?.filter((t) => t.is_completed).length || 0;
      const totalTasks = tasks?.length || 0;
      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Daily Trend (Last 7 Days for Chart)
      const dailyTrend: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "EEE");

        const dayLogs =
          logs?.filter((log) => isSameDay(new Date(log.start_time), date)) ||
          [];
        const daySeconds = dayLogs.reduce(
          (acc, log) => acc + (log.duration_seconds || 0),
          0
        );

        dailyTrend.push({
          date: dateStr,
          hours: Math.round((daySeconds / 3600) * 10) / 10,
          totalSessions: dayLogs.length,
          tasksCompleted:
            tasks?.filter(
              (t) =>
                t.is_completed &&
                t.completed_at &&
                isSameDay(new Date(t.completed_at), date)
            ).length || 0,
        });
      }

      // Calculate Trends
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const fourteenDaysAgo = subDays(now, 14);

      const currentLogs =
        logs?.filter((l) => new Date(l.start_time) >= sevenDaysAgo) || [];
      const prevLogs =
        logs?.filter(
          (l) =>
            new Date(l.start_time) >= fourteenDaysAgo &&
            new Date(l.start_time) < sevenDaysAgo
        ) || [];

      const currentFocusSec = currentLogs.reduce(
        (acc, log) => acc + (log.duration_seconds || 0),
        0
      );
      const prevFocusSec = prevLogs.reduce(
        (acc, log) => acc + (log.duration_seconds || 0),
        0
      );

      const currentCompleted =
        tasks?.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= sevenDaysAgo
        ).length || 0;
      const prevCompleted =
        tasks?.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo
        ).length || 0;

      const currentTotal =
        tasks?.filter(
          (t) =>
            !t.is_completed ||
            (t.completed_at && new Date(t.completed_at) >= sevenDaysAgo)
        ).length || 0;
      const prevTotal =
        tasks?.filter(
          (t) =>
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo
        ).length || 0;

      const currentRate =
        currentTotal > 0 ? (currentCompleted / currentTotal) * 100 : 0;
      const prevRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;

      const calculateTrend = (curr: number, prev: number): StatsTrend => {
        if (prev === 0)
          return { value: curr > 0 ? 100 : 0, isPositive: curr > 0 };
        const diff = ((curr - prev) / prev) * 100;
        return {
          value: Math.abs(Math.round(diff * 10) / 10),
          isPositive: diff >= 0,
        };
      };

      return {
        totalFocusHours,
        totalSessions,
        tasksCompleted: completedTasks,
        completionRate,
        currentStreak: calculateCurrentStreak(logs || [], tasks || []),
        dailyTrend,
        trends: {
          focus: calculateTrend(currentFocusSec, prevFocusSec),
          tasks: calculateTrend(currentCompleted, prevCompleted),
          rate: calculateTrend(currentRate, prevRate),
        },
      };
    },
  });
}
