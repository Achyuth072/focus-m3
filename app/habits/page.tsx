"use client";

import { HabitCard } from "@/components/habits/HabitCard";
import { useHabits } from "@/lib/hooks/useHabits";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function HabitsPage() {
  const { data: habits, isLoading, error } = useHabits();

  if (isLoading) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-white font-sans antialiased">
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-2xl p-5 space-y-4">
              <Skeleton className="h-12 w-full bg-[#1a1a1a]" />
              <Skeleton className="h-24 w-full bg-[#1a1a1a]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-white font-sans antialiased">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">Failed to load habits</h2>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-white font-sans antialiased">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">No habits yet</h2>
            <p className="text-sm text-gray-500 mt-1">
              Create your first habit to start tracking
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-white font-sans antialiased">
      <div className="max-w-3xl mx-auto space-y-4">
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>
    </div>
  );
}
