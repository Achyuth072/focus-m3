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

interface TaskPrioritySelectProps {
  priority: 1 | 2 | 3 | 4;
  setPriority: (value: 1 | 2 | 3 | 4) => void;
  variant?: "icon" | "compact";
  isMobile?: boolean;
}

export function TaskPrioritySelect({
  priority,
  setPriority,
  variant = "icon",
  isMobile = false,
}: TaskPrioritySelectProps) {
  const isCompact = variant === "compact";
  const { trigger } = useHaptic();

  return (
    <Select
      value={priority.toString()}
      onValueChange={(v) => {
        trigger(25);
        setPriority(parseInt(v) as 1 | 2 | 3 | 4);
      }}
      onOpenChange={(open) => {
        if (!open) trigger(10);
      }}
    >
      <SelectTrigger
        onPointerDown={() => trigger(15)}
        className={cn(
          "h-10 border transition-all shrink-0 focus:ring-0 [&>svg]:hidden group shadow-none",
          "border-input bg-background hover:bg-accent hover:text-accent-foreground",
          isCompact
            ? cn(
                "px-0",
                priority !== 4
                  ? "w-auto px-2.5 min-w-16"
                  : "w-10 justify-center",
                priority === 4 &&
                  "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                priorities.find((p) => p.value === priority)?.color,
                // For colored priorities (P1-P3), remove border to avoid clash with solid background
                priority !== 4 && "border-transparent"
              )
            : cn(
                "min-w-10 items-center justify-center",
                priority !== 4
                  ? "text-primary bg-primary/10 px-3 w-auto border-transparent hover:bg-primary/20 hover:text-primary"
                  : "px-0 w-10 text-muted-foreground hover:text-foreground hover:bg-accent"
              )
        )}
        title={!isMobile ? "Set priority" : undefined}
      >
        <div className="flex items-center gap-1.5 justify-center">
          <Flag
            strokeWidth={1.5}
            className={cn(
              isCompact ? "h-5 w-5" : "h-5 w-5 transition-all",
              priority === 1
                ? isCompact
                  ? "text-white h-3.5 w-3.5"
                  : "text-red-500 fill-red-500"
                : priority === 2
                ? isCompact
                  ? "text-white h-3.5 w-3.5"
                  : "text-orange-500 fill-orange-500"
                : priority === 3
                ? isCompact
                  ? "text-white h-3.5 w-3.5"
                  : "text-blue-500 fill-blue-500"
                : "" // Removed text-muted-foreground to match other icons
            )}
          />
          {isCompact && priority !== 4 && (
            <span className="text-xs font-semibold">
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
                    : p.color.split(" ")[0].replace("bg-", "text-")
                )}
              />
              <span className="font-medium">
                {p.label} -{" "}
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
