'use client';

import { format, isSameDay, startOfDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/calendar/types';

interface ScheduleViewProps {
  events: CalendarEvent[];
  startDate: Date;
  daysToShow?: number; // How many days ahead to show
  className?: string;
}

export function ScheduleView({ events, startDate, daysToShow = 30, className }: ScheduleViewProps) {
  const startOfToday = startOfDay(startDate);
  
  // Generate array of dates for the next N days
  const dateRange = Array.from({ length: daysToShow }).map((_, i) => 
    addDays(startOfToday, i)
  );
  
  // Group events by day for quick lookup
  const eventsByDay = new Map<string, CalendarEvent[]>();
  
  events
    .filter((event) => startOfDay(event.start) >= startOfToday)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .forEach((event) => {
      const dayKey = format(startOfDay(event.start), 'yyyy-MM-dd');
      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, []);
      }
      eventsByDay.get(dayKey)!.push(event);
    });

  return (
    <div className={cn('h-full overflow-auto p-6', className)}>
      <div className="max-w-3xl mx-auto space-y-6">
        {dateRange.map((date) => {
          const dayKey = format(date, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];
          const isToday = isSameDay(date, new Date());

          return (
            <div key={dayKey} className="space-y-2">
              {/* Date Header */}
              <div className={cn(
                'sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60',
                'py-2 border-b'
              )}>
                <div className="flex items-baseline gap-3">
                  <div className={cn(
                    'text-3xl font-bold',
                    isToday && 'text-primary'
                  )}>
                    {format(date, 'd')}
                  </div>
                  <div className="flex flex-col">
                    <div className={cn(
                      'text-sm font-medium',
                      isToday && 'text-primary'
                    )}>
                      {format(date, 'EEEE')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(date, 'MMMM yyyy')}
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
                        'flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors',
                        'border-l-4 border-l-[var(--event-color)]'
                      )}
                      style={{ '--event-color': event.color || 'hsl(var(--primary))' } as React.CSSProperties}
                    >
                      {/* Time */}
                      <div className="shrink-0 w-20 text-sm text-muted-foreground">
                        {event.allDay ? (
                          'All day'
                        ) : (
                          <>
                            <div>{format(event.start, 'h:mm a')}</div>
                            {event.end && (
                              <div className="text-xs">
                                {format(event.end, 'h:mm a')}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{event.title}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No events
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
