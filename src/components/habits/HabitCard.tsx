"use client";

import React, { useCallback, useLayoutEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { HabitHeatmap } from "./HabitHeatmap";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useMarkHabitComplete } from "@/lib/hooks/useHabitMutations";
import type { HabitWithEntries } from "@/lib/hooks/useHabits";
import { Check, Plus, LucideIcon, Flame, Trophy } from "lucide-react";
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
 * Implements a prioritized heatmap layout:
 * - Stats moved to header for better focus hierarchy.
 * - Auto-scrolls heatmap to most recent data in the background.
 */
export function HabitCard({ habit, icon: Icon, onToggle }: HabitCardProps) {
  const isMobile = useIsMobile();
  const markComplete = useMarkHabitComplete();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Background scroll to end on mount
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft =
          scrollContainerRef.current.scrollWidth;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [habit.entries]);

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
    <Card className="bg-card border border-border/50 p-6 rounded-xl overflow-hidden shadow-none transition-seijaku-fast hover:border-border/80">
      <div className="flex flex-col gap-6">
        {/* Header: Title, Description + Toggle */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center min-w-0">
            {Icon && (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center border border-border/50 bg-secondary/30 shrink-0"
                style={{ color: habit.color }}
              >
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight text-foreground truncate">
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {habit.description}
                </p>
              )}
              {/* Mobile Stats Subtitle */}
              {isMobile && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-orange-500/90">
                    <Flame className="w-3 h-3" />
                    {currentStreak}d
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Trophy className="w-3 h-3" />
                    {totalCompletions}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Desktop Stats in Header */}
            {!isMobile && (
              <div className="flex items-center gap-6 mr-2">
                <div className="text-right">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                    Streak
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {currentStreak}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                    Total
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {totalCompletions}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleToggle}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-seijaku-fast shrink-0 ${
                isCompletedToday
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={
                isCompletedToday ? { backgroundColor: habit.color } : undefined
              }
              aria-label={
                isCompletedToday ? "Mark incomplete" : "Mark complete"
              }
            >
              {isCompletedToday ? (
                <Check className="w-5 h-5 text-black" strokeWidth={3} />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Heatmap Area - Large Visual Centerpiece */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-1 custom-scrollbar"
        >
          <HabitHeatmap
            entries={habit.entries}
            color={habit.color}
            blockSize={isMobile ? 10 : 12}
            blockMargin={2}
            startDate={habit.start_date}
          />
        </div>
      </div>
    </Card>
  );
}
