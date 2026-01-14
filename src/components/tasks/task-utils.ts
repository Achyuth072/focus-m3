import { parseISO, isToday, isTomorrow, format } from "date-fns";

export const priorityColors: Record<1 | 2 | 3 | 4, string> = {
  1: "text-red-500 border-red-500",
  2: "text-orange-500 border-orange-500",
  3: "text-blue-500 border-blue-500",
  4: "text-muted-foreground border-muted-foreground/50",
};

export function formatDueDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}
