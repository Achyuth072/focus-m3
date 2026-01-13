"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";

import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useTasks } from "@/lib/hooks/useTasks";
import { useProjects } from "@/lib/hooks/useProjects";
import TaskSheet from "./TaskSheet";
import type { Task } from "@/lib/types/task";
import { SortOption, GroupOption } from "@/lib/types/sorting";
import {
  useReorderTasks,
  useDeleteTask,
  useToggleTask,
} from "@/lib/hooks/useTaskMutations";
import { useUiStore } from "@/lib/store/uiStore";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { useHotkeys } from "react-hotkeys-hook";
import { useTaskViewData } from "@/lib/hooks/useTaskViewData";
import { TaskListView } from "./TaskListView";
import { TaskMasonryGrid } from "./TaskMasonryGrid";
import { TaskKanbanBoard } from "./TaskKanbanBoard";

interface TaskListProps {
  sortBy?: SortOption;
  groupBy?: GroupOption;
  projectId?: string | null;
  filter?: string;
}

export default function TaskList({
  sortBy = "date",
  groupBy = "none",
  projectId,
  filter,
}: TaskListProps) {
  const { data: tasks, isLoading } = useTasks({ projectId, filter });
  const { data: projectsData } = useProjects();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [keyboardSelectedId, setKeyboardSelectedId] = useState<string | null>(
    null
  );

  const reorderMutation = useReorderTasks();
  const deleteMutation = useDeleteTask();
  const toggleMutation = useToggleTask();
  const { setSortBy, viewMode } = useUiStore();
  const { trigger } = useHaptic();
  // NOTE: uncertain intent — optimistic UI sync logic using ref to prevent sync loop after drag-and-drop.
  const justDragged = useRef(false);

  // Configure sensors with activation constraints to avoid conflicts with swipe
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold required on touch devices
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const processedTasks = useTaskViewData({
    tasks,
    sortBy,
    groupBy,
    projects: projectsData,
  });

  // Sync local tasks with processed tasks (skip if just dragged for optimistic UI)
  useEffect(() => {
    if (justDragged.current) {
      justDragged.current = false;
      return; // Skip sync - keep optimistic order
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalTasks(processedTasks.active);
  }, [processedTasks.active]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleDragStart = () => {
    trigger(15);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((task) => task.id === active.id);
    const newIndex = localTasks.findIndex((task) => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Haptic feedback on successful drop
    trigger(50);

    // Mark as just dragged to skip sync overwrite
    justDragged.current = true;

    // Auto-switch to custom sort if not already
    if (sortBy !== "custom") {
      setSortBy("custom");
    }

    // Optimistic update
    const reordered = arrayMove(localTasks, oldIndex, newIndex);
    setLocalTasks(reordered);

    // Persist to database - update ALL tasks in the collection to ensure correct day_order
    reorderMutation.mutate(reordered.map((t) => t.id));
  };

  // --- Keyboard Navigation ---

  const navigableTasks = useMemo(() => {
    const list: Task[] = [];
    if (processedTasks.groups) {
      processedTasks.groups.forEach((g) => list.push(...g.tasks));
    } else {
      list.push(...localTasks);
    }
    // Add evening
    list.push(...processedTasks.evening);
    // Add completed
    list.push(...processedTasks.completed);
    return list;
  }, [processedTasks, localTasks]);

  const handleNav = (direction: 1 | -1) => {
    if (navigableTasks.length === 0) return;

    const currentIndex = navigableTasks.findIndex(
      (t) => t.id === keyboardSelectedId
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
    { preventDefault: true }
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
      <div className="px-6 py-12 text-center">
        <p className="text-muted-foreground">
          No tasks yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1">
        {viewMode === "grid" ? (
          <TaskMasonryGrid
            processedTasks={processedTasks}
            projects={projectsData}
            onSelect={handleTaskClick}
          />
        ) : viewMode === "board" ? (
          <TaskKanbanBoard
            processedTasks={processedTasks}
            onSelect={handleTaskClick}
          />
        ) : (
          <div className="space-y-2">
            <TaskListView
              processedTasks={processedTasks}
              localTasks={localTasks}
              sensors={sensors}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleTaskClick={handleTaskClick}
              keyboardSelectedId={keyboardSelectedId}
            />
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
