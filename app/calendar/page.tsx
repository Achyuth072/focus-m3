'use client';

import { useEffect, useState } from 'react';
import { startOfWeek } from 'date-fns';
import { useCalendarStore } from '@/lib/calendar/store';
import { CalendarToolbar } from '@/components/calendar/CalendarToolbar';
import { TimeGrid } from '@/components/calendar/TimeGrid';
import { YearView } from '@/components/calendar/YearView';
import { MonthView } from '@/components/calendar/MonthView';
import { ScheduleView } from '@/components/calendar/ScheduleView';

import { useCalendarEvents } from '@/lib/hooks/useCalendarEvents';

export default function CalendarPage() {
  const { currentDate, view, events, setView, setDate } = useCalendarStore();
  const [isMobile, setIsMobile] = useState(false);
  
  // Fetch real events from Supabase
  useCalendarEvents();

  // Detect mobile/desktop for view switching
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Adjust view if mobile/desktop changes
  useEffect(() => {
    if (isMobile && view === '4day') {
      setView('3day');
    } else if (!isMobile && view === '3day') {
      setView('4day');
    }
  }, [isMobile, view, setView]);

  const renderView = () => {
    switch (view) {
      case 'year':
        return (
          <YearView
            currentYear={currentDate.getFullYear()}
            onDateClick={(date) => {
              setDate(date);
              setView('day');
            }}
          />
        );

      case 'day':
        return (
          <TimeGrid
            startDate={currentDate}
            daysToShow={1}
            events={events}
          />
        );

      case '3day':
        return (
          <TimeGrid
            startDate={currentDate}
            daysToShow={3}
            events={events}
          />
        );

      case '4day':
        return (
          <TimeGrid
            startDate={currentDate}
            daysToShow={4}
            events={events}
          />
        );

      case 'week':
        return (
          <TimeGrid
            startDate={startOfWeek(currentDate)}
            daysToShow={7}
            events={events}
          />
        );

      case 'schedule':
        return (
          <ScheduleView
            events={events}
            startDate={new Date()}
            daysToShow={30}
          />
        );

      case 'month':
      default:
        return (
          <MonthView
            currentDate={currentDate}
            events={events}
            onDateClick={(date) => {
              setDate(date);
              setView('day');
            }}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full md:h-dvh">
      <CalendarToolbar isMobile={isMobile} />
      <div className="flex-1 min-h-0">
        {renderView()}
      </div>
    </div>
  );
}
