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

function SortableTaskItem({
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

  const style = {
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  // Determine drop indicator position
  let dropLine: "none" | "top" | "bottom" = "none";
  if (isOver && !isDragging) {
    const activeIndex = active?.data.current?.sortable?.index;
    const overIndex = over?.data.current?.sortable?.index;

    if (activeIndex !== undefined && overIndex !== undefined) {
      dropLine = activeIndex < overIndex ? "bottom" : "top";
    } else {
      // Cross-section drag or missing index
      dropLine = "top";
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative transition-[background-color,border-color,opacity,box-shadow,ring,height] duration-200",
        "last:[&_.task-separator]:hidden",
        // Drop indicator line (like Kanban)
        dropLine === "top" &&
          "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-primary before:z-[50] before:rounded-full",
        dropLine === "bottom" &&
          "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:z-[50] after:rounded-full",
      )}
    >
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
    </div>
  );
}

export default memo(SortableTaskItem);
