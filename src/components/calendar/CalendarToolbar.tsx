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
  // Mobile views: Month, Week, 3-Day, Day, Schedule
  const availableViews: {
    value: CalendarView;
    label: string;
    shortLabel?: string;
  }[] = isMobile
    ? [
        { value: "month", label: "Month", shortLabel: "Mon" },
        { value: "week", label: "Week", shortLabel: "Wk" },
        { value: "3day", label: "3-Day", shortLabel: "3D" },
        { value: "day", label: "Day", shortLabel: "Day" },
        { value: "schedule", label: "Schedule", shortLabel: "Sch" },
      ]
    : [
        { value: "year", label: "Year" },
        { value: "month", label: "Month" },
        { value: "week", label: "Week" },
        { value: "4day", label: "4-Day" },
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
        "flex flex-row items-center justify-between gap-1 px-2 md:px-4 py-3 border-b bg-background/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Left Cluster: Navigation on desktop / Nav Cluster on mobile */}
      <div className={cn("flex items-center gap-2 shrink-0")}>
        {!isMobile ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="default"
              onClick={() => {
                trigger("tick");
                goToToday();
              }}
              className="h-9 bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none transition-seijaku-fast text-[13px] font-medium rounded-lg px-3"
            >
              <CalendarIcon className="h-4 w-4 md:mr-2" strokeWidth={2.25} />
              <span className="hidden md:inline">Today</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shadow-none transition-seijaku-fast rounded-full"
                onClick={() => {
                  trigger("tick");
                  prev();
                }}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shadow-none transition-seijaku-fast rounded-full"
                onClick={() => {
                  trigger("tick");
                  next();
                }}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 border border-border/40">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/80 transition-seijaku-fast rounded-md"
              onClick={() => {
                trigger("tick");
                prev();
              }}
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/80 transition-seijaku-fast rounded-md"
              onClick={() => {
                trigger("tick");
                goToToday();
              }}
            >
              <CalendarIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/80 transition-seijaku-fast rounded-md"
              onClick={() => {
                trigger("tick");
                next();
              }}
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Button>
          </div>
        )}
      </div>

      {/* Middle: Date Label */}
      <div
        className={cn(
          "flex-1 flex min-w-0 px-1 overflow-hidden",
          isMobile ? "justify-center" : "justify-center",
        )}
      >
        <div
          className={cn(
            "font-semibold tracking-tight truncate max-w-full",
            isMobile ? "text-base font-bold" : "text-[28px] tracking-[-0.03em]",
          )}
        >
          {getDateLabel()}
        </div>
      </div>

      {/* Right Cluster: View Select + Menu */}
      <div className="flex items-center gap-1.5 shrink-0 justify-end">
        <Select
          value={view}
          onValueChange={(v) => {
            trigger("toggle");
            setView(v as CalendarView);
          }}
        >
          <SelectTrigger
            className={cn(
              "h-9 text-[13px] px-3 font-medium bg-secondary/40 border-border/50 shadow-none hover:bg-secondary/60 transition-seijaku-fast shrink-0 rounded-lg",
              isMobile ? "w-[90px]" : "w-[110px]",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-0 shadow-none border-border/80">
            {availableViews.map((viewOption) => (
              <SelectItem
                key={viewOption.value}
                value={viewOption.value}
                className="text-[13px] pr-6"
              >
                {viewOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                trigger("toggle");
              }}
              className="h-9 w-9 p-0 items-center justify-center bg-secondary/40 hover:bg-secondary/60 border border-border/50 shadow-none rounded-lg"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
            </Button>

            <Button
              size="sm"
              onClick={() => {
                trigger("tick");
                onCreateEvent();
              }}
              className="h-9 items-center gap-2 px-4 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 border-none shadow-sm shadow-brand/10 transition-seijaku shrink-0 text-[13px] font-semibold"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
              <span>New Event</span>
            </Button>
          </>
        )}

        <ImportExportMenu events={events} />
      </div>
    </div>
  );
}
