"use client";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskItem from "./TaskItem";
import SortableTaskItem from "./SortableTaskItem";
import type { Task } from "@/lib/types/task";
import type { ProcessedTasks } from "@/lib/hooks/useTaskViewData";

interface TaskListViewProps {
  processedTasks: ProcessedTasks;
  localTasks: Task[];
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragStart: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleTaskClick: (task: Task) => void;
  keyboardSelectedId: string | null;
}

export function TaskListView({
  processedTasks,
  localTasks,
  sensors,
  handleDragStart,
  handleDragEnd,
  handleTaskClick,
  keyboardSelectedId,
}: TaskListViewProps) {
  const { groups, evening, completed } = processedTasks;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="px-4 md:px-6 flex flex-col gap-2 pb-12 md:pb-8">
        {/* Active Tasks Grouped */}
        {groups ? (
          groups.map((group) => (
            <div key={group.title} className="space-y-0 md:space-y-1">
              <h3 className="type-h3 px-1 mt-6 first:mt-2 mb-2 lowercase tracking-tight text-foreground/70">
                {group.title}
              </h3>
              {group.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </div>
          ))
        ) : (
          // Active Tasks Flat - with Drag & Drop
          <SortableContext
            items={localTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0 md:space-y-1">
              {localTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </div>
          </SortableContext>
        )}

        {/* This Evening Section */}
        {evening.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2 flex items-center gap-1.5">
              <span className="text-sm">🌙</span>
              This Evening ({evening.length})
            </p>
            <div className="space-y-0 md:space-y-1">
              {evening.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Section */}
        {completed.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Completed ({completed.length})
            </p>
            <div className="space-y-0 md:space-y-1 opacity-60">
              {completed.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
