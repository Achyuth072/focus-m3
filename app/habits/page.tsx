"use client";

import { HabitCard } from "@/components/habits/HabitCard";
import { useHabits } from "@/lib/hooks/useHabits";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function HabitsPage() {
  const { data: habits, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 p-6 space-y-4"
            >
              <div className="flex justify-between">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-32 w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-32 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center">
          <h2 className="type-h2">Failed to load habits</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <div className="container mx-auto py-32 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h2 className="type-h2">No habits yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first habit to start tracking
          </p>
        </div>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="flex flex-col h-[calc(100dvh-124px)] md:h-dvh overflow-hidden">
      <div className="px-4 md:px-6 pt-4 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
        <div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {format(today, "EEEE, MMMM d")}
          </p>
          <h1 className="type-h1 mt-1 text-primary">Habits</h1>
        </div>

        {/* Action buttons could go here (e.g., Create Habit) */}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 max-w-7xl">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      </div>
    </div>
  );
}
