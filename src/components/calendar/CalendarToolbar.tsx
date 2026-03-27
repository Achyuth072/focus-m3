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
        // Shorter format on mobile to prevent overflow
        return isMobile
          ? format(currentDate, "EEE, MMM d")
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
        "flex items-center justify-between gap-4 p-4 md:p-6 border-b bg-background/50 backdrop-blur-md sticky top-0 z-20",
        className,
      )}
    >
      {/* Left: Date Navigation */}
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="outline"
          size={isMobile ? "icon" : "default"}
          onClick={() => {
            trigger("LIGHT");
            goToToday();
          }}
          className={cn(
            "shadow-none border-border/80 hover:bg-accent/50",
            isMobile && "h-8 w-8",
          )}
        >
          <CalendarIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Today</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
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
            onClick={() => {
              trigger("LIGHT");
              next();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-lg md:text-2xl font-semibold min-w-0 md:min-w-50 truncate">
          {getDateLabel()}
        </div>
      </div>

      {/* Right: View Selector & Creation */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <Select
          value={view}
          onValueChange={(v) => {
            trigger("MEDIUM");
            setView(v as CalendarView);
          }}
        >
          <SelectTrigger className="w-28 md:w-35 h-9 text-xs md:text-sm px-3 font-medium bg-background shadow-none border-border/80 hover:bg-accent/50 hover:text-accent-foreground transition-colors">
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

        {/* Actions Group */}
        <div className="flex items-center gap-2">
          {/* Desktop-only New Event Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trigger("LIGHT");
              onCreateEvent();
            }}
            className="hidden md:flex h-9 items-center gap-2 border-border/80 shadow-none hover:bg-accent/50"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Button>

          {/* Sync (Refresh) Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              trigger("MEDIUM");
              // TODO: Trigger manual event refresh
            }}
            className="hidden md:flex h-9 w-9 p-0 items-center justify-center border-border/80 shadow-none hover:bg-accent/50"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Import/Export Options */}
          <ImportExportMenu events={events} />
        </div>
      </div>
    </div>
  );
}
