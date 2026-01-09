"use client";

import { useMemo } from "react";
import {
  compareAsc,
  parseISO,
  isBefore,
  isToday,
  isTomorrow,
  startOfDay,
} from "date-fns";
import type { Task, Project } from "@/lib/types/task";
import type { SortOption, GroupOption } from "@/lib/types/sorting";

interface useTaskViewDataProps {
  tasks: Task[] | undefined;
  sortBy: SortOption;
  groupBy: GroupOption;
  projects?: Project[];
}

export interface TaskGroup {
  title: string;
  tasks: Task[];
}

export interface ProcessedTasks {
  active: Task[];
  completed: Task[];
  evening: Task[];
  groups: TaskGroup[] | null;
}

export function useTaskViewData({
  tasks,
  sortBy,
  groupBy,
  projects,
}: useTaskViewDataProps): ProcessedTasks {
  return useMemo(() => {
    if (!tasks) return { active: [], completed: [], evening: [], groups: null };

    const completed = tasks.filter((t) => t.is_completed);

    // Separate "This Evening" tasks from regular active tasks
    const allActive = tasks.filter((t) => !t.is_completed);
    const evening = allActive.filter((t) => t.is_evening);
    const active = allActive.filter((t) => !t.is_evening);

    // Sorting Helper
    const sortFn = (a: Task, b: Task) => {
      // Custom: preserve original order (day_order from DB query)
      if (sortBy === "custom") return 0;

      if (sortBy === "priority") {
        const diff = a.priority - b.priority;
        if (diff !== 0) return diff;
      }
      if (sortBy === "date") {
        // Prioritize do_date (when to start) over due_date (deadline)
        const aDate = a.do_date || a.due_date;
        const bDate = b.do_date || b.due_date;

        if (!aDate) return 1;
        if (!bDate) return -1;
        const diff = compareAsc(parseISO(aDate), parseISO(bDate));
        if (diff !== 0) return diff;
      }
      if (sortBy === "alphabetical") {
        return a.content.localeCompare(b.content);
      }
      // Default: Date if not already sorted
      const aDate = a.do_date || a.due_date;
      const bDate = b.do_date || b.due_date;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return compareAsc(parseISO(aDate), parseISO(bDate));
    };

    active.sort(sortFn);
    evening.sort(sortFn);
    allActive.sort(sortFn);

    // Grouping
    if (groupBy === "none") {
      return { active, completed, evening, groups: null };
    }

    const groups: Record<string, Task[]> = {};
    const groupOrder: string[] = [];

    if (groupBy === "priority") {
      const labels: Record<number, string> = {
        1: "Critical",
        2: "High",
        3: "Medium",
        4: "Low",
      };
      [1, 2, 3, 4].forEach((p) => {
        const key = labels[p as 1 | 2 | 3 | 4];
        groups[key] = [];
        groupOrder.push(key);
      });

      allActive.forEach((task) => {
        const key = labels[task.priority];
        groups[key].push(task);
      });
    } else if (groupBy === "date") {
      const today = startOfDay(new Date());
      groupOrder.push("Overdue", "Today", "Tomorrow", "Upcoming", "No Date");
      groupOrder.forEach((k) => (groups[k] = []));

      allActive.forEach((task) => {
        // Use do_date (start date) if available, otherwise fall back to due_date
        const taskDate = task.do_date || task.due_date;

        if (!taskDate) {
          groups["No Date"].push(task);
          return;
        }
        const date = parseISO(taskDate);
        if (isBefore(date, today)) groups["Overdue"].push(task);
        else if (isToday(date)) groups["Today"].push(task);
        else if (isTomorrow(date)) groups["Tomorrow"].push(task);
        else groups["Upcoming"].push(task);
      });
    } else if (groupBy === "project") {
      // Group by Project ID but use Project Name for Title
      allActive.forEach((task) => {
        const projectId = task.project_id || "inbox";
        const project = projects?.find((p) => p.id === projectId);
        const title =
          project?.name || (projectId === "inbox" ? "Inbox" : projectId);

        if (!groups[title]) {
          groups[title] = [];
          groupOrder.push(title);
        }
        groups[title].push(task);
      });
    }

    // Clean up empty groups
    const finalGroups = groupOrder
      .filter((key) => groups[key].length > 0)
      .map((key) => ({ title: key, tasks: groups[key] }));

    return { active, completed, evening, groups: finalGroups };
  }, [tasks, sortBy, groupBy, projects]);
}
