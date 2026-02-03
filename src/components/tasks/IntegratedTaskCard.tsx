"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import { priorityColors, formatDueDate } from "./task-utils";
import { KanbanBoardCard, KanbanBoardCardButton } from "@/components/kanban";

interface IntegratedTaskCardProps {
  task: Task;
  project: { color: string; name: string } | undefined;
  isOverdue: boolean;
  isDesktop: boolean;
  handleComplete: (checked: boolean) => void;
  handlePlayFocus: (e: React.MouseEvent) => void;
}

export function IntegratedTaskCard({
  task,
  project,
  isOverdue,
  isDesktop,
  handleComplete,
  handlePlayFocus,
}: IntegratedTaskCardProps) {
  return (
    <KanbanBoardCard
      data={task}
      asChild
      className="p-3 bg-background border border-border/80 hover:border-border transition-all"
    >
      <div className="flex flex-col gap-3 w-full text-left">
        {/* Header: Checkbox, Content, Play Button */}
        <div className="flex items-start gap-2">
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <KanbanBoardCardButton asChild>
              <Checkbox
                checked={task.is_completed}
                onCheckedChange={handleComplete}
                className={cn(
                  priorityColors[task.priority as 1 | 2 | 3 | 4],
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

          {/* Play Button */}
          <KanbanBoardCardButton
            onClick={handlePlayFocus}
            className={cn(
              "shrink-0 text-muted-foreground hover:text-brand transition-seijaku",
              isDesktop ? "h-6 w-6" : "h-8 w-8",
            )}
            tooltip="Start focus timer"
          >
            <Play
              className={cn(isDesktop ? "h-3.5 w-3.5" : "h-4 w-4")}
              strokeWidth={2.25}
            />
          </KanbanBoardCardButton>
        </div>

        {/* Footer: Project (Left) | Tags (Right) */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/60 tracking-tight">
            {task.due_date && (
              <span className={cn(isOverdue && "text-destructive font-bold")}>
                {formatDueDate(task.due_date)}
              </span>
            )}
            {task.priority < 4 && (
              <span
                className={cn(
                  priorityColors[task.priority as 1 | 2 | 3 | 4],
                  "font-bold",
                )}
              >
                P{task.priority}
              </span>
            )}
            {task.is_evening && (
              <Moon
                className="h-3 w-3 fill-current text-brand"
                strokeWidth={2.5}
              />
            )}
          </div>
        </div>
      </div>
    </KanbanBoardCard>
  );
}
