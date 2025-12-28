"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types/task";

export function useProjects() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_archived", false)
        .order("is_inbox", { ascending: false }) // Inbox first
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Project[];
    },
  });
}

export function useProject(projectId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<Project | null> => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Project;
    },
    enabled: !!projectId,
  });
}
