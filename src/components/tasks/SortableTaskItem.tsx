"use client";

import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import TaskItem from "./TaskItem";
import type { Task } from "@/lib/types/task";
import { cn } from "@/lib/utils";

interface SortableTaskItemProps {
  task: Task;
  onSelect?: (task: Task) => void;
  isKeyboardSelected?: boolean;
  viewMode?: "list" | "grid" | "board";
}

/**
 * TaskItemContent is memoized to prevent re-renders during drag operations.
 * useSortable in the parent triggers re-renders on every frame (60fps),
 * but this child will only re-render if its props actually change.
 */
const TaskItemContent = memo(
  ({
    task,
    onSelect,
    isKeyboardSelected,
    viewMode,
    attributes,
    listeners,
    isDragging,
    setActivatorNodeRef,
  }: SortableTaskItemProps & {
    attributes: import("@dnd-kit/core").DraggableAttributes;
    listeners: import("@dnd-kit/core").DraggableSyntheticListeners | undefined;
    isDragging: boolean;
    setActivatorNodeRef: (element: HTMLElement | null) => void;
  }) => {
    return (
      <TaskItem
        task={task}
        onSelect={onSelect}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
        isKeyboardSelected={isKeyboardSelected}
        viewMode={viewMode}
        dragActivatorRef={setActivatorNodeRef}
      />
    );
  },
  (prev, next) => {
    // Custom equality check to be extra safe during DnD re-renders
    return (
      prev.task.id === next.task.id &&
      prev.task.content === next.task.content &&
      prev.task.is_completed === next.task.is_completed &&
      prev.task.priority === next.task.priority &&
      prev.isKeyboardSelected === next.isKeyboardSelected &&
      prev.viewMode === next.viewMode &&
      prev.isDragging === next.isDragging
    );
  },
);

TaskItemContent.displayName = "TaskItemContent";

export default function SortableTaskItem({
  task,
  onSelect,
  isKeyboardSelected,
  viewMode,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    isOver,
    active,
    over,
  } = useSortable({ id: task.id });

  // Determine drop indicator position
  let dropLine: "none" | "top" | "bottom" = "none";
  if (isOver && !isDragging) {
    const activeIndex = active?.data.current?.sortable?.index;
    const overIndex = over?.data.current?.sortable?.index;

    if (activeIndex !== undefined && overIndex !== undefined) {
      dropLine = activeIndex < overIndex ? "bottom" : "top";
    } else {
      dropLine = "top";
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-[background-color,border-color,opacity,box-shadow,ring,height] duration-200",
        "last:[&_.task-separator]:hidden",
        isDragging ? "opacity-30 z-20" : "opacity-100 z-10",
        // Drop indicator line (like Kanban)
        dropLine === "top" &&
          "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:z-[50] before:rounded-full",
        dropLine === "bottom" &&
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:z-[50] after:rounded-full",
      )}
    >
      <TaskItemContent
        task={task}
        onSelect={onSelect}
        isKeyboardSelected={isKeyboardSelected}
        viewMode={viewMode}
        attributes={attributes}
        listeners={listeners}
        isDragging={isDragging}
        setActivatorNodeRef={setActivatorNodeRef}
      />
    </div>
  );
}
