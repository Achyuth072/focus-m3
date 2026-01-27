"use client";

import { FieldErrors } from "react-hook-form";
import { CreateHabitInput } from "@/lib/schemas/habit";
import {
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, CalendarIcon } from "lucide-react";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useHorizontalScroll } from "@/lib/hooks/useHorizontalScroll";
import { HabitColorPicker } from "./shared/HabitColorPicker";
import { HabitIconPicker } from "./shared/HabitIconPicker";
import { TaskDatePicker } from "../tasks/shared/TaskDatePicker";

interface HabitCreateViewProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  icon: string;
  setIcon: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (value: Date | undefined) => void;
  datePickerOpen: boolean;
  setDatePickerOpen: (value: boolean) => void;
  isMobile: boolean;
  hasContent: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  errors?: FieldErrors<CreateHabitInput>;
}

export function HabitCreateView({
  name,
  setName,
  description,
  setDescription,
  color,
  setColor,
  icon,
  setIcon,
  startDate,
  setStartDate,
  datePickerOpen,
  setDatePickerOpen,
  isMobile,

  hasContent,
  isPending,
  onSubmit,
  onKeyDown,
  errors,
}: HabitCreateViewProps) {
  const scrollRef = useHorizontalScroll();
  const { trigger } = useHaptic();

  return (
    <div className="flex flex-col flex-1 overflow-hidden w-full max-w-full">
      <ResponsiveDialogHeader className="px-4 pt-6 shrink-0">
        <ResponsiveDialogTitle className="type-h2">
          New Habit
        </ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 w-full scrollbar-none">
        {/* Hero Icon Selection */}
        <HabitIconPicker
          value={icon}
          onChange={setIcon}
          color={color}
          variant="hero"
        />

        {/* Name & Description Inputs */}
        <div className="sm:space-y-4 space-y-2">
          <div className="space-y-1">
            <Label htmlFor="habit-name" className="sr-only">
              Habit Name
            </Label>
            <Textarea
              id="habit-name"
              placeholder="Habit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              className={cn(
                "text-2xl sm:text-3xl font-semibold p-0 min-h-[40px] h-auto bg-transparent border-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/30 tracking-tight leading-tight",
                errors?.name &&
                  "text-destructive placeholder:text-destructive/50",
              )}
              aria-invalid={!!errors?.name}
            />
            {errors?.name && (
              <p className="text-xs font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="habit-description" className="sr-only">
              Description
            </Label>
            <Textarea
              id="habit-description"
              placeholder="Add details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-[15px] p-0 min-h-[24px] h-auto bg-transparent border-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/40 leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <HabitColorPicker value={color} onChange={setColor} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 grid grid-cols-[1fr_auto] gap-4 p-4 border-t border-border/40 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background w-full max-w-full">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-nowrap min-w-0 pr-8 py-1 mask-linear-horizontal"
        >
          <TaskDatePicker
            date={startDate}
            setDate={setStartDate}
            isMobile={isMobile}
            open={datePickerOpen}
            onOpenChange={setDatePickerOpen}
            variant="icon"
            icon={CalendarIcon}
            title="Start Date"
            showTime={true}
            allowPastDates={true}
            side="top"
            align="start"
            sideOffset={15}
          />
        </div>

        <Button
          size="sm"
          className="h-10 w-10 p-0 rounded-lg bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg shadow-brand/10 transition-seijaku flex items-center justify-center"
          onClick={() => {
            trigger([10, 50]);
            onSubmit();
          }}
          disabled={!hasContent || isPending}
          aria-label={isPending ? "Creating habit" : "Start habit"}
        >
          <Send className="h-5 w-5 stroke-[2.25px]" />
        </Button>
      </div>
    </div>
  );
}
