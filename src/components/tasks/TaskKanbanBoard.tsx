"use client";

import React, { useState, useMemo, memo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  useDroppable,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task } from "@/lib/types/task";
import type { ProcessedTasks, TaskGroup } from "@/lib/hooks/useTaskViewData";
import SortableTaskItem from "./SortableTaskItem";
import TaskItem from "./TaskItem";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface TaskKanbanBoardProps {
  processedTasks: ProcessedTasks;
  onSelect?: (task: Task) => void;
}

export function TaskKanbanBoard({
  processedTasks,
  onSelect,
}: TaskKanbanBoardProps) {
  const { groups, active, evening } = processedTasks;
  const { trigger } = useHaptic();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const boardColumns = useMemo<TaskGroup[]>(() => {
    if (groups) return groups;
    return [
      { title: "Tasks", tasks: active },
      { title: "This Evening", tasks: evening },
    ].filter((c) => c.tasks.length > 0 || groups !== null);
  }, [groups, active, evening]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const allTasks = useMemo(() => {
    const list: Task[] = [];
    boardColumns.forEach((c) => list.push(...c.tasks));
    return list;
  }, [boardColumns]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      trigger(15);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    setActiveTask(null);

    if (!over) return;
    trigger(50);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-x-auto pb-12 md:pb-6 px-4 md:px-6 gap-3 md:gap-6 snap-x snap-mandatory">
        {boardColumns.map((group) => (
          <KanbanColumn key={group.title} group={group} onSelect={onSelect} />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeTask ? (
          <div className="w-[90vw] md:w-[320px] rotate-2 scale-105 shadow-xl rounded-xl overflow-hidden pointer-events-none">
            <TaskItem task={activeTask} viewMode="board" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const KanbanColumn = memo(function KanbanColumn({
  group,
  onSelect,
}: {
  group: TaskGroup;
  onSelect?: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: group.title,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-[90vw] md:w-[320px] snap-center h-full flex flex-col"
    >
      <div className="flex flex-col max-h-full bg-secondary/10 rounded-2xl border border-border p-2 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-4 px-1 flex-shrink-0">
          <h3 className="type-ui font-bold text-foreground/80 lowercase tracking-tight">
            {group.title}
          </h3>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold opacity-60">
            {group.tasks.length}
          </span>
        </div>

        <SortableContext
          items={group.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 space-y-2 overflow-y-auto px-1 -mx-1 py-1 -my-1 scrollbar-hide">
            {group.tasks.length > 0 ? (
              group.tasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onSelect={onSelect}
                  viewMode="board"
                />
              ))
            ) : (
              <div className="h-20 flex items-center justify-center border-2 border-dashed border-border/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs text-muted-foreground">Drop here</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
});
