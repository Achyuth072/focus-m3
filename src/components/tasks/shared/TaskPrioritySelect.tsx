"use client";

import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useHaptic } from "@/lib/hooks/useHaptic";

export const priorities: {
  value: 1 | 2 | 3 | 4;
  label: string;
  color: string;
}[] = [
  { value: 1, label: "P1", color: "bg-red-500 text-white hover:bg-red-600" },
  {
    value: 2,
    label: "P2",
    color: "bg-orange-500 text-white hover:bg-orange-600",
  },
  { value: 3, label: "P3", color: "bg-blue-500 text-white hover:bg-blue-600" },
  {
    value: 4,
    label: "P4",
    color: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
];

// Priority-specific icon colors for the trigger button
const priorityIconColor: Record<number, string> = {
  1: "text-red-500 fill-red-500",
  2: "text-orange-500 fill-orange-500",
  3: "text-blue-500 fill-blue-500",
};

interface TaskPrioritySelectProps {
  priority: 1 | 2 | 3 | 4;
  setPriority: (value: 1 | 2 | 3 | 4) => void;
  variant?: "icon" | "compact";
  isMobile?: boolean;
}

export function TaskPrioritySelect({
  priority,
  setPriority,
  isMobile = false,
}: TaskPrioritySelectProps) {
  const { trigger } = useHaptic();
  const isSelected = priority !== 4;

  return (
    <Select
      value={priority.toString()}
      onValueChange={(v) => {
        trigger("LIGHT");
        setPriority(parseInt(v) as 1 | 2 | 3 | 4);
      }}
      onOpenChange={(open) => {
        if (!open) trigger("LIGHT");
      }}
    >
      <SelectTrigger
        onPointerDown={() => trigger("MEDIUM")}
        className={cn(
          // Base — exactly matches the Evening / Subtasks / DatePicker tags
          "h-10 transition-all shrink-0 [&>svg]:hidden shadow-none border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg outline-none focus:ring-0 focus:outline-none",
          // Unselected (P4 / Low): icon-only pill
          !isSelected && "w-10 px-0 text-muted-foreground hover:text-foreground",
          // Selected (P1-P3): labelled pill with brand outline active state
          isSelected &&
            "w-auto px-2.5 min-w-[68px] text-brand bg-brand/10 border-transparent hover:bg-brand/20 hover:text-brand",
        )}
        title={!isMobile ? "Set priority" : undefined}
      >
        <div className="flex items-center gap-1.5 justify-center w-full">
          <Flag
            strokeWidth={2.25}
            className={cn(
              "h-5 w-5 transition-all shrink-0",
              isSelected
                ? priorityIconColor[priority]
                : "text-muted-foreground",
            )}
          />
          {isSelected && (
            <span className="text-sm font-medium">
              {priorities.find((p) => p.value === priority)?.label}
            </span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {priorities.map((p) => (
          <SelectItem key={p.value} value={p.value.toString()}>
            <div className="flex items-center gap-2">
              <Flag
                className={cn(
                  "h-3.5 w-3.5",
                  p.value === 4
                    ? "text-muted-foreground"
                    : p.color.split(" ")[0].replace("bg-", "text-"),
                )}
              />
              <span className="font-medium">
                {p.label} —{" "}
                {p.value === 1
                  ? "Urgent"
                  : p.value === 2
                    ? "High"
                    : p.value === 3
                      ? "Normal"
                      : "Low"}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
