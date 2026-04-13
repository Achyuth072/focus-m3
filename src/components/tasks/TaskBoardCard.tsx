import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { priorityCheckboxClasses, formatDueDate } from "./task-utils";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { DragHandle } from "./DragHandle";
import { KanbanBoardCardButton } from "@/components/kanban";

interface TaskBoardCardProps {
  task: Task;
  project: { color: string; name: string } | undefined;
  isDesktop: boolean;
  handleComplete: (checked: boolean) => void;
  handlePlayFocus: (e: React.MouseEvent) => void;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  dragActivatorRef?: (element: HTMLElement | null) => void;
}

export function TaskBoardCard({
  task,
  project,
  isDesktop: _isDesktop,
  handleComplete,
  handlePlayFocus,
  dragListeners,
  dragAttributes,
  dragActivatorRef,
}: TaskBoardCardProps) {
  return (
    <div className="flex flex-col gap-2 w-full" data-testid="task-board-card">
      {/* Header: Grip, Checkbox, Content */}
      <div className="flex items-start gap-2">
        <DragHandle
          ref={dragActivatorRef}
          dragListeners={dragListeners}
          dragAttributes={dragAttributes}
          variant="desktop"
        />

        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={handleComplete}
            className={cn(
              priorityCheckboxClasses[task.priority as 1 | 2 | 3 | 4],
              "h-4 w-4 !rounded-sm",
            )}
          />
        </div>

        <p
          className={cn(
            "type-body font-medium leading-tight flex-1",
            task.is_completed && "line-through text-muted-foreground",
          )}
        >
          {task.content}
        </p>

        {/* Hover Actions: Play button hidden by default */}
        {!task.is_completed && (
          <div className="flex items-center h-7 gap-1.5 opacity-0 group-hover:opacity-100 transition-seijaku-fast">
            {task.is_evening && (
              <Moon className="h-3.5 w-3.5 text-muted-foreground/60 fill-current" />
            )}
            <KanbanBoardCardButton
              onClick={handlePlayFocus}
              className="h-7 w-7 text-muted-foreground/40 hover:text-brand-foreground hover:bg-brand hover:shadow-brand/10 border-none transition-seijaku"
              tooltip="Start focus timer"
            >
              <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2.25} />
            </KanbanBoardCardButton>
          </div>
        )}
      </div>

      {/* Footer: Single Metadata Item (11px Micro) */}
      <div className="mt-1 pl-6">
        <div className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
          {task.due_date ? (
            <span>{formatDueDate(task.due_date)}</span>
          ) : project ? (
            <span className="truncate">{project.name}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
