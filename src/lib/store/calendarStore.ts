import { create } from "zustand";
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

interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  // Computed
  days: Date[];
  title: string;
  // Actions
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  next: () => void;
  prev: () => void;
  today: () => void;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
}

const computeDays = (currentDate: Date, view: CalendarView): Date[] => {
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
};

const computeTitle = (currentDate: Date): string => {
  return format(currentDate, "MMMM yyyy");
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  view: "week",
  days: computeDays(new Date(), "week"),
  title: computeTitle(new Date()),

  setCurrentDate: (date) =>
    set((state) => ({
      currentDate: date,
      days: computeDays(date, state.view),
      title: computeTitle(date),
    })),

  setView: (view) =>
    set((state) => ({
      view,
      days: computeDays(state.currentDate, view),
    })),

  next: () =>
    set((state) => {
      let newDate: Date = state.currentDate;
      switch (state.view) {
        case "month":
          newDate = addMonths(state.currentDate, 1);
          break;
        case "week":
          newDate = addWeeks(state.currentDate, 1);
          break;
        case "3day":
          newDate = addDays(state.currentDate, 3);
          break;
      }
      return {
        currentDate: newDate,
        days: computeDays(newDate, state.view),
        title: computeTitle(newDate),
      };
    }),

  prev: () =>
    set((state) => {
      let newDate: Date = state.currentDate;
      switch (state.view) {
        case "month":
          newDate = subMonths(state.currentDate, 1);
          break;
        case "week":
          newDate = subWeeks(state.currentDate, 1);
          break;
        case "3day":
          newDate = subDays(state.currentDate, 3);
          break;
      }
      return {
        currentDate: newDate,
        days: computeDays(newDate, state.view),
        title: computeTitle(newDate),
      };
    }),

  today: () => {
    const now = new Date();
    set((state: CalendarState) => ({
      currentDate: now,
      days: computeDays(now, state.view),
      title: computeTitle(now),
    }));
  },

  isToday: (date) => isSameDay(date, new Date()),
  isCurrentMonth: (date) => isSameMonth(date, get().currentDate),
}));
