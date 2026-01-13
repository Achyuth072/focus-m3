"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

interface MonthDayCellProps {
  day: Date;
  dayEvents: CalendarEvent[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  onDateClick?: (date: Date) => void;
}

const MonthDayCell = memo(
  ({
    day,
    dayEvents,
    isCurrentMonth,
    isCurrentDay,
    onDateClick,
  }: MonthDayCellProps) => {
    const maxVisible = 3;
    const visibleEvents = dayEvents.slice(0, maxVisible);
    const remainingCount = dayEvents.length - maxVisible;

    return (
      <div
        onClick={() => onDateClick?.(day)}
        className={cn(
          "relative p-1 md:p-2 border-r border-b border-border/40 flex flex-col",
          "hover:bg-accent/50 cursor-pointer transition-colors",
          !isCurrentMonth && "bg-muted/5"
        )}
      >
        {/* Date number */}
        <div className="flex items-center justify-between mb-0.5 md:mb-1 shrink-0">
          <span
            className={cn(
              "text-xs md:text-sm font-medium",
              isCurrentDay &&
                "flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-md bg-primary text-primary-foreground",
              !isCurrentMonth && "text-muted-foreground/30"
            )}
          >
            {format(day, "d")}
          </span>
        </div>

        {/* Events */}
        <div className="flex-1 min-h-0 space-y-0.5 md:space-y-1 overflow-hidden">
          {visibleEvents.map((event) => (
            <div
              key={event.id}
              className="text-[10px] md:text-xs px-1 md:px-2 py-0.5 rounded border truncate bg-(--event-color)/15 border-(--event-color)/30 text-foreground font-medium"
              style={
                {
                  "--event-color": event.color || "hsl(var(--primary))",
                } as React.CSSProperties
              }
              title={event.title}
            >
              <span className="hidden md:inline">
                {format(event.start, "h:mm a")}{" "}
              </span>
              {event.title}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-[10px] md:text-xs text-muted-foreground px-1 md:px-2">
              +{remainingCount} more
            </div>
          )}
        </div>
      </div>
    );
  }
);

MonthDayCell.displayName = "MonthDayCell";

const MonthView = memo(
  ({ currentDate, events, onDateClick, className }: MonthViewProps) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Calculate number of weeks (rows) needed
    const numWeeks = Math.ceil(days.length / 7);

    // Memoize event grouping to avoid recalculating on every render
    const eventsByDay = useMemo(() => {
      const map = new Map<string, CalendarEvent[]>();
      events.forEach((event) => {
        const dayKey = format(event.start, "yyyy-MM-dd");
        if (!map.has(dayKey)) {
          map.set(dayKey, []);
        }
        map.get(dayKey)!.push(event);
      });
      return map;
    }, [events]);

    return (
      <div className={cn("h-full flex flex-col bg-background", className)}>
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border/40">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          className={cn(
            "flex-1 grid grid-cols-7 border-l border-t border-border/40",
            numWeeks === 5 ? "grid-rows-5" : "grid-rows-6"
          )}
        >
          {days.map((day) => (
            <MonthDayCell
              key={format(day, "yyyy-MM-dd")}
              day={day}
              dayEvents={eventsByDay.get(format(day, "yyyy-MM-dd")) || []}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isCurrentDay={isToday(day)}
              onDateClick={onDateClick}
            />
          ))}
        </div>
      </div>
    );
  }
);

MonthView.displayName = "MonthView";

export { MonthView };
