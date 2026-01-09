"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { mockStore } from "@/lib/mock/mock-store";
import type { Task } from "@/lib/types/task";

interface UseTasksOptions {
  projectId?: string | null;
  showCompleted?: boolean;
  filter?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { projectId, showCompleted = false, filter } = options;
  const { isGuestMode } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["tasks", { projectId, showCompleted, filter, isGuestMode }],
    queryFn: async (): Promise<Task[]> => {
      // Guest Mode: Use mock store
      if (isGuestMode) {
        let tasks = mockStore.getTasks();

        // Apply filters
        if (filter === "today") {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          tasks = tasks.filter(
            (t) => t.due_date && new Date(t.due_date) <= today
          );
        } else if (filter === "p1") {
          tasks = tasks.filter((t) => t.priority === 1);
        }

        // Filter by project
        if (projectId === "inbox") {
          tasks = tasks.filter((t) => !t.project_id);
        } else if (projectId === "all") {
          // Show all
        } else if (projectId) {
          tasks = tasks.filter((t) => t.project_id === projectId);
        }

        // Filter completed
        if (!showCompleted) {
          tasks = tasks.filter((t) => !t.is_completed);
        }

        // Exclude subtasks and sort
        tasks = tasks
          .filter((t) => !t.parent_id)
          .sort((a, b) => a.day_order - b.day_order);

        return tasks;
      }

      // Normal Supabase flow
      let query = supabase
        .from("tasks")
        .select("*")
        .is("parent_id", null) // Exclude subtasks from main list
        .order("day_order", { ascending: true })
        .order("created_at", { ascending: false });

      // Apply Quick Filters
      if (filter === "today") {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        query = query.lte("due_date", today.toISOString());
      } else if (filter === "p1") {
        query = query.eq("priority", 1);
      }

      // Filter by project
      if (projectId === "inbox") {
        // Inbox: Only tasks without a project
        query = query.is("project_id", null);
      } else if (projectId === "all") {
        // All: Show everything (no filter)
        // Don't add any project filter
      } else if (projectId) {
        // Specific project: Only tasks in that project
        query = query.eq("project_id", projectId);
      }
      // No projectId or 'all': Show all tasks (no filter)

      if (!showCompleted) {
        query = query.eq("is_completed", false);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Task[];
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useTask(taskId: string | null) {
  const { isGuestMode } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["task", taskId, isGuestMode],
    queryFn: async (): Promise<Task | null> => {
      if (!taskId) return null;

      // Guest Mode: Use mock store
      if (isGuestMode) {
        return mockStore.getTask(taskId);
      }

      // Normal Supabase flow
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Task;
    },
    enabled: !!taskId,
  });
}

export function useInboxProject() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["inbox-project"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_inbox", true)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}
