'use client';

import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/calendar/types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function MonthView({ currentDate, events, onDateClick, className }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate number of weeks (rows) needed
  const numWeeks = Math.ceil(days.length / 7);

  // Group events by day
  const eventsByDay = new Map<string, CalendarEvent[]>();
  events.forEach((event) => {
    const dayKey = format(event.start, 'yyyy-MM-dd');
    if (!eventsByDay.has(dayKey)) {
      eventsByDay.set(dayKey, []);
    }
    eventsByDay.get(dayKey)!.push(event);
  });

  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
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
          'flex-1 grid grid-cols-7 border-l border-t border-border/50',
          numWeeks === 5 ? 'grid-rows-5' : 'grid-rows-6'
        )}
      >
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const remainingCount = dayEvents.length - maxVisible;

          return (
            <div
              key={dayKey}
              onClick={() => onDateClick?.(day)}
              className={cn(
                'min-h-[100px] p-2 border-r border-b border-border/50',
                'hover:bg-accent/50 cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-muted/20'
              )}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrentDay && 'flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground',
                    !isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs px-2 py-0.5 rounded truncate bg-[var(--event-color)]/10 text-foreground border-l-2 border-l-[var(--event-color)]"
                    style={{ '--event-color': event.color || 'hsl(var(--primary))' } as React.CSSProperties}
                    title={event.title}
                  >
                    {format(event.start, 'h:mm a')} {event.title}
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{remainingCount} more
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
