"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { priorityCheckboxClasses, formatDueDate } from "./task-utils";
import { KanbanBoardCard, KanbanBoardCardButton } from "@/components/kanban";
import { TaskGhost } from "./TaskGhost";

interface IntegratedTaskCardProps {
  task: Task;
  project: { color: string; name: string } | undefined;
  isDesktop: boolean;
  handleComplete: (checked: boolean) => void;
  handlePlayFocus: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export function IntegratedTaskCard({
  task,
  project,
  isDesktop,
  handleComplete,
  handlePlayFocus,
  onClick,
}: IntegratedTaskCardProps) {
  return (
    <KanbanBoardCard
      data={task}
      asChild
      ghostElement={
        <TaskGhost
          task={task}
          project={project}
          isDesktop={isDesktop}
          viewMode="list"
        />
      }
      className="p-3 bg-background border border-border/80 hover:border-border transition-all cursor-pointer group/card"
      onClick={onClick}
    >
      <div className="flex flex-col gap-2 w-full text-left">
        {/* Header: Checkbox, Content */}
        <div className="flex items-start gap-2">
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <KanbanBoardCardButton asChild>
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={handleComplete}
                className={cn(
                  priorityCheckboxClasses[task.priority as 1 | 2 | 3 | 4],
                  "h-4 w-4 !rounded-sm",
                )}
              />
            </KanbanBoardCardButton>
          </div>

          <p
            className={cn(
              "text-sm font-medium leading-tight flex-1",
              task.is_completed && "line-through text-muted-foreground",
            )}
          >
            {task.content}
          </p>

          {!task.is_completed && (
            <div className="flex items-center h-7 gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity ml-auto">
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
        <div className="mt-1">
          <div className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
            {task.due_date ? (
              <span>{formatDueDate(task.due_date)}</span>
            ) : project ? (
              <span className="truncate">{project.name}</span>
            ) : null}
          </div>
        </div>
      </div>
    </KanbanBoardCard>
  );
}
