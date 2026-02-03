"use client";

import React, { useMemo, useCallback } from "react";
import {
  KanbanBoard,
  KanbanBoardColumn,
  KanbanBoardColumnHeader,
  KanbanBoardColumnTitle,
  KanbanBoardColumnList,
  KanbanBoardProvider,
  KanbanBoardColumnListItem,
  type KanbanBoardDropDirection,
} from "@/components/kanban";
import { useJsLoaded } from "@/lib/hooks/use-js-loaded";
import type { ProcessedTasks, TaskGroup } from "@/lib/hooks/useTaskViewData";
import type { Task } from "@/lib/types/task";
import { IntegratedTaskCard } from "./IntegratedTaskCard";
import {
  useUpdateTask,
  useToggleTask,
  useReorderTasks,
} from "@/lib/hooks/useTaskMutations";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { addDays, format } from "date-fns";
import { useProject, useProjects } from "@/lib/hooks/useProjects";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useRouter } from "next/navigation";
import { useTimer } from "@/components/TimerProvider";

interface IntegratedTaskKanbanBoardProps {
  processedTasks: ProcessedTasks;
  onSelect?: (task: Task) => void;
}

export function IntegratedTaskKanbanBoard({
  processedTasks,
  onSelect,
}: IntegratedTaskKanbanBoardProps) {
  const isJsLoaded = useJsLoaded();
  const { groups, active, evening } = processedTasks;
  const updateTaskMutation = useUpdateTask();
  const { trigger } = useHaptic();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { start: startTimer } = useTimer();
  const { data: projects } = useProjects();
  const reorderMutation = useReorderTasks();

  const boardColumns = useMemo<TaskGroup[]>(() => {
    if (groups && groups.length > 0) return groups;
    return [
      { title: "Tasks", tasks: active },
      { title: "This Evening", tasks: evening },
    ].filter((c) => c.tasks.length > 0);
  }, [groups, active, evening]);

  const getTaskUpdatesForColumn = useCallback(
    (columnId: string) => {
      let updates: Partial<Task> = {};
      const today = new Date();
      const columnKey = columnId.toLowerCase();

      // Mapping column titles to task property updates
      if (columnKey === "today") {
        updates = { do_date: format(today, "yyyy-MM-dd"), is_evening: false };
      } else if (columnKey === "tomorrow") {
        updates = {
          do_date: format(addDays(today, 1), "yyyy-MM-dd"),
          is_evening: false,
        };
      } else if (columnKey === "upcoming") {
        updates = {
          do_date: format(addDays(today, 2), "yyyy-MM-dd"),
          is_evening: false,
        };
      } else if (columnKey === "overdue") {
        // Overdue items typically get moved to 'Today'
        updates = { do_date: format(today, "yyyy-MM-dd"), is_evening: false };
      } else if (columnKey === "this evening") {
        updates = { is_evening: true };
      } else if (columnKey === "tasks") {
        updates = { is_evening: false };
      } else if (columnKey === "critical") {
        updates = { priority: 1 };
      } else if (columnKey === "high") {
        updates = { priority: 2 };
      } else if (columnKey === "medium") {
        updates = { priority: 3 };
      } else if (columnKey === "low") {
        updates = { priority: 4 };
      } else {
        // Project matching
        const targetProject = projects?.find(
          (p) => p.name.toLowerCase() === columnKey,
        );
        if (targetProject) {
          updates = { project_id: targetProject.id };
        }
      }
      return updates;
    },
    [projects],
  );

  const handleDropOverColumn = useCallback(
    (taskData: string, columnId: string) => {
      const task: Task = JSON.parse(taskData);
      const updates = getTaskUpdatesForColumn(columnId);

      if (Object.keys(updates).length > 0) {
        updateTaskMutation.mutate({ id: task.id, ...updates });
        trigger(50); // Thud haptic for drop commitment
      }
    },
    [updateTaskMutation, trigger, getTaskUpdatesForColumn],
  );

  const handleDropOverListItem = useCallback(
    (
      taskData: string,
      targetCardId: string,
      direction: KanbanBoardDropDirection,
      columnId: string,
    ) => {
      const draggedTask: Task = JSON.parse(taskData);
      if (draggedTask.id === targetCardId) return;

      const group = boardColumns.find((g) => g.title === columnId);
      if (!group) return;

      const updates = getTaskUpdatesForColumn(columnId);

      const tasks = [...group.tasks];
      const oldIndex = tasks.findIndex((t) => t.id === draggedTask.id);
      const newIndex = tasks.findIndex((t) => t.id === targetCardId);

      if (newIndex === -1) return;

      let finalIndex = newIndex;
      if (direction === "bottom") finalIndex += 1;

      if (oldIndex !== -1) {
        tasks.splice(oldIndex, 1);
        if (oldIndex < finalIndex) finalIndex -= 1;
      } else {
        // Only apply property updates (like date/priority) if moving FROM another column
        if (Object.keys(updates).length > 0) {
          updateTaskMutation.mutate({ id: draggedTask.id, ...updates });
        }
      }
      tasks.splice(finalIndex, 0, { ...draggedTask, ...updates });

      reorderMutation.mutate(tasks.map((t) => t.id));
      trigger(50);
    },
    [
      boardColumns,
      reorderMutation,
      updateTaskMutation,
      trigger,
      getTaskUpdatesForColumn,
    ],
  );

  if (!isJsLoaded) return null;

  return (
    <KanbanBoardProvider>
      <KanbanBoard className="snap-x snap-mandatory scrollbar-hide px-4 md:px-6 gap-6 h-full pb-12">
        {boardColumns.map((group) => (
          <KanbanBoardColumn
            key={group.title}
            columnId={group.title}
            onDropOverColumn={(data) => handleDropOverColumn(data, group.title)}
            className="w-[85vw] md:w-[320px] snap-center bg-secondary/10 border-border/60 rounded-2xl flex flex-col p-0.5 max-h-[calc(100vh-200px)] md:max-h-full"
          >
            <KanbanBoardColumnHeader className="px-3 py-2.5">
              <KanbanBoardColumnTitle
                columnId={group.title}
                className="type-h3 lowercase tracking-tight text-foreground/70"
              >
                {group.title}
                <span className="ml-2 text-[11px] font-bold opacity-40 tabular-nums">
                  {group.tasks.length}
                </span>
              </KanbanBoardColumnTitle>
            </KanbanBoardColumnHeader>
            <KanbanBoardColumnList className="px-3 pb-4 space-y-3 scrollbar-hide">
              {group.tasks.map((task) => (
                <KanbanBoardColumnListItem
                  key={task.id}
                  cardId={task.id}
                  onDropOverListItem={(data, direction) =>
                    handleDropOverListItem(
                      data,
                      task.id,
                      direction,
                      group.title,
                    )
                  }
                >
                  <TaskCardWrapper
                    task={task}
                    isDesktop={isDesktop}
                    onSelect={onSelect}
                    startTimer={startTimer}
                  />
                </KanbanBoardColumnListItem>
              ))}
              {group.tasks.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-primary/5 rounded-2xl opacity-40 hover:opacity-100 transition-seijaku">
                  <span className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                    Ma (Void)
                  </span>
                </div>
              )}
            </KanbanBoardColumnList>
          </KanbanBoardColumn>
        ))}
      </KanbanBoard>
    </KanbanBoardProvider>
  );
}

/**
 * Handles data fetching and mutation logic for individual cards
 * to keep the main board component lean and prevent full-board re-renders.
 */
const TaskCardWrapper = React.memo(function TaskCardWrapper({
  task,
  isDesktop,
  onSelect,
  startTimer,
}: {
  task: Task;
  isDesktop: boolean;
  onSelect?: (task: Task) => void;
  startTimer: (taskId: string) => void;
}) {
  const router = useRouter();
  const { data: project } = useProject(task.project_id);
  const toggleMutation = useToggleTask();
  const { trigger } = useHaptic();

  const handleComplete = useCallback(
    (checked: boolean) => {
      trigger(checked ? [10, 50] : 15);
      toggleMutation.mutate({ id: task.id, is_completed: checked });
    },
    [task.id, toggleMutation, trigger],
  );

  const handlePlayFocus = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      trigger(50);
      startTimer(task.id);
      router.push("/focus");
    },
    [task.id, trigger, startTimer, router],
  );

  const isOverdue = useMemo(() => {
    if (!task.due_date) return false;
    const date = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, [task.due_date]);

  return (
    <div onClick={() => onSelect?.(task)} className="cursor-pointer group/card">
      <IntegratedTaskCard
        task={task}
        project={
          project ? { color: project.color, name: project.name } : undefined
        }
        isOverdue={isOverdue}
        isDesktop={isDesktop}
        handleComplete={handleComplete}
        handlePlayFocus={handlePlayFocus}
      />
    </div>
  );
});
