"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/types/task";

export function useCreateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput): Promise<Task> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          content: input.content,
          description: input.description || null,
          priority: input.priority || 4,
          due_date: input.due_date || null,
          project_id: input.project_id || null,
          parent_id: input.parent_id || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Task;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        { projectId: undefined, showCompleted: false },
      ]);

      // Optimistically add the new task
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        user_id: "",
        project_id: newTask.project_id || null,
        parent_id: newTask.parent_id || null,
        content: newTask.content,
        description: newTask.description || null,
        priority: newTask.priority || 4,
        due_date: newTask.due_date || null,
        is_completed: false,
        completed_at: null,
        day_order: 0,
        recurrence: null,
        google_event_id: null,
        google_etag: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Task[]>(
        ["tasks", { projectId: undefined, showCompleted: false }],
        (old) => [optimisticTask, ...(old || [])]
      );

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", { projectId: undefined, showCompleted: false }],
          context.previousTasks
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_completed,
    }: {
      id: string;
      is_completed: boolean;
    }): Promise<Task> => {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Task;
    },
    onMutate: async ({ id, is_completed }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const queryKey = [
        "tasks",
        { projectId: undefined, showCompleted: false },
      ];
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((task) =>
          task.id === id
            ? {
                ...task,
                is_completed,
                completed_at: is_completed ? new Date().toISOString() : null,
              }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", { projectId: undefined, showCompleted: false }],
          context.previousTasks
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput): Promise<Task> => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Task;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const queryKey = [
        "tasks",
        { projectId: undefined, showCompleted: false },
      ];
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.filter((task) => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks", { projectId: undefined, showCompleted: false }],
          context.previousTasks
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]): Promise<void> => {
      const updates = orderedIds.map((id, index) => ({
        id,
        day_order: index,
      }));

      for (const { id, day_order } of updates) {
        const { error } = await supabase
          .from("tasks")
          .update({ day_order })
          .eq("id", id);

        if (error) throw new Error(error.message);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
