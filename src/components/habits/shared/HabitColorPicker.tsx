"use client";

import { useHaptic } from "@/lib/hooks/useHaptic";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";

export const HABIT_COLORS = [
  { name: "Coral", value: "#FF6B6B" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Amber", value: "#D97706" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Emerald", value: "#10B981" },
  { name: "Green", value: "#22C55E" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#4B6CB7" }, // Default
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Pink", value: "#EC4899" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Slate", value: "#64748B" },
  { name: "Zinc", value: "#525252" },
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
  const scrollRef = useHorizontalScroll();

  if (variant === "compact") {
    return (
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1 flex-nowrap snap-x snap-mandatory"
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
              "h-7 w-7 rounded-xl transition-all border shrink-0 snap-start",
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
    <div className="grid gap-1.5 w-full overflow-hidden">
      <Label className="px-1 text-xs text-muted-foreground/60">Color</Label>
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide py-1 px-1 snap-x snap-mandatory"
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
              "h-9 w-9 rounded-xl transition-all border-2 shrink-0 snap-start",
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
