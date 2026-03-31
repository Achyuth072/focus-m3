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

const HABIT_ICONS = [
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
        className="flex flex-nowrap gap-2.5 overflow-x-auto scrollbar-hide py-1 px-4"
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
                trigger("MEDIUM");
                onChange(item.name);
              }}
              className={cn(
                "h-10 transition-all shrink-0 border rounded-lg shadow-none flex items-center justify-center",
                isSelected
                  ? "text-brand bg-brand/10 border-transparent hover:bg-brand/20 hover:text-brand"
                  : "border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground",
                variant === "compact" ? "w-10 px-0" : "px-3 min-w-[40px]",
              )}
            >
              <Icon
                strokeWidth={isSelected ? 2.5 : 2}
                className={cn("h-5 w-5", isSelected ? "scale-110" : "")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
