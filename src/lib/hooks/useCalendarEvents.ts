import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCalendarStore } from "@/lib/calendar/store";
import { useEffect, useMemo } from "react";
import type { CalendarEvent } from "@/lib/calendar/types";
import { useAuth } from "@/components/AuthProvider";
import { mockStore } from "@/lib/mock/mock-store";

export function useCalendarEvents() {
  const supabase = createClient();
  const setEvents = useCalendarStore((state) => state.setEvents);
  const { isGuestMode } = useAuth();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["calendar-tasks", isGuestMode],
    queryFn: async () => {
      // Guest Mode
      if (isGuestMode) {
        const allTasks = mockStore.getTasks();
        const allProjects = mockStore.getProjects();
        const projectMap = new Map(allProjects.map((p) => [p.id, p]));

        return allTasks
          .filter((t) => t.due_date)
          .map((t) => ({
            id: t.id,
            content: t.content,
            due_date: t.due_date!,
            project_id: t.project_id,
            projects: t.project_id
              ? {
                  color:
                    projectMap.get(t.project_id)?.color ||
                    "hsl(var(--primary))",
                }
              : null,
          }));
      }

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          id,
          content,
          due_date,
          project_id,
          projects (
            color
          )
        `
        )
        .not("due_date", "is", null);

      if (error) throw error;
      return data;
    },
  });

  // Define the shape of the data returned by Supabase
  type CalendarTaskData = {
    id: string;
    content: string;
    due_date: string; // Supabase returns dates as strings
    project_id: string | null;
    projects: { color: string } | { color: string }[] | null;
  };

  // Memoize the transformation to prevent recalculating on every render
  const calendarEvents = useMemo(() => {
    if (!tasks) return [];

    return (tasks as unknown as CalendarTaskData[]).map((task) => {
      const startDate = new Date(task.due_date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      return {
        id: task.id,
        title: task.content,
        start: startDate,
        end: endDate,
        color:
          (Array.isArray(task.projects)
            ? task.projects[0]?.color
            : task.projects?.color) || "hsl(var(--primary))",
      } as CalendarEvent;
    });
  }, [tasks]);

  useEffect(() => {
    setEvents(calendarEvents);
  }, [calendarEvents, setEvents]);

  return { isLoading };
}
