"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { useDeleteTask, useToggleTask } from "@/lib/hooks/useTaskMutations";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { isToday, isPast, parseISO } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import SubtaskList from "./SubtaskList";
import { useProject } from "@/lib/hooks/useProjects";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

import { useRouter } from "next/navigation";
import { useTimer } from "@/components/TimerProvider";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { TaskBoardCard } from "./TaskBoardCard";
import { TaskListRow } from "./TaskListRow";

interface TaskItemProps {
  task: Task;
  onSelect?: (task: Task) => void;
  dragListeners?: DraggableSyntheticListeners;
  dragAttributes?: DraggableAttributes;
  isDragging?: boolean;
  isKeyboardSelected?: boolean;
  viewMode?: "list" | "grid" | "board";
  dragActivatorRef?: (element: HTMLElement | null) => void;
}

import { SwipeableTaskContent } from "./SwipeableTaskContent";

function TaskItem({
  task,
  onSelect,
  dragListeners,
  dragAttributes,
  isDragging = false,
  isKeyboardSelected = false,
  viewMode = "list",
  dragActivatorRef,
}: TaskItemProps) {
  const [_isChecking, setIsChecking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHandleActive, setIsHandleActive] = useState(false);

  const deleteMutation = useDeleteTask();
  const toggleMutation = useToggleTask();
  const { data: project } = useProject(task.project_id);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { start } = useTimer();
  const router = useRouter();
  const { trigger } = useHaptic();

  const handlePlayFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    trigger(50);
    start(task.id);
    router.push("/focus");
  };

  const handleComplete = (checked: boolean) => {
    trigger(checked ? [10, 50] : 15);
    setIsChecking(true);
    toggleMutation.mutate(
      { id: task.id, is_completed: checked },
      {
        onSettled: () => setIsChecking(false),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deleteMutation.mutate(task.id);
      setPendingDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(false);
    setShowDeleteDialog(false);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    trigger(15);
    setIsExpanded(!isExpanded);
  };

  const isOverdue =
    Boolean(task.due_date) &&
    isPast(parseISO(task.due_date!)) &&
    !isToday(parseISO(task.due_date!));

  const contentClassName = cn(
    "relative flex group items-center bg-background cursor-pointer",
    isDesktop
      ? "gap-2 px-2 py-3 rounded-md hover:bg-secondary/50 transition-seijaku"
      : viewMode === "board"
        ? "px-4 py-3.5 rounded-xl border border-border/80 hover:border-border hover:bg-secondary/20 transition-all"
        : "items-center gap-3 py-3.5 px-4 active:bg-secondary/20 transition-seijaku-fast",
    isKeyboardSelected && "ring-2 ring-primary bg-secondary/40 z-10",
  );

  return (
    <div
      className={cn(
        "group/item last:[&_.task-separator]:hidden",
        isDesktop &&
          "border border-transparent hover:border-border/60 transition-all rounded-md p-[1px]",
        isDesktop && isExpanded && "pb-4",
      )}
    >
      {viewMode === "board" ? (
        /* Fast path for Board View: No motion hooks or wrappers */
        <div className={contentClassName} onClick={() => onSelect?.(task)}>
          <TaskBoardCard
            task={task}
            project={
              project ? { color: project.color, name: project.name } : undefined
            }
            isOverdue={isOverdue}
            isDesktop={isDesktop}
            handleComplete={handleComplete}
            handlePlayFocus={handlePlayFocus}
            dragListeners={dragListeners}
            dragAttributes={dragAttributes}
            dragActivatorRef={dragActivatorRef}
          />
        </div>
      ) : (
        <SwipeableTaskContent
          isDesktop={isDesktop}
          isDragging={isDragging}
          viewMode={viewMode}
          isHandleActive={isHandleActive}
          onSwipeLeft={() => {
            trigger(50);
            setPendingDelete(true);
            setShowDeleteDialog(true);
          }}
          onSwipeRight={() => {
            trigger(50);
            onSelect?.(task);
          }}
          onSwipeStart={() => setIsSwipeDragging(true)}
          onSwipeEnd={() => setIsSwipeDragging(false)}
          className={contentClassName}
          onClick={() => {
            if (!isSwipeDragging && onSelect) {
              onSelect(task);
            }
          }}
        >
          <TaskListRow
            task={task}
            isDesktop={isDesktop}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            handleComplete={handleComplete}
            handlePlayFocus={handlePlayFocus}
            onDeleteRequest={(e) => {
              e.stopPropagation();
              setPendingDelete(true);
              setShowDeleteDialog(true);
            }}
            project={
              project ? { color: project.color, name: project.name } : undefined
            }
            isOverdue={isOverdue}
            dragListeners={dragListeners}
            dragAttributes={dragAttributes}
            onHandlePointerDown={() => setIsHandleActive(true)}
            onHandlePointerUp={() => setIsHandleActive(false)}
            dragActivatorRef={dragActivatorRef}
          />
          {/* Indented Separator (Mobile only) */}
          {!isDesktop && (
            <div className="task-separator absolute bottom-0 left-[44px] right-0 h-[1px] bg-border/60" />
          )}
        </SwipeableTaskContent>
      )}

      {/* Expanded Subtasks */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              mass: 0.5,
            }}
            className={cn(
              "mr-1 border-l-2 border-brand/30 pl-4 transition-colors overflow-hidden",
              isDesktop ? "ml-10" : "ml-11",
            )}
          >
            <div className="pt-1">
              <SubtaskList taskId={task.id} projectId={task.project_id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.content}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default React.memo(TaskItem);
