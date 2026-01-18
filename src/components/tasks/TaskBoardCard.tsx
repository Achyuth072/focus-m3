import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Moon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { priorityColors, formatDueDate } from "./task-utils";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { DragHandle } from "./DragHandle";

interface TaskBoardCardProps {
  task: Task;
  project: { color: string; name: string } | undefined;
  isOverdue: boolean;
  isDesktop: boolean;
  handleComplete: (checked: boolean) => void;
  handlePlayFocus: (e: React.MouseEvent) => void;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
}

export function TaskBoardCard({
  task,
  project,
  isOverdue,
  isDesktop,
  handleComplete,
  handlePlayFocus,
  dragListeners,
  dragAttributes,
}: TaskBoardCardProps) {
  return (
    <div className="flex flex-col gap-3 w-full" data-testid="task-board-card">
      {/* Header: Grip, Checkbox, Content */}
      <div className="flex items-start gap-2">
        <DragHandle
          dragListeners={dragListeners}
          dragAttributes={dragAttributes}
          variant="desktop"
        />

        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={handleComplete}
            className={cn(priorityColors[task.priority], "h-4 w-4 !rounded-sm")}
          />
        </div>

        <p
          className={cn(
            "type-body font-medium leading-tight text-sm flex-1",
            task.is_completed && "line-through text-muted-foreground",
          )}
        >
          {task.content}
        </p>

        {/* Play Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayFocus}
          className={cn(
            "shrink-0 text-muted-foreground hover:text-green-600 transition-colors",
            isDesktop
              ? "h-6 w-6 opacity-0 group-hover/item:opacity-100"
              : "h-8 w-8",
          )}
          title="Start focus timer"
        >
          <Play className={cn(isDesktop ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </Button>
      </div>

      {/* Footer: Project (Left) | Tags (Right) */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 pl-6">
          {project && (
            <div className="flex items-center gap-1.5 max-w-[120px]">
              <div
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate">
                {project.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60">
          {task.due_date && (
            <span className={cn(isOverdue && "text-destructive")}>
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.priority < 4 && (
            <span className={cn(priorityColors[task.priority])}>
              P{task.priority}
            </span>
          )}
          {task.is_evening && (
            <Moon className="h-3 w-3 fill-current text-purple-500/80" />
          )}
        </div>
      </div>
    </div>
  );
}
