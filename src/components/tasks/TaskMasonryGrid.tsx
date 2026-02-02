"use client";

import React, { useMemo, memo } from "react";
import type { Task, Project } from "@/lib/types/task";
import type { ProcessedTasks } from "@/lib/hooks/useTaskViewData";
import { cn } from "@/lib/utils";

import { Masonry } from "@/components/ui/Masonry";

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
      <div className="px-4 md:px-6 py-12 text-center text-muted-foreground">
        No active tasks to display in grid.
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 pb-12 md:pb-8">
      <Masonry
        items={allNavigableTasks}
        renderItem={(task) => (
          <TaskCard
            key={task.id}
            task={task}
            projects={projects}
            onSelect={onSelect}
          />
        )}
      />
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
        "group relative bg-background border border-border/80 hover:border-border hover:bg-secondary/5 transition-seijaku rounded-xl p-4 cursor-pointer",
      )}
      onClick={() => onSelect?.(task)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-0.5 flex-1 min-w-0">
            <h4
              className={cn(
                "text-[15px] leading-relaxed",
                task.is_completed && "line-through text-muted-foreground",
              )}
            >
              {task.content}
            </h4>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap min-h-4">
          {task.is_evening && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-brand/10 text-brand font-medium uppercase tracking-wider leading-none">
              Evening
            </span>
          )}
          {projectName && (
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold leading-none">
              #{projectName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
