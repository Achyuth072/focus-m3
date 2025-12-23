"use client";

import { useState, useMemo, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";

export type CalendarView = "month" | "week" | "3day";

export interface UseCalendarReturn {
  currentDate: Date;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  days: Date[];
  next: () => void;
  prev: () => void;
  today: () => void;
  title: string;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
}

export function useCalendar(
  initialView: CalendarView = "week"
): UseCalendarReturn {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  const days = useMemo(() => {
    switch (view) {
      case "month": {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
      }
      case "week": {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return eachDayOfInterval({ start, end });
      }
      case "3day": {
        const start = currentDate;
        const end = addDays(currentDate, 2);
        return eachDayOfInterval({ start, end });
      }
    }
  }, [currentDate, view]);

  const next = useCallback(() => {
    switch (view) {
      case "month":
        setCurrentDate((d) => addMonths(d, 1));
        break;
      case "week":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case "3day":
        setCurrentDate((d) => addDays(d, 3));
        break;
    }
  }, [view]);

  const prev = useCallback(() => {
    switch (view) {
      case "month":
        setCurrentDate((d) => subMonths(d, 1));
        break;
      case "week":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case "3day":
        setCurrentDate((d) => subDays(d, 3));
        break;
    }
  }, [view]);

  const today = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const title = useMemo(() => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
      case "3day":
        return format(currentDate, "MMMM yyyy");
    }
  }, [currentDate, view]);

  const isToday = useCallback((date: Date) => isSameDay(date, new Date()), []);
  const isCurrentMonth = useCallback(
    (date: Date) => isSameMonth(date, currentDate),
    [currentDate]
  );

  return {
    currentDate,
    view,
    setView,
    days,
    next,
    prev,
    today,
    title,
    isToday,
    isCurrentMonth,
  };
}
