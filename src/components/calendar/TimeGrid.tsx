'use client';

import { format, isSameDay } from 'date-fns';
import { useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { getDayRange, layoutDayRange } from '@/lib/calendar/engine';
import type { CalendarEvent } from '@/lib/calendar/types';

const HOUR_HEIGHT = 120; // 60 minutes * 2 pixels

interface TimeGridProps {
  startDate: Date;
  daysToShow: number; // 1 for Day, 3 for Mobile, 4 for Desktop, 7 for Week
  events: CalendarEvent[];
  className?: string;
}

export function TimeGrid({ startDate, daysToShow, events, className }: TimeGridProps) {
  const dates = getDayRange(startDate, daysToShow);
  
  // Memoize expensive layout calculations
  const columns = useMemo(() => layoutDayRange(events, dates), [events, dates]);
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  return (
    <div className={cn('flex h-full overflow-auto bg-background', className)}>
      {/* Time Labels Column */}
      <div className="w-16 flex-shrink-0 border-r border-border/40">
        <div className="h-24 border-b border-border/40" /> {/* Spacer for header */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-xs text-muted-foreground text-right pr-2 pt-2 border-t border-border/40"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            {format(new Date().setHours(hour, 0), 'h a')}
          </div>
        ))}
      </div>

      {/* Days Columns */}
      <div
        className="flex-1 grid divide-x divide-border/40"
        style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}
      >
        {columns.map((column) => {
          const isToday = isSameDay(column.date, new Date());
          
          return (
          <div key={column.date.toString()} className={cn(
            "relative min-w-[100px]",
            isToday && "bg-primary/5"
          )}>
            {/* Header for the Day */}
            <div className="sticky top-0 z-10 bg-background border-b border-border/40 h-24 flex flex-col items-center justify-center">
              <div className={cn(
                "text-xs",
                isToday ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {format(column.date, 'EEE')}
              </div>
              <div className={cn(
                "text-lg font-semibold inline-flex items-center justify-center",
                isToday && "w-10 h-10 rounded-md bg-primary text-primary-foreground"
              )}>
                {format(column.date, 'd')}
              </div>
            </div>

            {/* The Grid Lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-t border-border/40"
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
                    'absolute rounded-md border px-2 py-0.5 text-xs cursor-pointer overflow-hidden flex items-center gap-1.5',
                    'hover:z-20 hover:shadow-lg transition-all',
                    'bg-(--event-color)/15 border-(--event-color)/30 text-foreground'
                  )}
                  style={{
                    '--event-color': event.color || 'hsl(var(--primary))',
                    top: `${topPx + 96}px`, // +96px for h-24 header height
                    height: `${Math.max(heightPx, 20)}px`, // Minimum 20px height
                    left: '2px',
                    right: '2px',
                    width: 'calc(100% - 4px)',
                  } as React.CSSProperties}
                >
                  {/* Time - Only show if enough width/height, but for pill style we try to show inline */}
                  <div className="text-muted-foreground text-[10px] leading-tight font-medium shrink-0">
                    {format(event.start, 'h:mm a')}
                  </div>
                  
                  {/* Title */}
                  <div className="font-semibold truncate text-[11px] leading-tight flex-1">{event.title}</div>
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
