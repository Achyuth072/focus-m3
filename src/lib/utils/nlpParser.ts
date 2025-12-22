import * as chrono from "chrono-node";
import type { ParsedTask } from "@/lib/types/task";

const PRIORITY_PATTERNS = [
  { pattern: /\s*!{3}\s*/g, priority: 1 as const },
  { pattern: /\s*!{2}\s*/g, priority: 2 as const },
  { pattern: /\s*!high\s*/gi, priority: 1 as const },
  { pattern: /\s*!medium\s*/gi, priority: 2 as const },
  { pattern: /\s*!low\s*/gi, priority: 3 as const },
  { pattern: /\s*!1\s*/g, priority: 1 as const },
  { pattern: /\s*!2\s*/g, priority: 2 as const },
  { pattern: /\s*!3\s*/g, priority: 3 as const },
];

const PROJECT_PATTERN = /#(\w+)/g;
const LABEL_PATTERN = /@(\w+)/g;

export function parseTaskInput(input: string): ParsedTask {
  let content = input.trim();
  let priority: 1 | 2 | 3 | 4 = 4;
  let project: string | null = null;
  const labels: string[] = [];

  // Extract priority
  for (const { pattern, priority: p } of PRIORITY_PATTERNS) {
    if (pattern.test(content)) {
      priority = p;
      content = content.replace(pattern, " ");
      break;
    }
  }

  // Extract project (first match only)
  const projectMatch = content.match(PROJECT_PATTERN);
  if (projectMatch && projectMatch.length > 0) {
    project = projectMatch[0].slice(1);
    content = content.replace(projectMatch[0], "");
  }

  // Extract labels
  let labelMatch;
  const labelRegex = new RegExp(LABEL_PATTERN);
  while ((labelMatch = labelRegex.exec(content)) !== null) {
    labels.push(labelMatch[1]);
  }
  content = content.replace(LABEL_PATTERN, "");

  // Parse date using chrono-node
  const parsed = chrono.parse(content);
  let due_date: Date | null = null;

  if (parsed.length > 0) {
    due_date = parsed[0].start.date();
    // Remove the parsed date text from content
    content = content.replace(parsed[0].text, "");
  }

  // Clean up extra whitespace
  content = content.replace(/\s+/g, " ").trim();

  return {
    content,
    due_date,
    priority,
    project,
    labels,
  };
}

export function formatDueDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}
