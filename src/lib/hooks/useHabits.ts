"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  value: number;
  created_at: string;
}

export interface HabitWithEntries extends Habit {
  entries: HabitEntry[];
}

interface UseHabitsOptions {
  includeArchived?: boolean;
}

export function useHabits(options: UseHabitsOptions = {}) {
  const { includeArchived = false } = options;
  const { isGuestMode } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["habits", { includeArchived, isGuestMode }],
    staleTime: 60000, // 1 minute
    queryFn: async (): Promise<HabitWithEntries[]> => {
      // Guest Mode: Return empty array (habits not supported in guest)
      if (isGuestMode) {
        return [];
      }

      // Fetch habits
      let habitsQuery = supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true });

      if (!includeArchived) {
        habitsQuery = habitsQuery.is("archived_at", null);
      }

      const { data: habits, error: habitsError } = await habitsQuery;

      if (habitsError) {
        throw new Error(habitsError.message);
      }

      if (!habits || habits.length === 0) {
        return [];
      }

      // Fetch habit entries for all habits
      const habitIds = habits.map((h) => h.id);
      const { data: entries, error: entriesError } = await supabase
        .from("habit_entries")
        .select("*")
        .in("habit_id", habitIds);

      if (entriesError) {
        throw new Error(entriesError.message);
      }

      // Group entries by habit_id
      const entriesByHabit = new Map<string, HabitEntry[]>();
      (entries || []).forEach((entry) => {
        const existing = entriesByHabit.get(entry.habit_id) || [];
        existing.push(entry as HabitEntry);
        entriesByHabit.set(entry.habit_id, existing);
      });

      // Combine habits with their entries
      return habits.map((habit) => ({
        ...(habit as Habit),
        entries: entriesByHabit.get(habit.id) || [],
      }));
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useHabit(habitId: string | null) {
  const { isGuestMode } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ["habit", habitId, isGuestMode],
    queryFn: async (): Promise<HabitWithEntries | null> => {
      if (!habitId || isGuestMode) return null;

      const { data: habit, error: habitError } = await supabase
        .from("habits")
        .select("*")
        .eq("id", habitId)
        .single();

      if (habitError) {
        throw new Error(habitError.message);
      }

      const { data: entries, error: entriesError } = await supabase
        .from("habit_entries")
        .select("*")
        .eq("habit_id", habitId);

      if (entriesError) {
        throw new Error(entriesError.message);
      }

      return {
        ...(habit as Habit),
        entries: (entries || []) as HabitEntry[],
      };
    },
    enabled: !!habitId && !isGuestMode,
  });
}
