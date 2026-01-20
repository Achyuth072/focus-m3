"use client";

import React, { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { HabitHeatmap } from "./HabitHeatmap";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useMarkHabitComplete } from "@/lib/hooks/useHabitMutations";
import type { HabitWithEntries } from "@/lib/hooks/useHabits";
import { Check, Plus, LucideIcon } from "lucide-react";
import { format } from "date-fns";

interface HabitCardProps {
  habit: HabitWithEntries;
  icon?: LucideIcon;
  onToggle?: () => void;
}

/**
 * HabitCard Component
 *
 * Displays a habit with its heatmap, stats, and completion toggle.
 * Implements responsive layouts:
 * - Mobile: Vertical stack with horizontal scroll for heatmap
 * - Desktop: Grid row with side-by-side stats
 */
export function HabitCard({ habit, icon: Icon, onToggle }: HabitCardProps) {
  const isMobile = useIsMobile();
  const markComplete = useMarkHabitComplete();

  // Check if today's entry exists
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = habit.entries.find((e) => e.date === today);
  const isCompletedToday = todayEntry?.value === 1;

  // Calculate stats
  const totalCompletions = habit.entries.filter((e) => e.value === 1).length;

  // Calculate current streak
  const calculateStreak = useCallback(() => {
    const sortedEntries = [...habit.entries]
      .filter((e) => e.value === 1)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(todayDate);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [habit.entries]);

  const currentStreak = calculateStreak();

  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle();
      return;
    }

    // Default: mark today as complete/incomplete
    markComplete.mutate({
      habitId: habit.id,
      date: today,
      value: isCompletedToday ? 0 : 1,
    });
  }, [onToggle, markComplete, habit.id, today, isCompletedToday]);

  return (
    <Card className="bg-[#121212] border-none p-5 rounded-2xl overflow-hidden shadow-2xl">
      {isMobile ? (
        // Mobile Layout: Vertical Stack
        <>
          <div className="flex justify-between items-center mb-5">
            <div className="flex gap-4 items-center">
              {Icon && (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-[14px] leading-tight text-gray-100">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {habit.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isCompletedToday
                    ? "bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-[#1a1a1a] border border-white/10 hover:bg-[#222]"
                }`}
                aria-label={
                  isCompletedToday ? "Mark incomplete" : "Mark complete"
                }
              >
                {isCompletedToday ? (
                  <Check className="w-5 h-5 text-black" strokeWidth={3} />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <HabitHeatmap entries={habit.entries} color={habit.color} />
          </div>
        </>
      ) : (
        // Desktop Layout: Grid Row
        <div className="flex items-center gap-6">
          {/* Left: Icon + Title */}
          <div className="flex gap-4 items-center min-w-[200px]">
            {Icon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5"
                style={{ backgroundColor: "#1a1a1a" }}
              >
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-[14px] leading-tight text-gray-100">
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          {/* Center: Heatmap */}
          <div className="flex-1 min-w-0">
            <HabitHeatmap entries={habit.entries} color={habit.color} />
          </div>

          {/* Right: Stats + Toggle */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-2 text-right">
              <div>
                <div className="text-[10px] uppercase text-gray-500 font-medium">
                  Streak
                </div>
                <div className="text-[16px] font-bold text-gray-100">
                  {currentStreak}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-gray-500 font-medium">
                  Total
                </div>
                <div className="text-[16px] font-bold text-gray-100">
                  {totalCompletions}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isCompletedToday
                  ? "bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-[#1a1a1a] border border-white/10 hover:bg-[#222]"
              }`}
              aria-label={
                isCompletedToday ? "Mark incomplete" : "Mark complete"
              }
            >
              {isCompletedToday ? (
                <Check className="w-5 h-5 text-black" strokeWidth={3} />
              ) : (
                <Plus className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
