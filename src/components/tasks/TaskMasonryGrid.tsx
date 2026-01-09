"use client";

import React, { useMemo, memo } from "react";
import type { Task, Project } from "@/lib/types/task";
import type { ProcessedTasks } from "@/lib/hooks/useTaskViewData";
import { cn } from "@/lib/utils";

interface TaskMasonryGridProps {
  processedTasks: ProcessedTasks;
  projects?: Project[];
  onSelect?: (task: Task) => void;
}

export function TaskMasonryGrid({
  processedTasks,
  projects,
  onSelect,
}: TaskMasonryGridProps) {
  const { active, evening, groups } = processedTasks;

  // Flatten keeping the processed order (groups or flat)
  const allNavigableTasks = useMemo(() => {
    const list: Task[] = [];
    if (groups) {
      groups.forEach((g) => list.push(...g.tasks));
    } else {
      list.push(...active);
      // Add evening tasks at the end of the active set ONLY if not grouped (where they are included)
      list.push(...evening);
    }
    return list;
  }, [active, evening, groups]);

  if (allNavigableTasks.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground">
        No active tasks to display in grid.
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6">
      {/* 
          Grid layout with auto-rows to maintain masonry feel 
          Kanso style: balanced void space (Ma)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          {allNavigableTasks
            .filter(
              (_, i) =>
                i % 3 === 0 || (allNavigableTasks.length < 3 && i % 2 === 0)
            )
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                onSelect={onSelect}
              />
            ))}
        </div>
        {/* Column 2 */}
        <div className="hidden sm:flex flex-col gap-4">
          {allNavigableTasks
            .filter((_, i) =>
              allNavigableTasks.length >= 3 ? i % 3 === 1 : i % 2 === 1
            )
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                onSelect={onSelect}
              />
            ))}
        </div>
        {/* Column 3 */}
        <div className="hidden lg:flex flex-col gap-4">
          {allNavigableTasks
            .filter((_, i) => i % 3 === 2)
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                onSelect={onSelect}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

const TaskCard = memo(function TaskCard({
  task,
  projects,
  onSelect,
}: {
  task: Task;
  projects?: Project[];
  onSelect?: (task: Task) => void;
}) {
  const projectName = useMemo(() => {
    if (!task.project_id) return null;
    if (task.project_id === "inbox") return "Inbox";
    const project = projects?.find((p) => p.id === task.project_id);
    return project?.name || task.project_id;
  }, [task.project_id, projects]);

  return (
    <div
      className={cn(
        "group relative bg-background border border-border/40 hover:border-border transition-all rounded-xl p-4 cursor-pointer",
        "hover:shadow-sm"
      )}
      onClick={() => onSelect?.(task)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h4
            className={cn(
              "text-sm font-medium leading-normal",
              task.is_completed && "line-through text-muted-foreground"
            )}
          >
            {task.content}
          </h4>
          <div
            className={cn(
              "shrink-0 h-4 w-4 rounded-sm border",
              task.priority === 1
                ? "border-red-500"
                : task.priority === 2
                ? "border-orange-500"
                : task.priority === 3
                ? "border-blue-500"
                : "border-muted-foreground/30"
            )}
          />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {task.is_evening && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wider">
              Evening
            </span>
          )}
          {projectName && (
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
              #{projectName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
