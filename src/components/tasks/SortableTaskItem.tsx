"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "./TaskItem";
import type { Task } from "@/lib/types/task";

interface SortableTaskItemProps {
  task: Task;
  onClick?: () => void;
}

export default function SortableTaskItem({ task, onClick }: SortableTaskItemProps) {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Apply drag listeners to the entire item - sensors will handle activation constraints
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem task={task} onClick={onClick} />
    </div>
  );
}
