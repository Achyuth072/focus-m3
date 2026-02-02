"use client";

import React, { useMemo, memo } from "react";
import type { Task, Project } from "@/lib/types/task";
import type { ProcessedTasks } from "@/lib/hooks/useTaskViewData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/TimerProvider";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { KanbanBoardCardButton } from "@/components/kanban";

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
                i % 3 === 0 || (allNavigableTasks.length < 3 && i % 2 === 0),
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
              allNavigableTasks.length >= 3 ? i % 3 === 1 : i % 2 === 1,
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
        "group relative bg-background border border-border/80 hover:border-muted-foreground/50 hover:bg-secondary/5 transition-seijaku rounded-xl p-4 cursor-pointer",
      )}
      onClick={() => onSelect?.(task)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-0.5 flex-1 min-w-0">
            <h4
              className={cn(
                "text-[15px] font-medium leading-normal",
                task.is_completed && "line-through text-muted-foreground",
              )}
            >
              {task.content}
            </h4>
            <PlayButton task={task} />
          </div>
          <div
            className={cn(
              "shrink-0 h-4 w-4 rounded-sm border",
              task.priority === 1
                ? "border-red-500"
                : task.priority === 2
                  ? "border-orange-500"
                  : task.priority === 3
                    ? "border-blue-500"
                    : "border-muted-foreground/30",
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
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand/10 text-brand font-medium uppercase tracking-wider">
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

// PlayButton component for starting focus timer
function PlayButton({ task }: { task: Task }) {
  const { start } = useTimer();
  const router = useRouter();
  const { trigger } = useHaptic();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handlePlayFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    trigger(50);
    start(task.id);
    router.push("/focus");
  };

  return (
    <KanbanBoardCardButton
      onClick={handlePlayFocus}
      className={cn(
        "shrink-0 text-muted-foreground hover:text-brand transition-seijaku",
        isDesktop ? "h-6 w-6 opacity-0 group-hover:opacity-100" : "h-8 w-8",
      )}
      tooltip="Start focus timer"
    >
      <Play
        className={cn(isDesktop ? "h-3.5 w-3.5" : "h-4 w-4")}
        strokeWidth={2.25}
      />
    </KanbanBoardCardButton>
  );
}
