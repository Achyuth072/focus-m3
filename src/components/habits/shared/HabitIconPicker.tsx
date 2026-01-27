"use client";

import React from "react";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Flame,
  Heart,
  Dumbbell,
  Book,
  Coffee,
  Moon,
  Droplet,
  Smile,
  Pencil,
  Music,
  Code,
  Leaf,
} from "lucide-react";

export const HABIT_ICONS = [
  { name: "Flame", icon: Flame },
  { name: "Heart", icon: Heart },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Book", icon: Book },
  { name: "Coffee", icon: Coffee },
  { name: "Moon", icon: Moon },
  { name: "Droplet", icon: Droplet },
  { name: "Smile", icon: Smile },
  { name: "Pencil", icon: Pencil },
  { name: "Music", icon: Music },
  { name: "Code", icon: Code },
  { name: "Leaf", icon: Leaf },
];

export function getHabitIcon(iconName: string | null | undefined) {
  if (!iconName) return Flame; // Default icon
  const found = HABIT_ICONS.find((item) => item.name === iconName);
  return found ? found.icon : Flame;
}

interface HabitIconPickerProps {
  value: string;
  onChange: (value: string) => void;
  color?: string;
  variant?: "grid" | "compact" | "hero";
}

export function HabitIconPicker({
  value,
  onChange,
  color,
  variant = "grid",
}: HabitIconPickerProps) {
  const { trigger } = useHaptic();

  if (variant === "hero") {
    return (
      <div className="flex flex-col items-center sm:gap-6 gap-3 py-1 sm:py-2">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[28px] flex items-center justify-center border border-border/40 bg-secondary/5 shadow-none transition-seijaku-fast"
          style={{ color }}
        >
          {/* Use React.createElement to bypass lint rules for dynamic component resolution */}
          {React.createElement(getHabitIcon(value), {
            className: "w-8 h-8 sm:w-10 sm:h-10",
            strokeWidth: 2.25,
            style: { color },
          })}
        </div>
        <div
          className="flex flex-wrap justify-center gap-2 max-w-[320px]"
          role="radiogroup"
          aria-label="Habit icon"
        >
          {HABIT_ICONS.map((item) => {
            const Icon = item.icon;
            const isSelected = value === item.name;
            return (
              <button
                key={item.name}
                type="button"
                title={item.name}
                aria-label={item.name}
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  trigger(15);
                  onChange(item.name);
                }}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all border flex items-center justify-center shrink-0",
                  isSelected
                    ? "border-border/80 bg-secondary/50 scale-105 shadow-sm"
                    : "border-border/20 bg-transparent opacity-40 hover:opacity-100 hover:bg-secondary/10",
                )}
              >
                <Icon
                  strokeWidth={2.25}
                  className="h-5 w-5"
                  style={{ color: isSelected ? color : "currentColor" }}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {variant !== "compact" && <Label>Icon</Label>}
      <div
        className="flex flex-wrap gap-3 sm:gap-2"
        role="radiogroup"
        aria-label="Habit icon"
      >
        {HABIT_ICONS.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.name;
          return (
            <button
              key={item.name}
              type="button"
              title={item.name}
              aria-label={item.name}
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                trigger(15);
                onChange(item.name);
              }}
              className={cn(
                "h-10 w-10 sm:h-9 sm:w-9 rounded-xl transition-all border flex items-center justify-center shrink-0",
                isSelected
                  ? "border-border/80 bg-secondary/50 scale-105 shadow-sm"
                  : "border-border/30 bg-transparent opacity-60 hover:opacity-100 hover:bg-secondary/20",
              )}
            >
              <Icon
                strokeWidth={2.25}
                className="h-5 w-5"
                style={{ color: isSelected ? color : "currentColor" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
