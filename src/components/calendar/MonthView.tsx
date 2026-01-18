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
import { EventOverflowPopover } from "./EventOverflowPopover";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  className?: string;
  "data-testid"?: string;
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
          "relative p-1 md:p-2 flex flex-col min-h-[100px] md:min-h-[120px]",
          "cursor-pointer transition-colors",
          !isCurrentMonth && "bg-muted/5 opacity-40",
          isCurrentDay ? "bg-brand/15 hover:bg-brand/25" : "hover:bg-accent/30",
        )}
      >
        {/* Date number */}
        <div className="flex items-center justify-between mb-0.5 md:mb-1 shrink-0">
          <span
            className={cn(
              "text-xs md:text-sm font-medium transition-all",
              isCurrentDay &&
                "flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-lg bg-brand text-white shadow-sm",
              !isCurrentMonth && "text-muted-foreground/50",
            )}
          >
            {format(day, "d")}
          </span>
        </div>

        {/* Events */}
        <div className="flex-1 min-h-0 space-y-0.5 md:space-y-1 overflow-hidden relative z-10">
          {visibleEvents.map((event) => (
            <div
              key={event.id}
              className="text-[10px] md:text-[11px] px-1.5 md:px-2 py-0.5 rounded-sm truncate bg-(--event-color)/20 text-foreground font-semibold leading-tight"
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
            <EventOverflowPopover
              remainingEvents={dayEvents.slice(maxVisible)}
              day={day}
            />
          )}
        </div>
      </div>
    );
  },
);

MonthDayCell.displayName = "MonthDayCell";

const MonthView = memo(
  ({
    currentDate,
    events,
    onDateClick,
    className,
    "data-testid": testId,
  }: MonthViewProps) => {
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
      <div
        data-testid={testId}
        className={cn(
          "h-full flex flex-col overflow-hidden bg-background",
          className,
        )}
      >
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border/40">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          className={cn(
            "flex-1 grid grid-cols-7 divide-x divide-border/[0.08] divide-y divide-border/[0.08] border-b border-r border-border/[0.08]",
            numWeeks === 5 ? "grid-rows-5" : "grid-rows-6",
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
  },
);

MonthView.displayName = "MonthView";

export { MonthView };
