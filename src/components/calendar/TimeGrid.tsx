'use client';

import { format, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDayRange, layoutDayRange } from '@/lib/calendar/engine';
import type { CalendarEvent } from '@/lib/calendar/types';

const PIXELS_PER_MINUTE = 2;
const HOUR_HEIGHT = 120; // 60 minutes * 2 pixels

interface TimeGridProps {
  startDate: Date;
  daysToShow: number; // 1 for Day, 3 for Mobile, 4 for Desktop, 7 for Week
  events: CalendarEvent[];
  className?: string;
}

export function TimeGrid({ startDate, daysToShow, events, className }: TimeGridProps) {
  const dates = getDayRange(startDate, daysToShow);
  const columns = layoutDayRange(events, dates);
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  return (
    <div className={cn('flex h-full overflow-auto bg-background', className)}>
      {/* Time Labels Column */}
      <div className="w-16 flex-shrink-0 border-r border-border">
        <div className="h-14" /> {/* Spacer for header */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-xs text-muted-foreground text-right pr-2 pt-2 border-b border-muted-foreground/40"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {format(new Date().setHours(hour, 0), 'h a')}
          </div>
        ))}
      </div>

      {/* Days Columns */}
      <div
        className="flex-1 grid divide-x divide-muted-foreground/40"
        style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}
      >
        {columns.map((column) => {
          const isToday = isSameDay(column.date, new Date());
          
          return (
          <div key={column.date.toString()} className={cn(
            "relative min-w-[100px]",
            isToday && "bg-accent/20"
          )}>
            {/* Header for the Day */}
            <div className="sticky top-0 z-10 bg-background border-b border-muted-foreground/40 p-3 text-center">
              <div className={cn(
                "text-xs",
                isToday ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {format(column.date, 'EEE')}
              </div>
              <div className={cn(
                "text-lg font-semibold inline-flex items-center justify-center",
                isToday && "w-10 h-10 rounded-full bg-primary text-primary-foreground"
              )}>
                {format(column.date, 'd')}
              </div>
            </div>

            {/* The Grid Lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-muted-foreground/40"
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
                    'absolute rounded-md border-l-4 p-2 text-xs cursor-pointer',
                    'hover:z-20 hover:shadow-lg transition-shadow',
                    'bg-[var(--event-color)]/10 border-l-[var(--event-color)] text-foreground'
                  )}
                  style={{
                    '--event-color': event.color || 'hsl(var(--primary))',
                    top: `${topPx + 56}px`, // +56 for header height
                    height: `${Math.max(heightPx, 30)}px`, // Minimum 30px height
                    left: `${event.left}%`,
                    width: `${event.width - 2}%`, // -2% for spacing
                  } as React.CSSProperties}
                >
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-muted-foreground">
                    {format(event.start, 'h:mm a')}
                  </div>
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
