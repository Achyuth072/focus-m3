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
  Bike,
  Brain,
  Camera,
  Utensils,
  Gamepad2,
  GraduationCap,
  Coins,
  Languages,
  Medal,
  Monitor,
  Pizza,
  Plane,
  Rocket,
  Sun,
  Target,
  Trees,
  User,
  Zap,
} from "lucide-react";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";

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
  { name: "Bike", icon: Bike },
  { name: "Brain", icon: Brain },
  { name: "Camera", icon: Camera },
  { name: "Cooking", icon: Utensils },
  { name: "Gamepad", icon: Gamepad2 },
  { name: "Graduation", icon: GraduationCap },
  { name: "Finances", icon: Coins },
  { name: "Language", icon: Languages },
  { name: "Medal", icon: Medal },
  { name: "Monitor", icon: Monitor },
  { name: "Pizza", icon: Pizza },
  { name: "Plane", icon: Plane },
  { name: "Rocket", icon: Rocket },
  { name: "Sun", icon: Sun },
  { name: "Target", icon: Target },
  { name: "Trees", icon: Trees },
  { name: "User", icon: User },
  { name: "Zap", icon: Zap },
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
  const scrollRef = useHorizontalScroll();

  return (
    <div className="grid gap-1.5 w-full overflow-hidden">
      {variant !== "compact" && (
        <Label className="px-1 text-xs text-muted-foreground/60">Icon</Label>
      )}
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide py-1 px-1 snap-x snap-mandatory"
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
                "h-9 w-9 rounded-xl transition-all border flex items-center justify-center shrink-0 snap-start",
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
