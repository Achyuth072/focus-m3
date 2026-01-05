"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "./TaskItem";
import type { Task } from "@/lib/types/task";

interface SortableTaskItemProps {
  task: Task;
  onClick?: () => void;
  isKeyboardSelected?: boolean;
}

export default function SortableTaskItem({ task, onClick, isKeyboardSelected }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
        onClick={onClick} 
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
        isKeyboardSelected={isKeyboardSelected}
      />
    </div>
  );
}
