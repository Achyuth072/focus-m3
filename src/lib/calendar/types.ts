/**
 * Calendar Engine Types
 * Pure domain types for calendar events and layout
 */

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
};

export type PositionedEvent = CalendarEvent & {
  top: number; // % from top (0-100)
  height: number; // % height (0-100)
  left: number; // % from left (0-100)
  width: number; // % width (0-100)
  column: number; // overlap column index
  columnSpan: number; // total columns in overlap group
};

export type DayColumn = {
  date: Date;
  events: PositionedEvent[];
};

export type CalendarView =
  | "year"
  | "month"
  | "week"
  | "day"
  | "4day"
  | "3day"
  | "schedule";
