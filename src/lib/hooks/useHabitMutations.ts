"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { Habit, HabitEntry, HabitWithEntries } from "./useHabits";

interface CreateHabitInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface UpdateHabitInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface MarkHabitCompleteInput {
  habitId: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  value?: number; // 0 = skip, 1 = complete (default)
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateHabitInput): Promise<Habit> => {
      if (isGuestMode) {
        throw new Error("Habits are not supported in guest mode");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          color: input.color || "#4B6CB7",
          icon: input.icon || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateHabitInput): Promise<Habit> => {
      if (isGuestMode) {
        throw new Error("Habits are not supported in guest mode");
      }

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (habitId: string): Promise<void> => {
      if (isGuestMode) {
        throw new Error("Habits are not supported in guest mode");
      }

      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);
      if (error) throw new Error(error.message);
    },
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });

      const previousHabits = queryClient.getQueryData<HabitWithEntries[]>([
        "habits",
        { includeArchived: false, isGuestMode },
      ]);

      // Optimistically remove from cache
      queryClient.setQueryData<HabitWithEntries[]>(
        ["habits", { includeArchived: false, isGuestMode }],
        (old) => old?.filter((habit) => habit.id !== habitId),
      );

      return { previousHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(
          ["habits", { includeArchived: false, isGuestMode }],
          context.previousHabits,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useMarkHabitComplete() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { isGuestMode } = useAuth();

  return useMutation({
    mutationFn: async (input: MarkHabitCompleteInput): Promise<HabitEntry> => {
      if (isGuestMode) {
        throw new Error("Habits are not supported in guest mode");
      }

      const { habitId, date, value = 1 } = input;

      // Upsert: Insert or update the entry for this habit+date
      const { data, error } = await supabase
        .from("habit_entries")
        .upsert(
          {
            habit_id: habitId,
            date,
            value,
          },
          {
            onConflict: "habit_id,date",
          },
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as HabitEntry;
    },
    onMutate: async ({ habitId, date, value = 1 }) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });

      const previousHabits = queryClient.getQueryData<HabitWithEntries[]>([
        "habits",
        { includeArchived: false, isGuestMode },
      ]);

      // Optimistically update the entry
      queryClient.setQueryData<HabitWithEntries[]>(
        ["habits", { includeArchived: false, isGuestMode }],
        (old) =>
          old?.map((habit) => {
            if (habit.id !== habitId) return habit;

            const existingEntryIndex = habit.entries.findIndex(
              (e) => e.date === date,
            );

            if (existingEntryIndex >= 0) {
              // Update existing entry
              const updatedEntries = [...habit.entries];
              updatedEntries[existingEntryIndex] = {
                ...updatedEntries[existingEntryIndex],
                value,
              };
              return { ...habit, entries: updatedEntries };
            } else {
              // Add new entry
              const newEntry: HabitEntry = {
                id: crypto.randomUUID(), // Temporary ID
                habit_id: habitId,
                date,
                value,
                created_at: new Date().toISOString(),
              };
              return {
                ...habit,
                entries: [...habit.entries, newEntry],
              };
            }
          }),
      );

      return { previousHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(
          ["habits", { includeArchived: false, isGuestMode }],
          context.previousHabits,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
