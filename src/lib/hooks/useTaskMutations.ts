"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { mockStore } from "@/lib/mock/mock-store";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/types/task";
import { useHaptic } from "@/lib/hooks/useHaptic";

export function useCreateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();
  // We need to import mockStore here or in the fn if we want to use it.
  // Since it's a singleton, importing at top is fine.

  return useMutation({
    mutationFn: async (
      input: CreateTaskInput & { _clientId?: string }
    ): Promise<Task> => {
      // Guest Mode
      if (isGuestMode) {
        return mockStore.addTask({
          user_id: "guest",
          content: input.content,
          description: input.description || null,
          priority: input.priority || 4,
          due_date: input.due_date || null,
          do_date: input.do_date || null,
          is_evening: input.is_evening || false,
          project_id: input.project_id || null,
          parent_id: input.parent_id || null,
          recurrence: input.recurrence || null,
          is_completed: false,
          completed_at: null,
          day_order: 0,
          google_event_id: null,
          google_etag: null,
        });
      }

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
          do_date: input.do_date || null,
          is_evening: input.is_evening || false,
          project_id: input.project_id || null,
          parent_id: input.parent_id || null,
          recurrence: input.recurrence || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Task;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // If guest mode, we don't need optimistic updates because mockStore is synchronous
      // and fast, BUT keeping optimistic UI makes it feel same as prod.
      // However, mockStore persists immediately so careful not to dupe.
      // Actually, since mockStore is local, the mutationFn resolves instantly.
      // We can keep optimistic update logic or skip it for guest.
      // Skipping simplifies things, but let's keep it consistent.

      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        { projectId: undefined, showCompleted: false, isGuestMode },
      ]);

      const clientId = crypto.randomUUID();
      (newTask as CreateTaskInput & { _clientId?: string })._clientId =
        clientId;

      const optimisticTask: Task = {
        id: clientId,
        user_id: isGuestMode ? "guest" : "",
        project_id: newTask.project_id || null,
        parent_id: newTask.parent_id || null,
        content: newTask.content,
        description: newTask.description || null,
        priority: newTask.priority || 4,
        due_date: newTask.due_date || null,
        do_date: newTask.do_date || null,
        is_evening: newTask.is_evening || false,
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
        ["tasks", { projectId: undefined, showCompleted: false, isGuestMode }],
        (old) => [optimisticTask, ...(old || [])]
      );

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [
            "tasks",
            { projectId: undefined, showCompleted: false, isGuestMode },
          ],
          context.previousTasks
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
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
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      is_completed,
    }: {
      id: string;
      is_completed: boolean;
    }): Promise<{ task: Task; newRecurringTask?: Task }> => {
      // Guest Mode
      if (isGuestMode) {
        const updatedTask = mockStore.updateTask(id, {
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
        });

        if (!updatedTask) throw new Error("Task not found");

        // Record a focus session if completed (simulated 25min session)
        if (is_completed) {
          mockStore.addFocusLog({
            user_id: "guest",
            task_id: id,
            start_time: new Date(Date.now() - 25 * 60000).toISOString(),
            end_time: new Date().toISOString(),
            duration_seconds: 25 * 60,
          });
        }

        // Handle recurrence for guest mode
        let newRecurringTask: Task | undefined;
        let recurrenceRule = updatedTask.recurrence;
        if (typeof recurrenceRule === "string") {
          try {
            recurrenceRule = JSON.parse(recurrenceRule);
          } catch {
            recurrenceRule = null;
          }
        }

        if (is_completed && recurrenceRule) {
          const { calculateNextDueDate } = await import("../utils/recurrence");
          const completedDate = new Date();
          const nextDueDate = calculateNextDueDate(
            completedDate,
            recurrenceRule
          );

          newRecurringTask = mockStore.addTask({
            user_id: "guest",
            project_id: updatedTask.project_id,
            content: updatedTask.content,
            description: updatedTask.description,
            priority: updatedTask.priority,
            due_date: nextDueDate.toISOString(),
            do_date: updatedTask.do_date,
            is_evening: updatedTask.is_evening || false,
            recurrence: recurrenceRule, // Keep recurrence
            is_completed: false,
          } as Omit<Task, "id" | "created_at" | "updated_at">);
        }

        return { task: updatedTask, newRecurringTask };
      }

      // First, get the task to check if it's recurring
      const { data: currentTask, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw new Error(fetchError.message);

      // Update the current task
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

      const updatedTask = data as Task;
      let newRecurringTask: Task | undefined;

      // If completing a recurring task, create the next instance
      // Handle both JSONB (object) and TEXT (string) cases
      let recurrenceRule = currentTask.recurrence;
      if (typeof recurrenceRule === "string") {
        try {
          recurrenceRule = JSON.parse(recurrenceRule);
        } catch {
          console.error("Failed to parse recurrence string:", recurrenceRule);
          recurrenceRule = null;
        }
      }

      if (is_completed && recurrenceRule) {
        const { calculateNextDueDate } = await import("../utils/recurrence");

        const completedDate = new Date();
        const nextDueDate = calculateNextDueDate(completedDate, recurrenceRule);

        // Create new task instance
        const { data: newTask, error: createError } = await supabase
          .from("tasks")
          .insert({
            user_id: currentTask.user_id,
            project_id: currentTask.project_id,
            content: currentTask.content,
            description: currentTask.description,
            priority: currentTask.priority,
            due_date: nextDueDate.toISOString(),
            do_date: currentTask.do_date,
            is_evening: currentTask.is_evening || false,
            recurrence: recurrenceRule,
            is_completed: false,
          })
          .select()
          .single();

        if (createError) {
          console.error("Failed to create recurring task:", createError);
        } else {
          newRecurringTask = newTask as Task;
        }
      }

      return { task: updatedTask, newRecurringTask };
    },
    onMutate: async ({ id, is_completed }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const queryKey = [
        "tasks",
        { projectId: undefined, showCompleted: false, isGuestMode },
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
          [
            "tasks",
            { projectId: undefined, showCompleted: false, isGuestMode },
          ],
          context.previousTasks
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput): Promise<Task> => {
      // Guest Mode
      if (isGuestMode) {
        const { id, ...updates } = input;
        const updatedTask = mockStore.updateTask(id, updates);
        if (!updatedTask) throw new Error("Task not found");
        return updatedTask;
      }

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
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { trigger } = useHaptic(); // Use haptic hook
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Guest Mode
      if (isGuestMode) {
        // Find task before deleting for undo
        const task = mockStore.getTask(id);
        if (!task) return; // Already deleted?

        mockStore.deleteTask(id);
        return;
      }

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

        // Success Haptic (Double Tick)
        trigger(20);
        setTimeout(() => trigger(20), 150);

        toast("Task deleted", {
          description: deletedTask.content,
          duration: 5000,
          action: {
            label: "Undo",
            onClick: async () => {
              if (isGuestMode) {
                // Restore to mock store
                mockStore.addTask(taskToRestore);
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
                trigger(20);
                setTimeout(() => trigger(20), 150);
                toast("Task restored");
                return;
              }

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
                do_date: taskToRestore.do_date,
                is_evening: taskToRestore.is_evening,
                is_completed: taskToRestore.is_completed,
                completed_at: taskToRestore.completed_at,
                day_order: taskToRestore.day_order,
                recurrence: taskToRestore.recurrence,
                google_event_id: taskToRestore.google_event_id,
                google_etag: taskToRestore.google_etag,
              });

              if (error) {
                console.error("Failed to restore task:", error);

                // Error Haptic (Strong Pulse)
                trigger(50);

                toast.error("Failed to restore task");
              } else {
                // Success Haptic (Double Tick)
                trigger(20);
                setTimeout(() => trigger(20), 150);

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
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (orderedIds: string[]): Promise<void> => {
      if (isGuestMode) {
        orderedIds.forEach((id, index) => {
          mockStore.updateTask(id, { day_order: index });
        });
        return;
      }

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
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        { projectId: undefined, showCompleted: false },
      ]);

      // Note: This optimistic update only targets the default 'all' view.
      // In TaskList, we handle the local state ourselves.
      queryClient.setQueryData<Task[]>(
        ["tasks", { projectId: undefined, showCompleted: false }],
        (old) => {
          if (!old) return old;
          const taskMap = new Map(old.map((t) => [t.id, t]));
          return orderedIds
            .map((id) => {
              const task = taskMap.get(id);
              if (task) {
                return { ...task, day_order: orderedIds.indexOf(id) };
              }
              return null;
            })
            .filter((t): t is Task => !!t);
        }
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
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}

export function useClearCompletedTasks() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (isGuestMode) {
        const completedTasks = mockStore
          .getTasks()
          .filter((t) => t.is_completed);
        completedTasks.forEach((t) => mockStore.deleteTask(t.id));
        return;
      }

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
      queryClient.setQueriesData(
        { queryKey: ["tasks"] },
        (oldData: Task[] | undefined) => {
          if (!oldData) return oldData;
          if (Array.isArray(oldData)) {
            return oldData.filter((task: Task) => !task.is_completed);
          }
          return oldData;
        }
      );

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
      queryClient.invalidateQueries({ queryKey: ["calendar-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["stats-dashboard"] });
    },
  });
}
