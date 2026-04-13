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
  onDateNumberClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  "data-testid"?: string;
}

interface MonthDayCellProps {
  day: Date;
  dayEvents: CalendarEvent[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  onDateClick?: (date: Date) => void;
  onDateNumberClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const MonthDayCell = memo(
  ({
    day,
    dayEvents,
    isCurrentMonth,
    isCurrentDay,
    onDateClick,
    onDateNumberClick,
    onEventClick,
  }: MonthDayCellProps) => {
    // Show only 2 events if there are more than 3, to prevent partial visibility of 3rd event
    const maxVisible = dayEvents.length > 3 ? 2 : 3;
    const visibleEvents = dayEvents.slice(0, maxVisible);
    const remainingCount = dayEvents.length - maxVisible;

    return (
      <div
        onClick={() => onDateClick?.(day)}
        className={cn(
          "relative p-1 pb-0.5 md:p-2 md:pb-1 flex flex-col h-full min-h-[85px] md:min-h-[120px]",
          "cursor-pointer transition-colors",
          !isCurrentMonth && "bg-muted/5 opacity-40",
          isCurrentDay
            ? "bg-brand/5 ring-1 ring-brand/10"
            : "hover:bg-accent/30",
        )}
      >
        {/* Date number */}
        <div className="flex items-center justify-between mb-0.5 md:mb-0.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDateNumberClick?.(day);
            }}
            className={cn(
              "text-xs md:text-sm font-medium transition-all hover:opacity-70",
              "min-w-6 min-h-6 flex items-center justify-center rounded-lg",
              isCurrentDay && "bg-brand text-white shadow-sm hover:opacity-100",
              !isCurrentMonth && "text-muted-foreground/50",
            )}
          >
            {format(day, "d")}
          </button>
        </div>

        {/* Events */}
        <div className="flex-1 min-h-0 relative z-10 flex flex-col">
          <div className="space-y-0.5 md:space-y-1 overflow-hidden flex-1">
            {visibleEvents.map((event) => {
              const isTask = event.category === "task";
              return (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                  className={cn(
                    "text-[10px] md:text-[11px] px-1.5 md:px-2 py-0.5 rounded-sm truncate font-semibold leading-tight hover:brightness-95 transition-all cursor-pointer",
                    isTask
                      ? "bg-transparent border-[1.5px] border-brand text-foreground"
                      : "bg-brand text-white",
                  )}
                  title={event.title}
                >
                  <span className="hidden md:inline">
                    {format(event.start, "h:mm a")}{" "}
                  </span>
                  {event.title}
                </div>
              );
            })}
          </div>
          {remainingCount > 0 && (
            <EventOverflowPopover
              remainingEvents={dayEvents.slice(maxVisible)}
              day={day}
              onEventClick={onEventClick}
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
    onDateNumberClick,
    onEventClick,
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
            "flex-1 min-h-0 grid grid-cols-7 overflow-y-auto md:overflow-hidden divide-x divide-border/40 divide-y divide-border/40 border-b border-r border-border/40",
            numWeeks === 4 && "grid-rows-4",
            numWeeks === 5 && "grid-rows-5",
            numWeeks === 6 && "grid-rows-6",
          )}
          style={{ gridTemplateRows: `repeat(${numWeeks}, minmax(0, 1fr))` }}
        >
          {days.map((day) => (
            <MonthDayCell
              key={format(day, "yyyy-MM-dd")}
              day={day}
              dayEvents={eventsByDay.get(format(day, "yyyy-MM-dd")) || []}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isCurrentDay={isToday(day)}
              onDateClick={onDateClick}
              onDateNumberClick={onDateNumberClick}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    );
  },
);

MonthView.displayName = "MonthView";

export { MonthView };
