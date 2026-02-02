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
import { TaskSection } from "./TaskSection";
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
      <div className="px-4 md:px-6 pb-12 md:pb-8 flex flex-col">
        {/* Active Tasks Grouped */}
        {groups ? (
          groups.map((group) => (
            <TaskSection key={group.title} title={group.title}>
              {group.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </TaskSection>
          ))
        ) : (
          // Active Tasks Flat - with Drag & Drop
          <SortableContext
            items={localTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <TaskSection>
              {localTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </TaskSection>
          </SortableContext>
        )}

        {/* This Evening Section */}
        {evening.length > 0 && (
          <TaskSection title="This Evening" count={evening.length} icon="🌙">
            {evening.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={handleTaskClick}
                isKeyboardSelected={task.id === keyboardSelectedId}
              />
            ))}
          </TaskSection>
        )}

        {/* Completed Section */}
        {completed.length > 0 && (
          <TaskSection
            title="Completed"
            count={completed.length}
            variant="muted"
          >
            {completed.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={handleTaskClick}
                isKeyboardSelected={task.id === keyboardSelectedId}
              />
            ))}
          </TaskSection>
        )}
      </div>
    </DndContext>
  );
}
