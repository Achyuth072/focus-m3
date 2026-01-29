"use client";

import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
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

interface CalendarToolbarProps {
  isMobile?: boolean;
  className?: string;
}

export function CalendarToolbar({ isMobile, className }: CalendarToolbarProps) {
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
            trigger(10);
            goToToday();
          }}
          className={cn(isMobile && "h-8 w-8")}
        >
          <CalendarIcon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Today</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              trigger(10);
              prev();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              trigger(10);
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

      {/* Right: View Selector */}
      <Select
        value={view}
        onValueChange={(v) => {
          trigger(15);
          setView(v as CalendarView);
        }}
      >
        <SelectTrigger className="w-28 md:w-35 h-8 md:h-9 text-xs md:text-sm px-3 font-medium bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableViews.map((viewOption) => (
            <SelectItem key={viewOption.value} value={viewOption.value}>
              {viewOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
