"use client";

import { useState, useMemo, useCallback } from "react";

import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCenter,
  DndContext,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import TaskSheet from "./TaskSheet";
import type { Task } from "@/lib/types/task";
import { SortOption, GroupOption } from "@/lib/types/sorting";
import {
  useReorderTasks,
  useUpdateTask,
  useDeleteTask,
  useToggleTask,
} from "@/lib/hooks/useTaskMutations";
import { useUiStore } from "@/lib/store/uiStore";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useHotkeys } from "react-hotkeys-hook";
import { useTaskViewData } from "@/lib/hooks/useTaskViewData";
import { TaskListView } from "./TaskListView";
import { TaskMasonryGrid } from "./TaskMasonryGrid";
import { IntegratedTaskKanbanBoard } from "./IntegratedTaskKanbanBoard";
import { TaskGhost } from "./TaskGhost";

interface TaskListProps {
  sortBy?: SortOption;
  groupBy?: GroupOption;
  projectId?: string | null;
  filter?: string;
  onTaskSelect?: (task: Task) => void;
}

export default function TaskList({
  sortBy = "date",
  groupBy = "none",
  projectId,
  filter,
  onTaskSelect,
}: TaskListProps) {
  const { data: tasks = [], isLoading } = useTasks({ projectId, filter });
  const { data: projectsData } = useProjects();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [keyboardSelectedId, setKeyboardSelectedId] = useState<string | null>(
    null,
  );

  const reorderMutation = useReorderTasks();
  const updateMutation = useUpdateTask(); // Add useUpdateTask
  const deleteMutation = useDeleteTask();
  const toggleMutation = useToggleTask();
  const { setSortBy, viewMode } = useUiStore();
  const { trigger } = useHaptic();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Configure sensors - Split for desktop vs mobile feel
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const processedTasks = useTaskViewData({
    tasks,
    sortBy,
    groupBy,
    projects: projectsData,
  });

  // Single source of truth: TanStack Query cache (updated via onMutate)
  const displayTasks = processedTasks.active;
  const displayEveningTasks = processedTasks.evening;

  const handleTaskClick = useCallback(
    (task: Task) => {
      if (onTaskSelect) {
        onTaskSelect(task);
      } else {
        setSelectedTask(task);
      }
    },
    [onTaskSelect],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    trigger("MEDIUM");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const findTask = (id: string) =>
      processedTasks.active.find((t) => t.id === id) ||
      processedTasks.evening.find((t) => t.id === id);

    const activeTask = findTask(active.id as string);
    const overTask = findTask(over.id as string);

    if (!activeTask) return;

    // Determine destination section
    const isOverEvening =
      over.id === "evening-section" || // Drop on placeholder/header
      (overTask && overTask.is_evening); // Drop over a task already in evening

    const shouldBeInEvening = !!isOverEvening;

    // Handle cross-section movement
    if (activeTask.is_evening !== shouldBeInEvening) {
      trigger("HEAVY");
      updateMutation.mutate({
        id: activeTask.id,
        is_evening: shouldBeInEvening,
      });
      return;
    }

    // Same-section reordering
    const currentList = activeTask.is_evening
      ? processedTasks.evening
      : processedTasks.active;
    const oldIndex = currentList.findIndex((task) => task.id === active.id);
    const newIndex = currentList.findIndex((task) => task.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      trigger("HEAVY");
      const reordered = arrayMove(currentList, oldIndex, newIndex);

      // Mutation triggers onMutate which updates cache instantly
      // No local state needed - TanStack Query handles optimistic update
      if (sortBy !== "custom") setSortBy("custom");
      reorderMutation.mutate(reordered.map((t) => t.id));
    }
  };

  // --- Keyboard Navigation ---

  const navigableTasks = useMemo(() => {
    const list: Task[] = [];
    if (processedTasks?.groups) {
      processedTasks.groups.forEach((g) => list.push(...g.tasks));
    } else {
      list.push(...(processedTasks?.active || []));
    }
    // Add evening
    list.push(...(processedTasks?.evening || []));
    // Add completed
    list.push(...(processedTasks?.completed || []));
    return list;
  }, [processedTasks]);

  const handleNav = (direction: 1 | -1) => {
    if (navigableTasks.length === 0) return;

    const currentIndex = navigableTasks.findIndex(
      (t) => t.id === keyboardSelectedId,
    );
    if (currentIndex === -1) {
      // Select first if nothing selected
      setKeyboardSelectedId(navigableTasks[0].id);
      return;
    }

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < navigableTasks.length) {
      setKeyboardSelectedId(navigableTasks[nextIndex].id);

      // Scroll into view logic could go here if needed,
      // but native focus handling often easier if we actually focused the element.
      // For now, visual highlight only.
    }
  };

  useHotkeys("j", () => handleNav(1), { preventDefault: true });
  useHotkeys("k", () => handleNav(-1), { preventDefault: true });

  useHotkeys("space", (e) => {
    e.preventDefault(); // Prevent scrolling
    if (keyboardSelectedId) {
      const task = navigableTasks.find((t) => t.id === keyboardSelectedId);
      if (task) {
        toggleMutation.mutate({
          id: task.id,
          is_completed: !task.is_completed,
        });
      }
    }
  });

  useHotkeys(
    ["enter", "e"],
    () => {
      if (keyboardSelectedId) {
        const task = navigableTasks.find((t) => t.id === keyboardSelectedId);
        if (task) setSelectedTask(task);
      }
    },
    { preventDefault: true },
  );

  useHotkeys(["d", "backspace"], () => {
    if (keyboardSelectedId) {
      // Optional: Add confirmation or simply visually strike through?
      // For safety, let's just trigger delete mutation
      deleteMutation.mutate(keyboardSelectedId);
      // Select next task automatically
      handleNav(1);
    }
  });

  // Must be declared before early returns to comply with Rules of Hooks.
  const overlayContent = useMemo(() => {
    if (!activeId) return null;

    const currentActiveId = activeId as string;
    const draggingTask =
      processedTasks.active.find((t) => t.id === currentActiveId) ||
      processedTasks.evening.find((t) => t.id === currentActiveId) ||
      tasks.find((t) => t.id === currentActiveId);

    if (!draggingTask) return null;

    const project = projectsData?.find((p) => p.id === draggingTask.project_id);

    return (
      <div className="opacity-90 shadow-2xl scale-[1.02] origin-left transition-transform duration-200 pointer-events-none will-change-transform">
        <TaskGhost
          task={draggingTask}
          isDesktop={isDesktop}
          viewMode="list"
          project={
            project ? { color: project.color, name: project.name } : undefined
          }
        />
      </div>
    );
  }, [
    activeId,
    processedTasks.active,
    processedTasks.evening,
    tasks,
    projectsData,
    isDesktop,
  ]);

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 py-4">
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 md:h-8 md:border-b md:border-border/40 rounded-xl md:rounded-sm mx-2 md:mx-0 mb-2 md:mb-0 bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (
    processedTasks.active.length === 0 &&
    processedTasks.completed.length === 0
  ) {
    return (
      <div className="px-4 md:px-6 py-12 text-center">
        <p className="text-muted-foreground">
          No tasks yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
        {viewMode === "grid" ? (
          <TaskMasonryGrid
            processedTasks={processedTasks}
            projects={projectsData}
            onSelect={handleTaskClick}
          />
        ) : viewMode === "board" && isDesktop ? (
          <IntegratedTaskKanbanBoard
            processedTasks={processedTasks}
            onSelect={handleTaskClick}
          />
        ) : (
          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <TaskListView
                processedTasks={processedTasks}
                activeTasks={displayTasks}
                eveningTasks={displayEveningTasks}
                handleTaskClick={handleTaskClick}
                keyboardSelectedId={keyboardSelectedId}
              />

              <DragOverlay
                dropAnimation={{
                  duration: isDesktop ? 250 : 50,
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: "0.5",
                      },
                    },
                  }),
                }}
              >
                {overlayContent}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <TaskSheet
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialTask={selectedTask}
      />
    </>
  );
}
