/**
 * Calendar Engine - Core Layout Logic
 * Pure functions for event positioning and overlap detection
 * Based on docs/CALENDAR.md architecture
 */

import { startOfDay, endOfDay, max, min, addDays, isSameDay } from "date-fns";
import type { CalendarEvent, PositionedEvent, DayColumn } from "./types";

/**
 * Convert minutes since start of day to percentage (0-100)
 */
function minutesSinceStartOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Convert time to vertical position percentage
 * 24 hours = 100%
 */
function timeToPercent(date: Date): number {
  return (minutesSinceStartOfDay(date) / 1440) * 100;
}

/**
 * Clamp event to a specific day's boundaries
 */
function clampToDay(event: CalendarEvent, day: Date): CalendarEvent {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return {
    ...event,
    start: max([event.start, dayStart]),
    end: min([event.end, dayEnd]),
  };
}

/**
 * Check if two events overlap in time
 */
function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Group overlapping events together
 * This is critical for calculating column widths
 */
function groupOverlappingEvents(events: CalendarEvent[]): CalendarEvent[][] {
  const groups: CalendarEvent[][] = [];

  events.forEach((event) => {
    let placed = false;
    for (const group of groups) {
      if (group.some((e) => eventsOverlap(e, event))) {
        group.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([event]);
  });

  return groups;
}

/**
 * Position events for a single day
 * Returns events with calculated top, height, left, width, column, columnSpan
 */
export function layoutDayEvents(
  events: CalendarEvent[],
  day: Date
): PositionedEvent[] {
  // Filter events for this day and clamp to day boundaries
  const dayEvents = events
    .filter((e) => isSameDay(e.start, day) || isSameDay(e.end, day))
    .map((e) => clampToDay(e, day))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const groups = groupOverlappingEvents(dayEvents);

  return groups.flatMap((group) => {
    const columnCount = group.length;

    return group.map((event, index) => {
      const top = timeToPercent(event.start);
      const bottom = timeToPercent(event.end);
      const height = bottom - top;

      // Calculate horizontal position based on overlap
      const width = 100 / columnCount;
      const left = (index * 100) / columnCount;

      return {
        ...event,
        top,
        height,
        left,
        width,
        column: index,
        columnSpan: columnCount,
      };
    });
  });
}

/**
 * Generate a range of dates
 */
export function getDayRange(start: Date, days: number): Date[] {
  return Array.from({ length: days }).map((_, i) => addDays(start, i));
}

/**
 * Layout events for a range of days (Week, 3-Day, 4-Day views)
 */
export function layoutDayRange(
  events: CalendarEvent[],
  days: Date[]
): DayColumn[] {
  return days.map((day) => ({
    date: day,
    events: layoutDayEvents(events, day),
  }));
}
