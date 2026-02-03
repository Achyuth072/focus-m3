import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Flag,
  Trash2,
  ChevronRight,
  ChevronDown,
  Play,
  Moon,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { format, isToday, parseISO } from "date-fns";
import { priorityColors, formatDueDate } from "./task-utils";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { DragHandle } from "./DragHandle";
import { KanbanBoardCardButton } from "@/components/kanban";

interface TaskListRowProps {
  task: Task;
  isDesktop: boolean;
  isExpanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
  handleComplete: (checked: boolean) => void;
  handlePlayFocus: (e: React.MouseEvent) => void;
  onDeleteRequest: (e: React.MouseEvent) => void;
  project: { color: string; name: string } | undefined;
  isOverdue: boolean;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  onHandlePointerDown?: () => void;
  onHandlePointerUp?: () => void;
  dragActivatorRef?: (element: HTMLElement | null) => void;
}

export function TaskListRow({
  task,
  isDesktop,
  isExpanded,
  toggleExpand,
  handleComplete,
  handlePlayFocus,
  onDeleteRequest,
  project,
  isOverdue,
  dragListeners,
  dragAttributes,
  onHandlePointerDown,
  onHandlePointerUp,
  dragActivatorRef,
}: TaskListRowProps) {
  return (
    <div
      className="flex items-center w-full gap-2 md:gap-2"
      data-testid="task-list-row"
    >
      <DragHandle
        ref={dragActivatorRef}
        dragListeners={dragListeners}
        dragAttributes={dragAttributes}
        variant={isDesktop ? "desktop" : "mobile"}
        onPointerDown={onHandlePointerDown}
        onPointerUp={onHandlePointerUp}
      />

      {/* Checkbox */}
      <div
        className={cn("shrink-0", isDesktop ? "pt-0" : "pt-0.5 p-3 -ml-3")} // Mobile: Negative margin to offset padding, ensuring alignment + 44px hit area
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={handleComplete}
          className={cn(
            priorityColors[task.priority],
            isDesktop ? "h-4 w-4 !rounded-sm" : "h-5 w-5 !rounded-md", // Mobile=8px(40%), Desktop=6px(37%)
          )}
        />
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 min-w-0",
          isDesktop ? "flex flex-col gap-1" : "flex flex-col gap-0.5",
        )}
      >
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "type-body font-medium leading-tight truncate",
              task.is_completed && "line-through text-muted-foreground",
            )}
          >
            {task.content}
          </p>

          {/* Mobile Expand Toggle - Now next to content */}
          {!isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isExpanded && "rotate-90 text-brand",
                )}
                strokeWidth={3}
              />
            </Button>
          )}
        </div>

        {/* Metadata row */}
        {(task.due_date || task.priority < 4 || project) && (
          <div
            className={cn(
              "flex items-center gap-2 flex-wrap",
              isDesktop ? "type-micro" : "mt-1 ml-0",
            )}
          >
            {task.due_date && (
              <span
                className={cn(
                  "type-ui flex items-center gap-1",
                  isOverdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {!isDesktop && <Calendar className="h-3 w-3" />}
                {formatDueDate(task.due_date)}
              </span>
            )}
            {task.do_date && (
              <span className="type-ui flex items-center gap-1 text-brand font-medium">
                <CalendarClock className="h-3 w-3" />
                {isToday(parseISO(task.do_date))
                  ? "Today"
                  : format(parseISO(task.do_date), "MMM d")}
              </span>
            )}
            {task.is_evening && (
              <span className="type-ui flex items-center gap-1 text-brand font-medium">
                <Moon className="h-3 w-3 fill-current" />
                Evening
              </span>
            )}
            {task.priority < 4 && (
              <span
                className={cn(
                  "type-ui flex items-center gap-1",
                  priorityColors[task.priority],
                )}
              >
                {!isDesktop && <Flag className="h-3 w-3" />}P{task.priority}
              </span>
            )}
            {project && (
              <span className="type-ui flex items-center gap-1.5 text-muted-foreground">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate max-w-[80px]">{project.name}</span>
              </span>
            )}

            {/* Expand Toggle - Moved to end */}
            {isDesktop ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className={cn(
                  "h-5 w-5 text-muted-foreground hover:text-foreground transition-colors ml-1",
                  !isExpanded && "opacity-0 group-hover:opacity-100",
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isExpanded && "rotate-90 text-brand",
                  )}
                  strokeWidth={3}
                />
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Desktop Actions - Positioned at right edge */}
      {isDesktop && (
        <div className="flex items-center gap-1 shrink-0">
          <KanbanBoardCardButton
            onClick={handlePlayFocus}
            className="h-6 w-6 text-muted-foreground hover:text-brand opacity-0 group-hover:opacity-100 transition-seijaku"
            tooltip="Start focus timer"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2.25} />
          </KanbanBoardCardButton>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteRequest}
            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Mobile Play Action */}
      {!isDesktop && (
        <KanbanBoardCardButton
          onClick={handlePlayFocus}
          className="h-8 w-8 text-muted-foreground hover:text-brand transition-seijaku"
          tooltip="Start focus timer"
        >
          <Play className="h-4 w-4" strokeWidth={2.25} />
        </KanbanBoardCardButton>
      )}
    </div>
  );
}
