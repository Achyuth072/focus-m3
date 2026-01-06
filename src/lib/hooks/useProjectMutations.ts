"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { mockStore } from "@/lib/mock/mock-store";
import type { Project } from "@/lib/types/task";

interface CreateProjectInput {
  name: string;
  color: string;
}

interface UpdateProjectInput {
  id: string;
  name?: string;
  color?: string;
  is_archived?: boolean;
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateProjectInput): Promise<Project> => {
      // Guest Mode
      if (isGuestMode) {
        return mockStore.addProject({
          ...input,
          user_id: "guest",
          view_style: "list",
          is_inbox: false,
          is_archived: false,
        });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: input.name,
          color: input.color,
          is_inbox: false,
          is_archived: false,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Project;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<Project[]>([
        "projects",
        isGuestMode,
      ]);

      const optimisticProject: Project = {
        id: crypto.randomUUID(),
        user_id: "",
        name: newProject.name,
        color: newProject.color,
        view_style: "list",
        is_inbox: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Project[]>(["projects", isGuestMode], (old) => [
        ...(old || []),
        optimisticProject,
      ]);

      return { previousProjects };
    },
    onError: (_err, _newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          ["projects", isGuestMode],
          context.previousProjects
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateProjectInput): Promise<Project> => {
      // Guest Mode
      if (isGuestMode) {
        const { id, ...updates } = input;
        const updatedProject = mockStore.updateProject(id, updates);
        if (!updatedProject) throw new Error("Project not found");
        return updatedProject;
      }

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Project;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Guest Mode
      if (isGuestMode) {
        mockStore.deleteProject(id);
        return;
      }

      // First, move all tasks in this project to Inbox (project_id = null)
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ project_id: null })
        .eq("project_id", id);

      if (updateError) throw new Error(updateError.message);

      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<Project[]>([
        "projects",
        isGuestMode,
      ]);

      queryClient.setQueryData<Project[]>(["projects", isGuestMode], (old) =>
        old?.filter((project) => project.id !== id)
      );

      return { previousProjects };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          ["projects", isGuestMode],
          context.previousProjects
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
