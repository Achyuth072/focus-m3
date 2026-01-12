"use client";

import { format, startOfDay, addDays } from "date-fns";
import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";

interface ScheduleViewProps {
  events: CalendarEvent[];
  startDate: Date;
  daysToShow?: number; // How many days ahead to show
  className?: string;
}

const ScheduleView = memo(
  ({ events, startDate, daysToShow = 30, className }: ScheduleViewProps) => {
    const startOfToday = startOfDay(startDate);

    // Memoize date range generation
    const dateRange = useMemo(
      () =>
        Array.from({ length: daysToShow }).map((_, i) =>
          addDays(startOfToday, i)
        ),
      [startOfToday, daysToShow]
    );

    // Memoize event grouping by day
    const eventsByDay = useMemo(() => {
      const map = new Map<string, CalendarEvent[]>();

      events
        .filter((event) => startOfDay(event.start) >= startOfToday)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .forEach((event) => {
          const dayKey = format(startOfDay(event.start), "yyyy-MM-dd");
          if (!map.has(dayKey)) {
            map.set(dayKey, []);
          }
          map.get(dayKey)!.push(event);
        });
      return map;
    }, [events, startOfToday]);

    const todayStr = format(new Date(), "yyyy-MM-dd");

    return (
      <div className={cn("h-full overflow-auto p-6", className)}>
        <div className="max-w-3xl mx-auto space-y-6">
          {dateRange.map((date) => {
            const dayKey = format(date, "yyyy-MM-dd");
            const dayEvents = eventsByDay.get(dayKey) || [];
            const isToday = dayKey === todayStr;

            return (
              <div key={dayKey} className="space-y-2">
                {/* Date Header */}
                <div
                  className={cn(
                    "sticky top-0 z-10 bg-background",
                    "py-2 border-b border-border/40"
                  )}
                >
                  <div className="flex items-baseline gap-3">
                    <div
                      className={cn(
                        "text-3xl font-mono font-bold tracking-tighter px-2 items-center flex justify-center",
                        isToday &&
                          "text-primary-foreground bg-primary rounded-none shadow-sm"
                      )}
                    >
                      {format(date, "d")}
                    </div>
                    <div className="flex flex-col">
                      <div
                        className={cn(
                          "font-serif text-[13px] font-bold uppercase tracking-[0.2em]",
                          isToday ? "text-primary" : "text-muted-foreground/60"
                        )}
                      >
                        {format(date, "eeee")}
                      </div>
                      <div className="font-serif text-[11px] italic text-muted-foreground/40 lowercase">
                        {format(date, "MMMM yyyy")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events for this day */}
                <div className="space-y-2 pl-2">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors border mx-2 mb-2",
                          "bg-(--event-color)/15 border-(--event-color)/30 shadow-sm font-medium"
                        )}
                        style={
                          {
                            "--event-color":
                              event.color || "hsl(var(--primary))",
                          } as React.CSSProperties
                        }
                      >
                        {/* Time */}
                        <div className="shrink-0 w-20 font-mono text-[11px] text-muted-foreground/60 flex flex-col justify-center">
                          {event.allDay ? (
                            <span className="font-serif italic text-[10px] lowercase">
                              all day
                            </span>
                          ) : (
                            <>
                              <div>{format(event.start, "HH:mm")}</div>
                              {event.end && (
                                <div className="opacity-40">
                                  {format(event.end, "HH:mm")}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0 flex items-center">
                          <div className="font-serif font-bold text-[14px] truncate lowercase tracking-tight">
                            {event.title}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 font-serif italic text-muted-foreground/30 text-[11px] lowercase">
                      no events scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

ScheduleView.displayName = "ScheduleView";

export { ScheduleView };
