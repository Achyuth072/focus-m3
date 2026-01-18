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
import { LucideIcon } from "lucide-react";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface TaskDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "icon" | "compact";
  title?: string;
  activeClassName?: string;
  icon?: LucideIcon;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
}

export function TaskDatePicker({
  date,
  setDate,
  isMobile,
  open,
  onOpenChange,
  variant = "icon",
  title = "Due Date",
  activeClassName = "text-brand bg-brand/10 hover:bg-brand/20 hover:text-brand",
  icon: Icon = CalendarIcon,
  side = "bottom",
  sideOffset = 4,
  align = "start",
}: TaskDatePickerProps) {
  const isCompact = variant === "compact";
  const { trigger } = useHaptic();

  const buttonContent = (
    <div className="flex items-center gap-1.5">
      <Icon
        strokeWidth={1.5}
        className={cn(
          isCompact ? "h-5 w-5" : "h-5 w-5 transition-all",
          date && (isCompact ? "mr-1.5 h-4 w-4" : "text-primary"),
        )}
      />
      {date && (
        <>
          <span className={cn("text-sm font-medium", isCompact ? "" : "ml-1")}>
            {format(date, "MMM d, h:mm a")}
          </span>
          <span
            role="button"
            title={!isMobile ? `Clear ${title.toLowerCase()}` : undefined}
            className={cn(
              "ml-1 p-0.5 rounded",
              isCompact
                ? "hover:bg-destructive/20"
                : "rounded-full hover:bg-current/10",
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              trigger(15);
              setDate(undefined);
            }}
          >
            <X
              className={cn("h-3 w-3", isCompact && "hover:text-destructive")}
            />
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
          onClick={() => {
            trigger(25);
            onOpenChange(true);
          }}
          className={cn(
            "h-10 transition-all shrink-0 group [&_svg]:!size-5 border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-none",
            isCompact
              ? cn(
                  "w-10 px-0 text-muted-foreground hover:text-foreground",
                  date &&
                    cn("w-auto px-2.5 border-transparent", activeClassName),
                )
              : cn(
                  "min-w-10 px-0 text-muted-foreground hover:text-foreground hover:bg-accent",
                  date &&
                    cn(
                      "px-3 w-auto hover:bg-transparent border-transparent",
                      activeClassName,
                    ),
                ),
          )}
          title={!isMobile ? `Set ${title.toLowerCase()}` : undefined}
        >
          {buttonContent}
        </Button>
        <ResponsiveDialogContent
          className={cn(
            "w-full p-0",
            !isCompact &&
              "max-w-[320px] mx-auto h-auto rounded-[10px] mb-4 bg-popover [&>div.h-2]:hidden",
          )}
        >
          <ResponsiveDialogHeader className="sr-only">
            <ResponsiveDialogTitle>Set {title}</ResponsiveDialogTitle>
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
            "h-10 transition-all shrink-0 group [&_svg]:!size-5 border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-none",
            isCompact
              ? cn(
                  "w-10 px-0 text-muted-foreground hover:text-foreground",
                  date &&
                    cn("w-auto px-2.5 border-transparent", activeClassName),
                )
              : cn(
                  "min-w-10 px-0 text-muted-foreground hover:text-foreground hover:bg-accent",
                  date &&
                    cn(
                      "px-3 w-auto hover:bg-transparent border-transparent",
                      activeClassName,
                    ),
                ),
          )}
          title={!isMobile ? `Set ${title.toLowerCase()}` : undefined}
        >
          {buttonContent}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-none shadow-xl"
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <DateTimeWizard
          date={date}
          setDate={setDate}
          onClose={() => onOpenChange(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
