"use client";

import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "./TaskItem";
import type { Task } from "@/lib/types/task";

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
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    // No transition - snappy movement instead of smooth
    opacity: isDragging ? 0.5 : 1,
  };

  // Pass drag listeners and state to TaskItem for dedicated handle
  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        onSelect={onSelect}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
        isKeyboardSelected={isKeyboardSelected}
        viewMode={viewMode}
      />
    </div>
  );
}

export default memo(SortableTaskItem);
