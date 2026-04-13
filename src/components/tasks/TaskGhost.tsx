import React from "react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { formatDueDate } from "./task-utils";
import { DragHandle } from "./DragHandle";
import { Checkbox } from "@/components/ui/checkbox";
import { priorityCheckboxClasses } from "./task-utils";
import { Calendar, Flag } from "lucide-react";

interface TaskGhostProps {
  task: Task;
  isDesktop: boolean;
  project?: { color: string; name: string };
  viewMode?: "list" | "kanban";
}

/**
 * TaskGhost is a simplified, read-only representation of a task row
 * used exclusively for the DnD DragOverlay. It is optimized for
 * high-frequency rendering and visual clarity during drag operations.
 */
export const TaskGhost = React.memo(
  function TaskGhost({
    task,
    isDesktop,
    project,
    viewMode = "list",
  }: TaskGhostProps) {
    return (
      <div
        className={cn(
          "flex items-center w-full gap-2 md:gap-3 touch-none opacity-90",
          viewMode === "list"
            ? "px-4 py-3.5 bg-background/95 rounded-md border-b border-border/40"
            : "p-3 bg-card backdrop-blur-sm border border-border/80 rounded-xl cursor-grabbing",
        )}
      >
        {isDesktop && (
          <DragHandle
            variant="desktop"
            className="text-foreground/40 shrink-0"
          />
        )}

        <Checkbox
          checked={task.is_completed}
          className={cn(
            "shrink-0",
            priorityCheckboxClasses[task.priority as 1 | 2 | 3 | 4],
            isDesktop ? "h-4 w-4 !rounded-sm" : "h-5 w-5 !rounded-md",
          )}
          disabled
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm md:text-base font-medium leading-tight truncate text-foreground">
              {task.content}
            </p>
          </div>

          {(task.due_date || task.priority < 4 || project) && (
            <div className="flex items-center gap-2 mt-1 opacity-70 ml-[2px]">
              {task.due_date && (
                <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {formatDueDate(task.due_date)}
                </span>
              )}
              {task.priority < 4 && (
                <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                  <Flag className="h-2.5 w-2.5" strokeWidth={2.5} />P
                  {task.priority}
                </span>
              )}
              {project && (
                <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate max-w-[80px]">{project.name}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.task.id === next.task.id &&
      prev.task.content === next.task.content &&
      prev.task.is_completed === next.task.is_completed &&
      prev.task.priority === next.task.priority &&
      prev.viewMode === next.viewMode &&
      prev.isDesktop === next.isDesktop &&
      prev.project?.color === next.project?.color &&
      prev.project?.name === next.project?.name
    );
  },
);
