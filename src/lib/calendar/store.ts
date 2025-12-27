import { create } from "zustand";
import {
  startOfWeek,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import type { CalendarEvent, CalendarView } from "./types";

interface CalendarStore {
  // State
  currentDate: Date;
  view: CalendarView;
  events: CalendarEvent[];

  // Actions
  setView: (view: CalendarView) => void;
  setDate: (date: Date) => void;
  goToToday: () => void;
  next: () => void;
  prev: () => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  view: "week",
  events: [
    {
      id: "1",
      title: "Team Meeting",
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(11, 0, 0, 0)),
      color: "hsl(var(--primary))",
    },
    {
      id: "2",
      title: "Lunch Break",
      start: new Date(new Date().setHours(12, 30, 0, 0)),
      end: new Date(new Date().setHours(13, 30, 0, 0)),
      color: "hsl(142, 76%, 36%)",
    },
    {
      id: "3",
      title: "Code Review",
      start: new Date(new Date().setHours(14, 0, 0, 0)),
      end: new Date(new Date().setHours(15, 30, 0, 0)),
      color: "hsl(221, 83%, 53%)",
    },
  ],

  // Actions
  setView: (view) => set({ view }),

  setDate: (date) => set({ currentDate: date }),

  goToToday: () => set({ currentDate: new Date() }),

  next: () => {
    const { currentDate, view } = get();
    let newDate: Date;

    switch (view) {
      case "day":
        newDate = addDays(currentDate, 1);
        break;
      case "3day":
        newDate = addDays(currentDate, 3);
        break;
      case "4day":
        newDate = addDays(currentDate, 4);
        break;
      case "week":
        newDate = addWeeks(currentDate, 1);
        break;
      case "month":
        newDate = addMonths(currentDate, 1);
        break;
      case "year":
        newDate = addYears(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }

    set({ currentDate: newDate });
  },

  prev: () => {
    const { currentDate, view } = get();
    let newDate: Date;

    switch (view) {
      case "day":
        newDate = subDays(currentDate, 1);
        break;
      case "3day":
        newDate = subDays(currentDate, 3);
        break;
      case "4day":
        newDate = subDays(currentDate, 4);
        break;
      case "week":
        newDate = subWeeks(currentDate, 1);
        break;
      case "month":
        newDate = subMonths(currentDate, 1);
        break;
      case "year":
        newDate = subYears(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }

    set({ currentDate: newDate });
  },

  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
}));
