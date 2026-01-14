"use client";

import { format, isSameDay } from "date-fns";
import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { getDayRange, layoutDayRange } from "@/lib/calendar/engine";
import type { CalendarEvent } from "@/lib/calendar/types";

const HOUR_HEIGHT = 120; // 60 minutes * 2 pixels

interface TimeGridProps {
  startDate: Date;
  daysToShow: number; // 1 for Day, 3 for Mobile, 4 for Desktop, 7 for Week
  events: CalendarEvent[];
  className?: string;
  "data-testid"?: string;
}

export function TimeGrid({
  startDate,
  daysToShow,
  events,
  className,
  "data-testid": testId,
}: TimeGridProps) {
  const dates = getDayRange(startDate, daysToShow);

  // Memoize expensive layout calculations
  const columns = useMemo(() => layoutDayRange(events, dates), [events, dates]);
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  return (
    <div
      data-testid={testId || "time-grid"}
      className={cn("flex h-full overflow-auto bg-background", className)}
    >
      {/* Time Labels Column */}
      <div className="w-16 flex-shrink-0">
        <div className="h-16" /> {/* Spacer for header */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-[10px] md:text-xs text-muted-foreground/50 text-right pr-3 pt-2 font-medium"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {format(new Date().setHours(hour, 0), "h a")}
          </div>
        ))}
      </div>

      {/* Days Columns */}
      <div
        className="flex-1 grid divide-x divide-border/[0.08]"
        style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}
      >
        {columns.map((column) => {
          const isToday = isSameDay(column.date, new Date());

          return (
            <div
              key={column.date.toString()}
              className={cn("relative min-w-[120px]", isToday && "bg-brand/15")}
            >
              {/* Header for the Day */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/10 h-16 flex flex-col items-center justify-center">
                <div
                  className={cn(
                    "text-xs",
                    isToday
                      ? "text-brand font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {format(column.date, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-xl font-bold inline-flex items-center justify-center transition-all",
                    isToday &&
                      "w-8 h-8 rounded-lg bg-brand text-white shadow-sm"
                  )}
                >
                  {format(column.date, "d")}
                </div>
              </div>

              {/* The Grid Lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-t border-border/[0.06]"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                />
              ))}

              {/* Render Events for this Day */}
              {column.events.map((event) => {
                const topPx = (event.top / 100) * (24 * HOUR_HEIGHT);
                const heightPx = (event.height / 100) * (24 * HOUR_HEIGHT);

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute rounded-sm px-2 py-1 text-xs cursor-pointer overflow-hidden flex flex-col gap-0.5",
                      "z-10 hover:z-20 hover:brightness-95 active:scale-[0.98] transition-all",
                      "bg-(--event-color)/25 text-foreground border-l-2 border-(--event-color)"
                    )}
                    style={
                      {
                        "--event-color": event.color || "hsl(var(--primary))",
                        top: `${topPx + 64}px`, // +64px for h-16 header height
                        height: `${Math.max(heightPx, 24)}px`, // Minimum 24px height
                        left: "1px",
                        right: "1px",
                        width: "calc(100% - 2px)",
                      } as React.CSSProperties
                    }
                  >
                    {/* Title */}
                    <div className="font-bold truncate text-[11px] leading-tight">
                      {event.title}
                    </div>

                    {/* Time - Only show if enough height */}
                    {heightPx > 40 && (
                      <div className="text-muted-foreground/70 text-[10px] leading-tight font-medium">
                        {format(event.start, "h:mm a")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TimeGrid);
