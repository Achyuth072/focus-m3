"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskItem from "./TaskItem";
import SortableTaskItem from "./SortableTaskItem";
import type { Task } from "@/lib/types/task";
import type { ProcessedTasks } from "@/lib/hooks/useTaskViewData";
import { cn } from "@/lib/utils";

/**
 * DroppableContainer is a lightweight wrapper for dnd-kit drop zones.
 * Removed the extra levels of nesting found in the previous TaskSection.
 */
function DroppableContainer({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

/**
 * SectionHeader follows the "Shodo" (typography) principles
 * without introducing complex container hierarchies.
 */
function SectionHeader({
  title,
  count,
  icon,
  variant = "default",
}: {
  title: string;
  count?: number;
  icon?: React.ReactNode;
  variant?: "default" | "muted";
}) {
  return (
    <div className="flex items-baseline gap-2 px-1 mb-2">
      <h3
        className={cn(
          "type-h3 tracking-tight",
          variant === "muted"
            ? "text-muted-foreground/70"
            : "text-foreground/70",
        )}
      >
        {icon && <span className="mr-1.5 inline-block">{icon}</span>}
        {title}
      </h3>
      {count !== undefined && (
        <span className="type-micro text-muted-foreground font-medium">
          ({count})
        </span>
      )}
    </div>
  );
}

interface TaskListViewProps {
  processedTasks: ProcessedTasks;
  activeTasks: Task[];
  eveningTasks: Task[];
  handleTaskClick: (task: Task) => void;
  keyboardSelectedId: string | null;
}

/**
 * TaskListView rebuilt with a flat DOM hierarchy.
 * Optimized for dnd-kit performance by minimizing React reconciliation depth.
 */
export function TaskListView({
  processedTasks,
  activeTasks,
  eveningTasks,
  handleTaskClick,
  keyboardSelectedId,
}: TaskListViewProps) {
  const { groups, completed } = processedTasks;
  const active = activeTasks;
  const evening = eveningTasks;

  return (
    <div className="px-4 md:px-6 pb-12 md:pb-8 flex flex-col gap-8">
      {/* 1. Grouped Tasks (Non-Sortable) */}
      {groups &&
        groups.map((group) => (
          <section key={group.title} className="first:mt-2">
            <SectionHeader title={group.title} count={group.tasks.length} />
            <div className="flex flex-col gap-0 md:gap-2 md:contents rounded-xl border border-border/40 md:border-0 overflow-hidden">
              {group.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={handleTaskClick}
                  isKeyboardSelected={task.id === keyboardSelectedId}
                />
              ))}
            </div>
          </section>
        ))}

      {/* 2. Active Tasks (Flat & Sortable) */}
      {!groups && (
        <section className="first:mt-2">
          <SortableContext
            id="active-section"
            items={active.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <DroppableContainer id="active-section" className="flex flex-col">
              <div className="flex flex-col gap-0 md:gap-2 md:contents rounded-xl border border-border/40 md:border-0 overflow-hidden">
                {active.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
              </div>
            </DroppableContainer>
          </SortableContext>
        </section>
      )}

      {/* 3. Evening Section (Sortable) */}
      {!groups && (
        <section
          className={cn(
            "transition-all duration-300",
            evening.length === 0 && "opacity-20 hover:opacity-100",
          )}
        >
          <SectionHeader
            title="This Evening"
            count={evening.length > 0 ? evening.length : undefined}
            icon="🌙"
          />
          <SortableContext
            id="evening-section"
            items={evening.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <DroppableContainer id="evening-section" className="flex flex-col">
              <div className="flex flex-col gap-0 md:gap-2 md:contents rounded-xl border border-border/40 md:border-0 overflow-hidden">
                {evening.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onSelect={handleTaskClick}
                    isKeyboardSelected={task.id === keyboardSelectedId}
                  />
                ))}
                {evening.length === 0 && (
                  <div className="h-12 flex items-center justify-center border-2 border-dashed border-primary/10 rounded-2xl mx-1">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                      Drop here for evening
                    </span>
                  </div>
                )}
              </div>
            </DroppableContainer>
          </SortableContext>
        </section>
      )}

      {/* 4. Completed Section (Static) */}
      {completed.length > 0 && (
        <section className="mt-4">
          <SectionHeader
            title="Completed"
            count={completed.length}
            variant="muted"
          />
          <div className="flex flex-col gap-0 md:gap-2 md:contents rounded-xl border border-border/40 md:border-0 overflow-hidden opacity-60">
            {completed.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={handleTaskClick}
                isKeyboardSelected={task.id === keyboardSelectedId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
