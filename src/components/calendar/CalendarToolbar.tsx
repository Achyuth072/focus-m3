"use client";

import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarStore } from "@/lib/calendar/store";
import type { CalendarView } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { ImportExportMenu } from "./ImportExportMenu";
import type { CalendarEventUI } from "@/lib/types/calendar-event";

interface CalendarToolbarProps {
  isMobile?: boolean;
  onCreateEvent: () => void;
  className?: string;
  events?: CalendarEventUI[];
}

export function CalendarToolbar({
  isMobile,
  onCreateEvent,
  className,
  events = [],
}: CalendarToolbarProps) {
  const { currentDate, view, setView, goToToday, next, prev } =
    useCalendarStore();
  const { trigger } = useHaptic();

  // Desktop views: Year, Month, Week, 4-Day, Day, Schedule
  // Mobile views: Month, Week, 3-Day, Schedule
  const availableViews: { value: CalendarView; label: string }[] = isMobile
    ? [
        { value: "month", label: "Month" },
        { value: "week", label: "Week" },
        { value: "3day", label: "3 Days" },
        { value: "day", label: "Day" },
        { value: "schedule", label: "Schedule" },
      ]
    : [
        { value: "year", label: "Year" },
        { value: "month", label: "Month" },
        { value: "week", label: "Week" },
        { value: "4day", label: "4 Days" },
        { value: "day", label: "Day" },
        { value: "schedule", label: "Schedule" },
      ];

  const getDateLabel = () => {
    switch (view) {
      case "year":
        return format(currentDate, "yyyy");
      case "month":
        return isMobile
          ? format(currentDate, "MMM yyyy")
          : format(currentDate, "MMMM yyyy");
      case "week":
      case "3day":
      case "4day":
        return format(currentDate, "MMM yyyy");
      case "day":
        // Extra short format on mobile to prevent overflow on small screens
        return isMobile
          ? format(currentDate, "MMM d")
          : format(currentDate, "EEEE, MMMM d, yyyy");
      case "schedule":
        return "Schedule";
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-1 px-2 py-2 sm:p-4 md:p-6 border-b bg-background/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Left: Date Navigation Cluster */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size={isMobile ? "icon" : "default"}
          onClick={() => {
            trigger("LIGHT");
            goToToday();
          }}
          className="h-9 bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none transition-seijaku-fast"
        >
          <CalendarIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Today</span>
        </Button>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shadow-none transition-seijaku-fast rounded-full"
            onClick={() => {
              trigger("LIGHT");
              prev();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shadow-none transition-seijaku-fast rounded-full"
            onClick={() => {
              trigger("LIGHT");
              next();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center: Flexible Date Label */}
      <div className="flex-1 flex justify-center min-w-0 px-1 sm:px-2 overflow-hidden">
        <div className="text-base sm:text-xl md:text-2xl font-bold tracking-tight truncate max-w-full">
          {getDateLabel()}
        </div>
      </div>

      {/* Right: View Selector & Actions Unified */}
      <div className="flex items-center gap-0.5 sm:gap-2 shrink-0 justify-end">
        <Select
          value={view}
          onValueChange={(v) => {
            trigger("MEDIUM");
            setView(v as CalendarView);
          }}
        >
          <SelectTrigger className="w-22 sm:w-28 md:w-35 h-9 text-xs md:text-sm px-2 sm:px-3 font-semibold bg-secondary/40 border-border/50 shadow-none hover:bg-secondary/60 transition-seijaku-fast shrink-0 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="shadow-none border-border/80">
            {availableViews.map((viewOption) => (
              <SelectItem key={viewOption.value} value={viewOption.value}>
                {viewOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-2">
          {/* Desktop-only Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                trigger("LIGHT");
                onCreateEvent();
              }}
              className="hidden md:flex h-9 items-center gap-2 bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none"
            >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                trigger("MEDIUM");
                // TODO: Trigger manual event refresh
              }}
              className="hidden md:flex h-9 w-9 p-0 items-center justify-center bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none"
            >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Import/Export Menu (The triple dot ⋮ on mobile) */}
          <ImportExportMenu events={events} />
        </div>
      </div>
    </div>
  );
}
