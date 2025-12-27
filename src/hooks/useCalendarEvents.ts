import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCalendarStore } from "@/lib/calendar/store";
import { useEffect } from "react";
import type { CalendarEvent } from "@/lib/calendar/types";

export function useCalendarEvents() {
  const supabase = createClient();
  const setEvents = useCalendarStore((state) => state.setEvents);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["calendar-tasks"],
    queryFn: async () => {
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

  useEffect(() => {
    if (tasks) {
      const calendarEvents: CalendarEvent[] = tasks.map((t: any) => {
        const task = t;
        const startDate = new Date(task.due_date);
        // Default to 1 hour duration if no end date provided
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
        };
      });
      setEvents(calendarEvents);
    }
  }, [tasks, setEvents]);

  return { isLoading };
}
