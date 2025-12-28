export type SortOption = "date" | "priority" | "alphabetical";
export type GroupOption = "none" | "priority" | "date";

export const SORT_LABELS: Record<SortOption, string> = {
  date: "Due Date",
  priority: "Priority",
  alphabetical: "Alphabetical",
};

export const GROUP_LABELS: Record<GroupOption, string> = {
  none: "None",
  priority: "Priority",
  date: "Due Date",
};
