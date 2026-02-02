"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
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
}

// Mobile-optimized threshold: require 40% of typical mobile screen width (~150px on small devices)
const SWIPE_THRESHOLD = 150;
const SCHEDULE_SWIPE_THRESHOLD = 100; // Slightly easier threshold for schedule

function TaskItem({
  task,
  onSelect,
  dragListeners,
  dragAttributes,
  isDragging = false,
  isKeyboardSelected = false,
  viewMode = "list",
}: TaskItemProps) {
  const [_isChecking, setIsChecking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-SWIPE_THRESHOLD, -50, 0, 50, SCHEDULE_SWIPE_THRESHOLD],
    [
      "hsl(0 84.2% 60.2%)",
      "hsl(0 84.2% 60.2% / 0.3)",
      "transparent",
      "hsl(142 76% 36% / 0.3)",
      "hsl(142 76% 36%)",
    ],
  );

  const handleComplete = (checked: boolean) => {
    trigger(checked ? [10, 50] : 15); // Double tick/thud for completion, light for uncheck
    setIsChecking(true);
    toggleMutation.mutate(
      { id: task.id, is_completed: checked },
      {
        onSettled: () => setIsChecking(false),
      },
    );
  };

  const handleDragStart = () => {
    setIsSwipeDragging(true);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsSwipeDragging(false);
    if (info.offset.x < -SWIPE_THRESHOLD) {
      // Left swipe: Delete
      trigger(50);
      setPendingDelete(true);
      setShowDeleteDialog(true);
    } else if (info.offset.x > SCHEDULE_SWIPE_THRESHOLD) {
      // Right swipe: Edit
      trigger(50);
      if (onSelect) {
        onSelect(task);
      }
    }
    // Snap back is handled by dragSnapToOrigin
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

  return (
    <div
      className={cn(
        "group/item",
        isDesktop && "hover:ring-1 hover:ring-border transition-all rounded-md",
        isDesktop && isExpanded && "pb-4",
      )}
    >
      <motion.div
        style={{ background }}
        className={cn("relative", isDesktop ? "rounded-md" : "overflow-hidden")}
      >
        {/* Swipe indicators - only visible during drag */}
        {isSwipeDragging && (
          <>
            <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 text-white">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 text-white">
              <Pencil className="h-5 w-5" />
            </div>
          </>
        )}

        {/* Main content */}
        <motion.div
          style={{ x }}
          drag={isDesktop || isDragging || viewMode === "board" ? false : "x"} // Disable swipe during drag or in board view
          dragDirectionLock
          dragConstraints={{
            left: -SWIPE_THRESHOLD * 1.2,
            right: SCHEDULE_SWIPE_THRESHOLD * 1.2,
          }}
          dragElastic={{ left: 0.2, right: 0.2 }}
          dragMomentum={false}
          dragSnapToOrigin={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative flex group items-center bg-background cursor-pointer",
            isDesktop
              ? "gap-2 px-2 py-3 rounded-md hover:bg-secondary/50 transition-seijaku"
              : viewMode === "board"
                ? "px-4 py-3.5 rounded-xl border border-border/80 hover:border-border hover:bg-secondary/20 transition-all"
                : "items-center gap-3 py-3.5 px-4 active:bg-secondary/20 transition-seijaku-fast",
            isKeyboardSelected && "ring-2 ring-primary bg-secondary/40 z-10",
          )}
          onClick={() => {
            if (!isSwipeDragging && onSelect) {
              onSelect(task);
            }
          }}
        >
          {viewMode === "board" ? (
            <TaskBoardCard
              task={task}
              project={
                project
                  ? { color: project.color, name: project.name }
                  : undefined
              }
              isOverdue={isOverdue}
              isDesktop={isDesktop}
              handleComplete={handleComplete}
              handlePlayFocus={handlePlayFocus}
              dragListeners={dragListeners}
              dragAttributes={dragAttributes}
            />
          ) : (
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
                project
                  ? { color: project.color, name: project.name }
                  : undefined
              }
              isOverdue={isOverdue}
              dragListeners={dragListeners}
              dragAttributes={dragAttributes}
            />
          )}
        </motion.div>

        {/* Indented Separator (Mobile only) */}
        {!isDesktop && (
          <div className="absolute bottom-0 left-[44px] right-0 h-[1px] bg-border" />
        )}
      </motion.div>

      {/* Expanded Subtasks */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="ml-11 mr-1 mt-2 border-l-2 border-muted pl-4"
        >
          <SubtaskList taskId={task.id} projectId={task.project_id} />
        </motion.div>
      )}

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
