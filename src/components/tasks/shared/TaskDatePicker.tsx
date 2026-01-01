"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { DateTimeWizard } from "@/components/ui/date-time-wizard";
import { cn } from "@/lib/utils";

interface TaskDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "icon" | "compact";
}

export function TaskDatePicker({
  date,
  setDate,
  isMobile,
  open,
  onOpenChange,
  variant = "icon",
}: TaskDatePickerProps) {
  const isCompact = variant === "compact";

  const buttonContent = (
    <div className="flex items-center gap-1.5">
      <CalendarIcon
        strokeWidth={1.5}
        className={cn(
          isCompact ? "h-5 w-5" : "h-5 w-5 transition-all",
          date && (isCompact ? "mr-1.5 h-4 w-4" : "text-primary")
        )}
      />
      {date && (
        <>
          <span className={cn("text-sm font-medium", isCompact ? "" : "text-primary ml-1")}>
            {format(date, "MMM d, h:mm a")}
          </span>
          <span
            role="button"
            title="Clear due date"
            className={cn(
              "ml-1 p-0.5 rounded",
              isCompact ? "hover:bg-destructive/20" : "rounded-full hover:bg-primary/20"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDate(undefined);
            }}
          >
            <X className={cn("h-3 w-3", isCompact && "hover:text-destructive")} />
          </span>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(true)}
          className={cn(
            "h-10 transition-all shrink-0 group [&_svg]:!size-5 dark:bg-white/[0.03] dark:border dark:border-white/10",
            isCompact
              ? cn(
                  "w-10 px-0 text-muted-foreground hover:text-foreground",
                  date && "w-auto px-2.5 text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                )
              : cn(
                  "min-w-10 px-0 shadow-sm",
                  date && "text-primary bg-primary/10 px-3 w-auto"
                )
          )}
          title="Set due date"
        >
          {buttonContent}
        </Button>
        <ResponsiveDialogContent
          className={cn(
            "w-full p-0",
            !isCompact && "max-w-[320px] mx-auto h-auto rounded-[10px] mb-4 bg-popover [&>div.h-2]:hidden"
          )}
        >
          <ResponsiveDialogHeader className="sr-only">
            <ResponsiveDialogTitle>Set Due Date</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <DateTimeWizard
            date={date}
            setDate={setDate}
            onClose={() => onOpenChange(false)}
          />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 transition-all shrink-0 group [&_svg]:!size-5 dark:bg-white/[0.03] dark:border dark:border-white/10",
            isCompact
              ? cn(
                  "w-10 px-0 text-muted-foreground hover:text-foreground",
                  date && "w-auto px-2.5 text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                )
              : cn(
                  "min-w-10 px-0 shadow-sm",
                  date && "text-primary bg-primary/10 px-3 w-auto"
                )
          )}
          title="Set due date"
        >
          {buttonContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
        <DateTimeWizard
          date={date}
          setDate={setDate}
          onClose={() => onOpenChange(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
