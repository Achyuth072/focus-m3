"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/types/task";

export function useCreateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (
      input: CreateTaskInput & { _clientId?: string }
    ): Promise<Task> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use client-provided ID or generate one
      const taskId = input._clientId || crypto.randomUUID();

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          id: taskId,
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

      // Generate stable ID for optimistic update
      const clientId = crypto.randomUUID();
      // Attach to input so mutationFn can use the same ID
      (newTask as CreateTaskInput & { _clientId?: string })._clientId =
        clientId;

      const optimisticTask: Task = {
        id: clientId,
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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
      // If this was a subtask, also invalidate the parent's subtask list
      if (variables.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", variables.parent_id],
        });
      }
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
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
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
      // Import toast dynamically to avoid SSR issues
      const { toast } = await import("sonner");

      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Get all task query caches and find the deleted task
      const allTaskQueries = queryClient.getQueriesData<Task[]>({
        queryKey: ["tasks"],
      });
      let deletedTask: Task | undefined;

      // Search through all task caches to find the task being deleted
      for (const [, data] of allTaskQueries) {
        if (data) {
          const found = data.find((task) => task.id === id);
          if (found) {
            deletedTask = found;
            break;
          }
        }
      }

      // Optimistically remove from ALL task caches
      for (const [queryKey] of allTaskQueries) {
        queryClient.setQueryData<Task[]>(queryKey, (old) =>
          old?.filter((task) => task.id !== id)
        );
      }

      // Show undo toast
      if (deletedTask) {
        const taskToRestore = { ...deletedTask };
        toast("Task deleted", {
          description: deletedTask.content,
          duration: 5000,
          action: {
            label: "Undo",
            onClick: async () => {
              // Re-insert into database using insert (task was hard-deleted)
              const { error } = await supabase.from("tasks").insert({
                id: taskToRestore.id,
                user_id: taskToRestore.user_id,
                project_id: taskToRestore.project_id,
                parent_id: taskToRestore.parent_id,
                content: taskToRestore.content,
                description: taskToRestore.description,
                priority: taskToRestore.priority,
                due_date: taskToRestore.due_date,
                is_completed: taskToRestore.is_completed,
                completed_at: taskToRestore.completed_at,
                day_order: taskToRestore.day_order,
                recurrence: taskToRestore.recurrence,
                google_event_id: taskToRestore.google_event_id,
                google_etag: taskToRestore.google_etag,
              });

              if (error) {
                console.error("Failed to restore task:", error);
                toast.error("Failed to restore task");
              } else {
                toast("Task restored");
              }
              // Always invalidate to sync with database
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
            },
          },
        });
      }

      return { deletedTask };
    },
    onError: (_err, _id, _context) => {
      // Invalidate to refetch from database on error
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}

export function useClearCompletedTasks() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (error) throw new Error(error.message);
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous data for rollback
      const previousTasks = queryClient.getQueriesData({ queryKey: ["tasks"] });

      // Optimistically remove all completed tasks from cache
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData)) {
          return oldData.filter((task: Task) => !task.is_completed);
        }
        return oldData;
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Invalidate all task queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}
