"use client";

import { useHaptic } from "@/lib/hooks/useHaptic";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const HABIT_COLORS = [
  { name: "Coral", value: "#FF6B6B" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Indigo", value: "#4B6CB7" }, // Default
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Slate", value: "#64748B" },
];

interface HabitColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  variant?: "grid" | "compact";
}

export function HabitColorPicker({
  value,
  onChange,
  variant = "grid",
}: HabitColorPickerProps) {
  const { trigger } = useHaptic();

  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1"
        role="radiogroup"
        aria-label="Habit color"
      >
        {HABIT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            aria-label={c.name}
            role="radio"
            aria-checked={value === c.value}
            onClick={() => {
              trigger(15);
              onChange(c.value);
            }}
            className={cn(
              "h-6 w-6 rounded-lg transition-all border shrink-0",
              value === c.value
                ? "border-border/80 scale-110 shadow-sm"
                : "border-transparent opacity-60 hover:opacity-100 hover:scale-105",
            )}
            style={{
              backgroundColor: c.value,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label>Color</Label>
      <div
        className="flex flex-wrap gap-3 sm:gap-2"
        role="radiogroup"
        aria-label="Habit color"
      >
        {HABIT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            aria-label={c.name}
            role="radio"
            aria-checked={value === c.value}
            onClick={() => {
              trigger(15);
              onChange(c.value);
            }}
            className={cn(
              "h-10 w-10 sm:h-8 sm:w-8 rounded-xl transition-all border-2",
              value === c.value
                ? "border-current opacity-100 scale-110 shadow-sm"
                : "border-transparent opacity-70 hover:opacity-90 hover:scale-105",
            )}
            style={{
              backgroundColor: c.value,
              borderColor: value === c.value ? c.value : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}
