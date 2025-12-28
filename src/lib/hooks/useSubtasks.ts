"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types/task";

/**
 * Fetches all subtasks for a given parent task.
 */
export function useSubtasks(parentId: string | null | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: async (): Promise<Task[]> => {
      if (!parentId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("parent_id", parentId)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Task[];
    },
    enabled: !!parentId,
  });
}
