'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useTaskMutations';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Calendar, Flag, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types/task';
import SubtaskList from './SubtaskList';
import { Button } from '@/components/ui/button';
import { useProject } from '@/lib/hooks/useProjects';

interface TaskItemProps {
  task: Task;
  onClick?: () => void;
}

// Mobile-optimized threshold: require 40% of typical mobile screen width (~150px on small devices)
const SWIPE_THRESHOLD = 150;

const priorityColors: Record<1 | 2 | 3 | 4, string> = {
  1: 'text-red-500 border-red-500',
  2: 'text-orange-500 border-orange-500',
  3: 'text-blue-500 border-blue-500',
  4: 'text-muted-foreground border-muted-foreground/50',
};

function formatDueDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
}

function TaskItem({ task, onClick }: TaskItemProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: project } = useProject(task.project_id);

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0],
    ['hsl(0 62.8% 30.6%)', 'transparent']
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

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < -SWIPE_THRESHOLD) {
      setPendingDelete(true);
      setShowDeleteDialog(true);
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

  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));

  return (
    <div className="group/item">
      <motion.div
        style={{ background }}
        className="relative rounded-xl overflow-hidden"
      >
        {/* Delete indicator - only visible during drag */}
        {isDragging && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
        )}

        {/* Main content */}
        <motion.div
          style={{ x }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.2, right: 0 }}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            'relative flex items-start gap-3 p-3 rounded-xl border bg-secondary/50 cursor-pointer transition-colors hover:bg-secondary/70',
            isChecking && 'opacity-50'
          )}
          onClick={(e) => {
            // Only trigger onClick if we're not dragging
            if (!isDragging && onClick) {
              onClick();
            }
          }}
        >
          {/* Checkbox */}
          <div
            className="pt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={handleComplete}
              className={cn(
                'h-5 w-5 rounded-full',
                priorityColors[task.priority]
              )}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1">
              <p
                className={cn(
                  'text-sm font-medium leading-tight flex-1',
                  task.is_completed && 'line-through text-muted-foreground'
                )}
              >
                {task.content}
              </p>
              
              {/* Expand Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className="h-5 w-5 -mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            {/* Metadata row */}
            {(task.due_date || task.priority < 4 || project) && (
              <div className="flex items-center gap-2 mt-1.5">
                {task.due_date && (
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDueDate(task.due_date)}
                  </span>
                )}
                {task.priority < 4 && (
                  <span className={cn('flex items-center gap-1 text-xs', priorityColors[task.priority])}>
                    <Flag className="h-3 w-3" />
                    P{task.priority}
                  </span>
                )}
                {project && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Expanded Subtasks */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="ml-11 mr-1 mt-2 mb-4 border-l-2 border-muted pl-4"
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
