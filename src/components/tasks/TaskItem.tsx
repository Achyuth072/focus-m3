"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { useUpdateTask, useDeleteTask } from "@/lib/hooks/useTaskMutations";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import {
  Calendar,
  Flag,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types/task";
import SubtaskList from "./SubtaskList";
import { Button } from "@/components/ui/button";
import { useProject } from "@/lib/hooks/useProjects";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { TaskDatePicker } from "./shared/TaskDatePicker";

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
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

function TaskItem({ task, onClick }: TaskItemProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: project } = useProject(task.project_id);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-SWIPE_THRESHOLD, -50, 0, 50, SCHEDULE_SWIPE_THRESHOLD],
    ["hsl(0 84.2% 60.2%)", "hsl(0 84.2% 60.2% / 0.3)", "transparent", "hsl(221.2 83.2% 53.3% / 0.3)", "hsl(221.2 83.2% 53.3%)"]
  );

  const handleComplete = (checked: boolean) => {
    setIsChecking(true);
    updateMutation.mutate(
      { id: task.id, is_completed: checked },
      {
        onSettled: () => setIsChecking(false),
      }
    );
  };

  const handleDateChange = (newDate: Date | undefined) => {
    updateMutation.mutate({
      id: task.id,
      due_date: newDate ? newDate.toISOString() : null,
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    if (info.offset.x < -SWIPE_THRESHOLD) {
      // Left swipe: Delete
      setPendingDelete(true);
      setShowDeleteDialog(true);
    } else if (info.offset.x > SCHEDULE_SWIPE_THRESHOLD) {
      // Right swipe: Schedule
      setDatePickerOpen(true);
    }
    // Reset position
    x.set(0);
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
            isDesktop ? "rounded-sm" : "rounded-xl mx-2 mb-2 overflow-hidden"
          )}
        >
        {/* Swipe indicators - only visible during drag */}
        {isDragging && (
          <>
            {/* Delete indicator (left swipe) */}
            <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 text-white">
              <Trash2 className="h-5 w-5" />
            </div>
            {/* Schedule indicator (right swipe) */}
            <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 text-white">
              <Calendar className="h-5 w-5" />
            </div>
          </>
        )}

        {/* Main content */}
        <motion.div
          style={{ x }}
          drag={isDesktop ? undefined : "x"}
          dragConstraints={{ left: -SWIPE_THRESHOLD * 1.2, right: SCHEDULE_SWIPE_THRESHOLD * 1.2 }}
          dragElastic={{ left: 0.2, right: 0.2 }}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative flex group items-center transition-colors bg-background cursor-pointer",
            isDesktop
              ? "gap-2 px-2 py-1 h-8 rounded-sm hover:bg-secondary/40 dark:hover:bg-secondary/60 transition-all"
              : "items-center gap-3 py-3 px-3 rounded-xl active:bg-secondary/20", // Floating Squircle Row
            isChecking && "opacity-50"
          )}
          onClick={(e) => {
            // Only trigger onClick if we're not dragging
            if (!isDragging && onClick) {
              onClick();
            }
          }}
        >
          {/* Desktop Drag Handle */}
          {isDesktop && (
            <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-opacity">
              <GripVertical className="h-4 w-4" />
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
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex flex-1 gap-2",
                isDesktop ? "items-center" : "items-start"
              )}
            >
              <p
                className={cn(
                  "font-medium leading-tight truncate",
                  isDesktop ? "text-sm" : "text-sm",
                  task.is_completed && "line-through text-muted-foreground"
                )}
              >
                {task.content}
              </p>

              {/* Metadata row */}
              {(task.due_date || task.priority < 4 || project) && (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isDesktop ? "shrink-0 ml-auto" : "mt-1.5"
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
                        "flex items-center gap-1 text-xs",
                        isOverdue ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {!isDesktop && <Calendar className="h-3 w-3" />}
                      {formatDueDate(task.due_date)}
                    </span>
                  )}
                  {task.priority < 4 && (
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        priorityColors[task.priority]
                      )}
                    >
                      {!isDesktop && <Flag className="h-3 w-3" />}P
                      {task.priority}
                    </span>
                  )}
                  {project && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate max-w-[80px]">
                        {project.name}
                      </span>
                    </span>
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
          </div>
        </motion.div>
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

      {/* Date Picker for Schedule Swipe - Hidden trigger, Mobile only */}
      {!isDesktop && (
        <div className="hidden">
          <TaskDatePicker
            date={task.due_date ? parseISO(task.due_date) : undefined}
            setDate={handleDateChange}
            isMobile={true}
            open={datePickerOpen}
            onOpenChange={setDatePickerOpen}
            variant="compact"
          />
        </div>
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
