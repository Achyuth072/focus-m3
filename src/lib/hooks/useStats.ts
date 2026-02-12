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
  habitReps: number;
  trends: {
    focus: StatsTrend;
    tasks: StatsTrend;
    rate: StatsTrend;
    habitReps: StatsTrend;
  };
}

export function useStats() {
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useQuery({
    queryKey: ["stats-dashboard", isGuestMode],
    staleTime: 60000, // Cache for 1 minute to prevent constant re-calculation
    queryFn: async (): Promise<StatsData> => {
      // Helper to calculate streak
      const calculateCurrentStreak = (
        logs: { start_time: string }[],
        tasks: { is_completed: boolean; completed_at: string | null }[],
      ) => {
        const activityDates = new Set<string>();
        logs.forEach((l) => activityDates.add(l.start_time.split("T")[0]));
        tasks.forEach((t) => {
          if (t.is_completed && t.completed_at) {
            activityDates.add(t.completed_at.split("T")[0]);
          }
        });

        if (activityDates.size === 0) return 0;

        let streak = 0;
        const today = new Date();
        const checkDate = new Date(today);

        const getDateKey = (date: Date) => date.toISOString().split("T")[0];

        // If no activity today, check yesterday
        if (!activityDates.has(getDateKey(checkDate))) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (activityDates.has(getDateKey(checkDate))) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
          // Safety break
          if (streak > 365) break;
        }

        return streak;
      };

      // Guest Mode
      if (isGuestMode) {
        const tasks = mockStore.getTasks();
        const logs = mockStore.getFocusLogs();

        // dictionary for O(1) lookups
        const dailyStats: Record<string, { seconds: number; tasks: number }> =
          {};

        logs.forEach((log) => {
          const key = log.start_time.split("T")[0];
          if (!dailyStats[key]) dailyStats[key] = { seconds: 0, tasks: 0 };
          dailyStats[key].seconds += log.duration_seconds || 0;
        });

        tasks.forEach((task) => {
          if (task.is_completed && task.completed_at) {
            const key = task.completed_at.split("T")[0];
            if (!dailyStats[key]) dailyStats[key] = { seconds: 0, tasks: 0 };
            dailyStats[key].tasks += 1;
          }
        });

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
          const key = date.toISOString().split("T")[0];
          const dateStr = format(date, "EEE");
          const stats = dailyStats[key] || { seconds: 0, tasks: 0 };

          dailyTrend.push({
            date: dateStr,
            hours: Math.round((stats.seconds / 3600) * 10) / 10,
            totalSessions: logs.filter((l) => l.start_time.startsWith(key))
              .length, // Small N (7 days)
            tasksCompleted: stats.tasks,
          });
        }

        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const fourteenDaysAgo = subDays(now, 14);

        const currentLogs = logs.filter(
          (l) => new Date(l.start_time) >= sevenDaysAgo,
        );
        const prevLogs = logs.filter(
          (l) =>
            new Date(l.start_time) >= fourteenDaysAgo &&
            new Date(l.start_time) < sevenDaysAgo,
        );

        const currentFocusSec = currentLogs.reduce(
          (acc, log) => acc + (log.duration_seconds || 0),
          0,
        );
        const prevFocusSec = prevLogs.reduce(
          (acc, log) => acc + (log.duration_seconds || 0),
          0,
        );

        const currentCompleted = tasks.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= sevenDaysAgo,
        ).length;
        const prevCompleted = tasks.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo,
        ).length;

        const currentTotal = tasks.filter(
          (t) => !t.completed_at || new Date(t.completed_at) >= sevenDaysAgo,
        ).length;
        const prevTotal = tasks.filter(
          (t) =>
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo,
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

        const habitEntries = mockStore.getHabitEntries();
        const habitReps = habitEntries.length;

        const currentHabitReps = habitEntries.filter(
          (e) => new Date(e.date) >= sevenDaysAgo,
        ).length;
        const prevHabitReps = habitEntries.filter(
          (e) =>
            new Date(e.date) >= fourteenDaysAgo &&
            new Date(e.date) < sevenDaysAgo,
        ).length;

        return {
          totalFocusHours,
          totalSessions,
          tasksCompleted: completedTasks,
          completionRate,
          currentStreak: calculateCurrentStreak(logs, tasks),
          dailyTrend,
          habitReps,
          trends: {
            focus: calculateTrend(currentFocusSec, prevFocusSec),
            tasks: calculateTrend(currentCompleted, prevCompleted),
            rate: calculateTrend(currentRate, prevRate),
            habitReps: calculateTrend(currentHabitReps, prevHabitReps),
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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("is_completed, completed_at, user_id")
        .eq("user_id", userId);

      if (tasksError) throw tasksError;

      // Fetch Habit Entries
      const { data: habitEntries, error: habitEntriesError } = await supabase
        .from("habit_entries")
        .select("date")
        .gte("date", thirtyDaysAgo);

      if (habitEntriesError) throw habitEntriesError;

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
          0,
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
                isSameDay(new Date(t.completed_at), date),
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
            new Date(l.start_time) < sevenDaysAgo,
        ) || [];

      const currentFocusSec = currentLogs.reduce(
        (acc, log) => acc + (log.duration_seconds || 0),
        0,
      );
      const prevFocusSec = prevLogs.reduce(
        (acc, log) => acc + (log.duration_seconds || 0),
        0,
      );

      const currentCompleted =
        tasks?.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= sevenDaysAgo,
        ).length || 0;
      const prevCompleted =
        tasks?.filter(
          (t) =>
            t.is_completed &&
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo,
        ).length || 0;

      const currentTotal =
        tasks?.filter(
          (t) =>
            !t.is_completed ||
            (t.completed_at && new Date(t.completed_at) >= sevenDaysAgo),
        ).length || 0;
      const prevTotal =
        tasks?.filter(
          (t) =>
            t.completed_at &&
            new Date(t.completed_at) >= fourteenDaysAgo &&
            new Date(t.completed_at) < sevenDaysAgo,
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

      const habitReps = habitEntries?.length || 0;
      const currentHabitReps =
        habitEntries?.filter((e) => new Date(e.date) >= sevenDaysAgo).length ||
        0;
      const prevHabitReps =
        habitEntries?.filter(
          (e) =>
            new Date(e.date) >= fourteenDaysAgo &&
            new Date(e.date) < sevenDaysAgo,
        ).length || 0;

      return {
        totalFocusHours,
        totalSessions,
        tasksCompleted: completedTasks,
        completionRate,
        currentStreak: calculateCurrentStreak(logs || [], tasks || []),
        dailyTrend,
        habitReps,
        trends: {
          focus: calculateTrend(currentFocusSec, prevFocusSec),
          tasks: calculateTrend(currentCompleted, prevCompleted),
          rate: calculateTrend(currentRate, prevRate),
          habitReps: calculateTrend(currentHabitReps, prevHabitReps),
        },
      };
    },
  });
}
