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
    })
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
      trigger(50);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    setActiveTask(null);

    if (!over) return;
    trigger(30);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-x-auto pb-6 px-4 md:px-6 gap-4 md:gap-6 snap-x snap-mandatory">
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
          <div className="w-[85vw] md:w-[320px] rotate-2 scale-105 shadow-xl rounded-xl overflow-hidden pointer-events-none">
            <TaskItem task={activeTask} />
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
  return (
    <div className="flex-shrink-0 w-[85vw] md:w-[320px] snap-center flex flex-col h-full bg-secondary/20 rounded-2xl border border-border/40 p-3">
      <div className="flex items-center justify-between mb-4 px-1">
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
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {group.tasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
});
