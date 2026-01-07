"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { useDeleteTask, useToggleTask } from "@/lib/hooks/useTaskMutations";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import {
  Calendar,
  Flag,
  Trash2,
  Pencil,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Play,
  Moon,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import SubtaskList from "./SubtaskList";
import { Button } from "@/components/ui/button";
import { useProject } from "@/lib/hooks/useProjects";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

import { useRouter } from 'next/navigation';
import { useTimer } from "@/components/TimerProvider";
import { useHaptic } from "@/lib/hooks/useHaptic";

interface TaskItemProps {
  task: Task;
  onSelect?: (task: Task) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragListeners?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragAttributes?: any;
  isDragging?: boolean;
  isKeyboardSelected?: boolean;
}

// Mobile-optimized threshold: require 40% of typical mobile screen width (~150px on small devices)
const SWIPE_THRESHOLD = 150;
const SCHEDULE_SWIPE_THRESHOLD = 100; // Slightly easier threshold for schedule

const priorityColors: Record<1 | 2 | 3 | 4, string> = {
  1: "text-red-500 border-red-500",
  2: "text-orange-500 border-orange-500",
  3: "text-blue-500 border-blue-500",
  4: "text-muted-foreground border-muted-foreground/50",
};

function formatDueDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

function TaskItem({ task, onSelect, dragListeners, dragAttributes, isDragging = false, isKeyboardSelected = false }: TaskItemProps) {
  const [isChecking, setIsChecking] = useState(false);
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
    trigger(30);
    start(task.id);
    router.push('/focus');
  };

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-SWIPE_THRESHOLD, -50, 0, 50, SCHEDULE_SWIPE_THRESHOLD],
    ["hsl(0 84.2% 60.2%)", "hsl(0 84.2% 60.2% / 0.3)", "transparent", "hsl(142 76% 36% / 0.3)", "hsl(142 76% 36%)"]
  );

  const handleComplete = (checked: boolean) => {
    trigger(checked ? [10, 30] : 30); // Double tick for completion
    setIsChecking(true);
    toggleMutation.mutate(
      { id: task.id, is_completed: checked },
      {
        onSettled: () => setIsChecking(false),
      }
    );
  };

  const handleDragStart = () => {
    setIsSwipeDragging(true);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
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
    task.due_date &&
    isPast(parseISO(task.due_date)) &&
    !isToday(parseISO(task.due_date));

  return (
    <div className={cn(
      "group/item",
      isDesktop && "hover:shadow-md dark:hover:ring-1 dark:hover:ring-white/10 transition-shadow rounded-sm",
      isDesktop && isExpanded && "pb-4"
    )}>
        <motion.div
          style={{ background }}
          className={cn(
            "relative",
            isDesktop ? "rounded-sm" : "overflow-hidden" // Mobile: removed rounded-xl/mx-2/mb-2 for separator look
          )}
        >
        {/* Swipe indicators - only visible during drag */}
        {isSwipeDragging && (
          <>
            {/* Delete indicator (left swipe) */}
            <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 text-white">
              <Trash2 className="h-5 w-5" />
            </div>
            {/* Edit indicator (right swipe) */}
            <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 text-white">
              <Pencil className="h-5 w-5" />
            </div>
          </>
        )}

        {/* Main content */}
        <motion.div
          style={{ x }}
          drag={isDesktop || isDragging ? false : "x"} // Disable swipe during drag
          dragDirectionLock
          dragConstraints={{ left: -SWIPE_THRESHOLD * 1.2, right: SCHEDULE_SWIPE_THRESHOLD * 1.2 }}
          dragElastic={{ left: 0.2, right: 0.2 }}
          dragMomentum={false}
          dragSnapToOrigin={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative flex group items-center bg-background cursor-pointer",
            isDesktop
              ? "gap-2 px-2 py-1 h-8 rounded-sm hover:bg-secondary/40 dark:hover:bg-secondary/60 transition-seijaku"
              : "items-center gap-3 py-3 px-4 active:bg-secondary/20 transition-seijaku-fast",
            isKeyboardSelected && "ring-2 ring-primary bg-secondary/40 z-10"
          )}
          onClick={() => {
            // Only trigger onSelect if we're not dragging
            if (!isSwipeDragging && onSelect) {
              onSelect(task);
            }
          }}
        >
          {/* Drag Handle */}
          {isDesktop ? (
            <div 
              {...dragListeners}
              {...dragAttributes}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragListeners?.onPointerDown?.(e);
              }}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-opacity"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          ) : (
            <div 
              {...dragListeners} 
              {...dragAttributes}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragListeners?.onPointerDown?.(e);
              }}
              className="cursor-grab active:cursor-grabbing text-muted-foreground/50 shrink-0"
              style={{ touchAction: 'none' }}
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}
          {/* Checkbox */}
          <div
            className={cn("shrink-0", isDesktop ? "pt-0" : "pt-0.5")}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={handleComplete}
              className={cn(
                priorityColors[task.priority],
                isDesktop ? "h-4 w-4 !rounded-sm" : "h-5 w-5 !rounded-md" // Mobile=8px(40%), Desktop=6px(37%)
              )}
            />
          </div>

          {/* Content */}
          <div className={cn(
            "flex-1 min-w-0",
            isDesktop ? "flex items-center justify-between gap-2" : "flex flex-col gap-0"
          )}>
            <div className="flex items-center gap-2 flex-1">
              <p
                className={cn(
                  "type-body font-medium leading-tight truncate",
                  task.is_completed && "line-through text-muted-foreground"
                )}
              >
                {task.content}
              </p>

            </div>
            
            {/* Metadata row */}
            {(task.due_date || task.priority < 4 || project) && (
              <div
                className={cn(
                  "flex items-center gap-2 flex-wrap",
                  isDesktop ? "shrink-0" : "mt-1 ml-0"
                )}
              >
                  {/* Expand Toggle */}
                  {isDesktop ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleExpand}
                      className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}

                  {task.due_date && (
                    <span
                      className={cn(
                        "type-ui flex items-center gap-1",
                        isOverdue ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {!isDesktop && <Calendar className="h-3 w-3" />}
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                  {task.do_date && (
                    <span className="type-ui flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <CalendarClock className="h-3 w-3" />
                      {isToday(parseISO(task.do_date)) ? "Today" : format(parseISO(task.do_date), "MMM d")}
                    </span>
                  )}
                  {task.is_evening && (
                    <span className="type-ui flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                      <Moon className="h-3 w-3 fill-current" />
                      Evening
                    </span>
                  )}
                  {task.priority < 4 && (
                    <span
                      className={cn(
                        "type-ui flex items-center gap-1",
                        priorityColors[task.priority]
                      )}
                    >
                      {!isDesktop && <Flag className="h-3 w-3" />}P
                      {task.priority}
                    </span>
                  )}
                  {project && (
                    <span className="type-ui flex items-center gap-1.5 text-muted-foreground">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate max-w-[80px]">
                        {project.name}
                      </span>
                    </span>
                  )}

                  {/* Desktop Play Action */}
                  {isDesktop && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePlayFocus}
                      className="h-6 w-6 text-muted-foreground hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Start focus timer"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {/* Desktop Delete Action */}
                  {isDesktop && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Play Action */}
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayFocus}
                className="h-8 w-8 text-muted-foreground hover:text-green-600 transition-colors"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}

            {/* Mobile Expand Toggle - Outside metadata */}
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className="h-5 w-5 -mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
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
