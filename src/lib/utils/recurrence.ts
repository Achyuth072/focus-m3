import { addDays, addWeeks, addMonths, addYears } from "date-fns";

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurrenceRule {
  freq: RecurrenceFrequency;
  interval: number;
  days?: number[]; // For WEEKLY: 0=Sun, 1=Mon, etc.
}

/**
 * Calculate the next due date for a recurring task based on completion date
 * @param completedDate - The date the task was completed
 * @param rule - The recurrence rule
 * @returns The next due date
 */
export function calculateNextDueDate(
  completedDate: Date,
  rule: RecurrenceRule
): Date {
  const { freq, interval } = rule;

  switch (freq) {
    case "DAILY":
      return addDays(completedDate, interval);

    case "WEEKLY":
      return addWeeks(completedDate, interval);

    case "MONTHLY":
      return addMonths(completedDate, interval);

    case "YEARLY":
      return addYears(completedDate, interval);

    default:
      throw new Error(`Unsupported recurrence frequency: ${freq}`);
  }
}

/**
 * Format a recurrence rule into a human-readable string
 * @param rule - The recurrence rule
 * @returns Human-readable string (e.g., "Every 2 weeks", "Daily")
 */
export function formatRecurrenceRule(rule: RecurrenceRule | null): string {
  if (!rule) return "Does not repeat";

  const { freq, interval } = rule;

  if (interval === 1) {
    switch (freq) {
      case "DAILY":
        return "Daily";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "YEARLY":
        return "Yearly";
    }
  }

  const unit = freq.toLowerCase().replace("ly", "");
  return `Every ${interval} ${unit}s`;
}
