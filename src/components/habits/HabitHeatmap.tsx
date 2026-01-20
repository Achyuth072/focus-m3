"use client";

import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import type { HabitEntry } from "@/lib/hooks/useHabits";

interface HabitHeatmapProps {
  entries: HabitEntry[];
  color: string;
  className?: string;
}

/**
 * HabitHeatmap Component
 *
 * Renders a GitHub-style activity heatmap for habit tracking.
 * Uses react-activity-calendar with a monochromatic theme based on habit color.
 *
 * @param entries - Array of habit entries (date + value)
 * @param color - Hex color for the habit (e.g., "#10b981")
 * @param className - Optional CSS class for container styling
 */
export function HabitHeatmap({ entries, color, className }: HabitHeatmapProps) {
  // Transform habit entries to react-activity-calendar format
  const calendarData = entries.map((entry) => ({
    date: entry.date,
    count: entry.value, // Display value in tooltip
    level: entry.value === 0 ? 0 : Math.min(Math.ceil(entry.value * 4), 4), // Map to 0-4 levels
  }));

  // Generate monochromatic theme from dark base to habit color
  const theme = {
    dark: ["#1a1a1a", `${color}33`, `${color}66`, `${color}99`, color],
    light: ["#f0f0f0", `${color}33`, `${color}66`, `${color}99`, color],
  };

  return (
    <div className={className}>
      <ActivityCalendar
        data={calendarData}
        theme={theme}
        blockSize={9}
        blockMargin={2}
        blockRadius={2}
        fontSize={12}
        showColorLegend={false}
        showMonthLabels={false}
        showTotalCount={false}
        labels={{
          months: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          totalCount: "{{count}} completions in {{year}}",
          legend: {
            less: "Less",
            more: "More",
          },
        }}
      />
    </div>
  );
}
