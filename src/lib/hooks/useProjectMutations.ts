"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { handleMutationError } from "@/lib/utils/mutation-error";
import type { Project } from "@/lib/types/task";
import { projectMutations } from "@/lib/mutations/project";

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationKey: ["createProject"],
    mutationFn: projectMutations.create,
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
    onError: (err, _newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          ["projects", isGuestMode],
          context.previousProjects,
        );
      }
      handleMutationError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProject"],
    mutationFn: projectMutations.update,
    onError: (err) => {
      handleMutationError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationKey: ["deleteProject"],
    mutationFn: projectMutations.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<Project[]>([
        "projects",
        isGuestMode,
      ]);

      queryClient.setQueryData<Project[]>(["projects", isGuestMode], (old) =>
        old?.filter((project) => project.id !== id),
      );

      return { previousProjects };
    },
    onError: (err, _id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          ["projects", isGuestMode],
          context.previousProjects,
        );
      }
      handleMutationError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
