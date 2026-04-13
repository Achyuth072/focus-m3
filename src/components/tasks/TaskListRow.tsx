import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Calendar,
  CalendarClock,
  Moon,
  Flag,
  Play,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { format, isToday, parseISO } from "date-fns";
import {
  priorityTextClasses,
  priorityCheckboxClasses,
  formatDueDate,
  isOverdue,
} from "./task-utils";
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
  dragListeners,
  dragAttributes,
  onHandlePointerDown,
  onHandlePointerUp,
  dragActivatorRef,
}: TaskListRowProps) {
  return (
    <div
      className="flex items-center w-full gap-2 md:gap-3 group"
      data-testid="task-list-row"
      {...(!isDesktop ? dragAttributes : {})}
      {...(!isDesktop ? dragListeners : {})}
    >
      {/* Drag Handle: Desktop only for Ruthless Kanso clarity */}
      {isDesktop && (
        <DragHandle
          ref={dragActivatorRef}
          dragListeners={dragListeners}
          dragAttributes={dragAttributes}
          variant="desktop"
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
        />
      )}

      {/* Checkbox */}
      <div
        className={cn("shrink-0", isDesktop ? "pt-0" : "pt-0.5 p-3 -ml-3")}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={handleComplete}
          className={cn(
            priorityCheckboxClasses[task.priority as 1 | 2 | 3 | 4],
            isDesktop ? "h-4 w-4 !rounded-sm" : "h-5 w-5 !rounded-md",
          )}
        />
      </div>

      {/* Content Area */}
      <div
        className={cn(
          "flex-1 min-w-0",
          isDesktop
            ? "flex flex-row items-center gap-4"
            : "flex flex-col gap-0.5",
        )}
      >
        {/* Title row (Desktop: part of row; Mobile: top of stack) */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <p
            className={cn(
              "type-body font-medium leading-tight truncate",
              task.is_completed && "line-through text-muted-foreground",
            )}
          >
            {task.content}
          </p>

          {/* Mobile Actions in Title Row */}
          {!isDesktop && (
            <div className="ml-auto flex items-center shrink-0">
              {/* Mobile Expand Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className="h-11 w-11 text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center justify-center -mr-1"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isExpanded && "rotate-90 text-brand",
                  )}
                  strokeWidth={2.5}
                />
              </Button>

              {/* Mobile Play Button - 44px hit target */}
              <KanbanBoardCardButton
                onClick={handlePlayFocus}
                className="h-11 w-11 text-muted-foreground/40 hover:text-brand-foreground hover:bg-brand hover:shadow-brand/10 border-none transition-seijaku flex items-center justify-center p-0 -mr-2"
                tooltip="Start focus timer"
              >
                <Play className="h-4 w-4 fill-current" strokeWidth={2.25} />
              </KanbanBoardCardButton>
            </div>
          )}
        </div>

        {/* Metadata Row (Desktop: Ledger; Mobile: Stacked under title) */}
        {(task.due_date || task.priority < 4 || project || isDesktop) && (
          <div
            className={cn(
              "flex items-center gap-3 flex-wrap",
              isDesktop
                ? "ml-auto mr-4 type-micro text-muted-foreground/60"
                : "mt-0.5 ml-[2px] mb-1 text-muted-foreground/80",
            )}
          >
            {task.due_date && (
              <span
                className={cn(
                  "type-ui flex items-center gap-1",
                  isOverdue(task.due_date)
                    ? "text-foreground font-bold"
                    : "text-inherit",
                )}
              >
                <Calendar
                  className={cn(
                    "h-3 w-3",
                    isOverdue(task.due_date) && "text-foreground",
                  )}
                  strokeWidth={2.5}
                />
                {formatDueDate(task.due_date)}
              </span>
            )}
            {task.do_date && (
              <span className="type-ui flex items-center gap-1 font-semibold text-foreground/80">
                <CalendarClock className="h-3 w-3" strokeWidth={2.5} />
                {isToday(parseISO(task.do_date))
                  ? "Today"
                  : format(parseISO(task.do_date), "MMM d")}
              </span>
            )}
            {task.is_evening && (
              <span className="type-ui flex items-center gap-1 font-semibold text-foreground/80">
                <Moon className="h-3 w-3 fill-current" strokeWidth={2.5} />
                Evening
              </span>
            )}
            {task.priority < 4 && (
              <span
                className={cn(
                  "type-ui flex items-center gap-1",
                  priorityTextClasses[task.priority as 1 | 2 | 3 | 4],
                )}
              >
                <Flag className="h-3 w-3" strokeWidth={2.5} />P{task.priority}
              </span>
            )}
            {project && (
              <span className="type-ui flex items-center gap-1.5 font-medium text-foreground/60">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate max-w-[80px]">{project.name}</span>
              </span>
            )}

            {/* Expand Toggle Desktop */}
            {isDesktop ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className={cn(
                  "h-6 w-6 text-muted-foreground hover:text-foreground transition-colors ml-1",
                  isExpanded && "text-brand",
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-all duration-200",
                    isExpanded && "rotate-90",
                  )}
                  strokeWidth={2.5}
                />
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Desktop End-cap Actions */}
      {isDesktop && (
        <div className="flex items-center h-7 gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteRequest}
            className="h-7 w-7 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100 focus-within:opacity-100"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
          </Button>

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
  );
}
