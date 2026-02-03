"use client";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
  useDroppable,
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
import { cn } from "@/lib/utils";

function DroppableSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

interface TaskListViewProps {
  processedTasks: ProcessedTasks;
  localTasks: Task[];
  localEveningTasks: Task[];
  handleTaskClick: (task: Task) => void;
  keyboardSelectedId: string | null;
}

export function TaskListView({
  processedTasks,
  localTasks,
  localEveningTasks,
  handleTaskClick,
  keyboardSelectedId,
}: TaskListViewProps) {
  const { groups, completed } = processedTasks;
  const evening = localEveningTasks;

  return (
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
        <>
          {/* Active Tasks Flat - with Drag & Drop */}
          <SortableContext
            id="active-section"
            items={localTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <DroppableSection id="active-section">
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
            </DroppableSection>
          </SortableContext>

          {/* This Evening Section - Now Sortable */}
          <SortableContext
            id="evening-section"
            items={evening.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <DroppableSection id="evening-section">
              <TaskSection
                title="This Evening"
                count={evening.length > 0 ? evening.length : undefined}
                icon="🌙"
                className={cn(
                  "transition-all duration-300",
                  evening.length === 0 && "opacity-20 hover:opacity-100",
                )}
              >
                {evening.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
                {evening.length === 0 && (
                  <div className="h-12 flex items-center justify-center border-2 border-dashed border-primary/10 rounded-2xl">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                      Drop here for evening
                    </span>
                  </div>
                )}
              </TaskSection>
            </DroppableSection>
          </SortableContext>
        </>
      )}

      {/* Completed Section - Still static */}
      {completed.length > 0 && (
        <TaskSection title="Completed" count={completed.length} variant="muted">
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
  );
}
