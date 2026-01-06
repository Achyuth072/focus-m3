import { create } from "zustand";
import {
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
  setEvents: (events: CalendarEvent[]) => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  view: "week",
  events: [],

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

  setEvents: (events) => set({ events }),
}));
