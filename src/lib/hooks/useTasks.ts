"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types/task";

interface UseTasksOptions {
  projectId?: string | null;
  showCompleted?: boolean;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { projectId, showCompleted = false } = options;
  const supabase = createClient();

  return useQuery({
    queryKey: ["tasks", { projectId, showCompleted }],
    queryFn: async (): Promise<Task[]> => {
      let query = supabase
        .from("tasks")
        .select("*")
        .is("parent_id", null) // Exclude subtasks from main list
        .order("day_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (!showCompleted) {
        query = query.eq("is_completed", false);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Task[];
    },
  });
}

export function useTask(taskId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async (): Promise<Task | null> => {
      if (!taskId) return null;

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
