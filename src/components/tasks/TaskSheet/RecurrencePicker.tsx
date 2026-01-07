"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecurrenceRule } from "@/lib/utils/recurrence";
import { formatRecurrenceRule } from "@/lib/utils/recurrence";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface RecurrencePickerProps {
  value: RecurrenceRule | null;
  onChange: (value: RecurrenceRule | null) => void;
  variant?: "default" | "icon";
}

const PRESET_RULES: { label: string; value: RecurrenceRule | null }[] = [
  { label: "Does not repeat", value: null },
  { label: "Daily", value: { freq: "DAILY", interval: 1 } },
  { label: "Weekly", value: { freq: "WEEKLY", interval: 1 } },
  { label: "Monthly", value: { freq: "MONTHLY", interval: 1 } },
  { label: "Yearly", value: { freq: "YEARLY", interval: 1 } },
];

// Helper to get the letter code for the badge
function getRecurrenceBadge(value: RecurrenceRule | null) {
  if (!value) return null;
  
  if (value.interval === 1) {
    switch (value.freq) {
      case "DAILY": return "D";
      case "WEEKLY": return "W";
      case "MONTHLY": return "M";
      case "YEARLY": return "Y";
    }
  }
  return "C"; // Custom
}

export default function RecurrencePicker({
  value,
  onChange,
  variant = "default",
}: RecurrencePickerProps) {
  const [open, setOpen] = useState(false);
  const isIconVariant = variant === "icon";
  const hasRecurrence = value !== null;
  const badgeLetter = getRecurrenceBadge(value);
  const { trigger } = useHaptic();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isIconVariant ? (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 w-10 p-0 transition-all shadow-sm dark:bg-white/[0.03] dark:border dark:border-white/10 group relative",
              hasRecurrence
                ? "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={() => {
              trigger(25);
            }}
            title={formatRecurrenceRule(value)}
          >
            <Repeat className="h-5 w-5 transition-all" strokeWidth={2} />
            {hasRecurrence && badgeLetter && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {badgeLetter}
              </span>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-10"
          >
            <Repeat className="mr-2 h-4 w-4" />
            {formatRecurrenceRule(value)}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {PRESET_RULES.map((preset) => (
            <Button
              key={preset.label}
              variant={
                JSON.stringify(value) === JSON.stringify(preset.value)
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
              onClick={() => {
                trigger(20);
                onChange(preset.value);
                setOpen(false);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
