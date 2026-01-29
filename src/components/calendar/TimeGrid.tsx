"use client";

import { format, isSameDay } from "date-fns";
import { useMemo, memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getDayRange, layoutDayRange } from "@/lib/calendar/engine";
import type { CalendarEvent } from "@/lib/calendar/types";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

const HOUR_HEIGHT = 120; // 60 minutes * 2 pixels

interface TimeGridProps {
  isMobile?: boolean;
  startDate: Date;
  daysToShow: number; // 1 for Day, 3 for Mobile, 4 for Desktop, 7 for Week
  events: CalendarEvent[];
  className?: string;
  "data-testid"?: string;
}

export function TimeGrid({
  isMobile = false,
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

  // Responsive column sizing logic
  const gridTemplateColumns = useMemo(() => {
    // On mobile, if showing more than 3 days (Week view),
    // force each column to 33.33% to show 3 days at a time with scroll
    if (isMobile && daysToShow > 3) {
      return `repeat(${daysToShow}, 33.3333%)`;
    }
    return `repeat(${daysToShow}, 1fr)`;
  }, [isMobile, daysToShow]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Vertical scroll position
      const scrollPos =
        currentHour * HOUR_HEIGHT + (currentMinute / 60) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollPos - 120);

      // Horizontal scroll (Mobile Week View)
      if (isMobile && daysToShow > 3) {
        const todayIndex = dates.findIndex((d) => isSameDay(d, now));
        if (todayIndex > 0) {
          const containerWidth = scrollRef.current.clientWidth;
          // Each column is 33.3333% of the container width
          const columnWidth = containerWidth / 3;
          scrollRef.current.scrollLeft = todayIndex * columnWidth;
        }
      }
    }
  }, [dates, isMobile, daysToShow]);

  return (
    <div
      ref={scrollRef}
      data-testid={testId || "time-grid"}
      className={cn(
        "flex h-full overflow-auto bg-background custom-scrollbar",
        "scroll-pl-12 md:scroll-pl-16",
        isMobile && "snap-x snap-mandatory",
        className,
      )}
    >
      {/* Time Labels Column */}
      <div className="w-12 md:w-16 flex-shrink-0 sticky left-0 z-50 bg-background border-r border-border/5">
        <div className="h-16 bg-background" />{" "}
        {/* Spacer for header - ensured background */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-[9px] md:text-xs text-muted-foreground/50 text-right pr-2 md:pr-3 pt-2 font-medium bg-background"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {format(new Date().setHours(hour, 0), "h a")}
          </div>
        ))}
      </div>

      {/* Days Columns */}
      <div
        className="flex-1 grid divide-x divide-border/[0.08]"
        style={{ gridTemplateColumns }}
      >
        {columns.map((column) => {
          const isToday = isSameDay(column.date, new Date());

          return (
            <div
              key={column.date.toString()}
              className={cn(
                "relative min-w-0 md:min-w-[120px]",
                isMobile && "snap-start",
              )}
            >
              {/* Header for the Day - z-40 to be above events (10) and indicator (30) */}
              <div className="sticky top-0 z-40 bg-background border-b border-border/10 h-16 flex flex-col items-center justify-center">
                <div
                  className={cn(
                    "text-[10px] md:text-xs",
                    isToday
                      ? "text-brand font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {format(column.date, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-lg md:text-xl font-bold inline-flex items-center justify-center transition-all",
                    isToday &&
                      "w-7 h-7 md:w-8 md:h-8 rounded-lg bg-brand text-white shadow-sm",
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

              {/* Current Time Indicator */}
              {isToday && <CurrentTimeIndicator />}

              {/* Render Events for this Day */}
              {column.events.map((event) => {
                const topPx = (event.top / 100) * (24 * HOUR_HEIGHT);
                const heightPx = (event.height / 100) * (24 * HOUR_HEIGHT);

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "absolute rounded-sm px-1 md:px-2 py-1 text-[10px] md:text-xs cursor-pointer overflow-hidden flex flex-col gap-0.5",
                      "z-10 hover:z-20 hover:brightness-95 active:scale-[0.98] transition-all",
                      "bg-(--event-color)/25 text-foreground border-l-2 border-(--event-color)",
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
                    <div className="font-bold truncate text-[10px] md:text-[11px] leading-tight">
                      {event.title}
                    </div>

                    {/* Time - Only show if enough height */}
                    {heightPx > 40 && (
                      <div className="text-muted-foreground/70 text-[9px] md:text-[10px] leading-tight font-medium">
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
