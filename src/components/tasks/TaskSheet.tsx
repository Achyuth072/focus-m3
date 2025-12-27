'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useTaskMutations';
import { useInboxProject } from '@/lib/hooks/useTasks';
import { Calendar as CalendarIcon, Flag, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types/task';

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  initialDate?: Date | null;
}

const priorities: { value: 1 | 2 | 3 | 4; label: string; color: string }[] = [
  { value: 1, label: 'P1', color: 'bg-red-500 text-white hover:bg-red-600' },
  { value: 2, label: 'P2', color: 'bg-orange-500 text-white hover:bg-orange-600' },
  { value: 3, label: 'P3', color: 'bg-blue-500 text-white hover:bg-blue-600' },
  { value: 4, label: 'P4', color: 'bg-muted text-muted-foreground hover:bg-muted/80' },
];

export default function TaskSheet({ open, onClose, initialTask, initialDate }: TaskSheetProps) {
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(4);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const { data: inboxProject } = useInboxProject();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialTask) {
        setContent(initialTask.content);
        setDueDate(initialTask.due_date ? new Date(initialTask.due_date) : undefined);
        setPriority(initialTask.priority);
      } else {
        setContent('');
        setDueDate(initialDate ?? undefined);
        setPriority(4);
      }
    }
  }, [open, initialTask, initialDate]);

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    onClose();

    if (initialTask) {
      updateMutation.mutate({
        id: initialTask.id,
        content: trimmedContent,
        due_date: dueDate?.toISOString() ?? null,
        priority,
      });
    } else {
      createMutation.mutate({
        content: trimmedContent,
        project_id: inboxProject?.id,
        due_date: dueDate?.toISOString(),
        priority,
      });
    }
  };

  const handleDelete = () => {
    if (!initialTask) return;
    onClose();
    deleteMutation.mutate(initialTask.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') onClose();
  };

  const hasContent = content.trim().length > 0;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle>{initialTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        {/* Content Input */}
        <Textarea
          autoFocus
          placeholder="What needs to be done?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[100px] text-base font-medium resize-none border-none shadow-none focus-visible:ring-0 p-0"
        />

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t mt-4">
          <div className="flex items-center gap-2">
            {/* Date Picker */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 gap-1.5',
                    dueDate && 'text-primary'
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dueDate ? format(dueDate, 'MMM d') : 'Due Date'}
                  {dueDate && (
                    <X
                      className="h-3 w-3 ml-1 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDueDate(undefined);
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Priority Selector */}
            <div className="flex items-center gap-1">
              {priorities.map((p) => (
                <Button
                  key={p.value}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0 text-xs font-semibold',
                    priority === p.value ? p.color : 'bg-transparent text-muted-foreground'
                  )}
                  onClick={() => setPriority(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Delete Button (only for existing tasks) */}
            {initialTask && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Submit Button */}
            <Button
              size="sm"
              className="h-8"
              onClick={handleSubmit}
              disabled={!hasContent || isPending}
            >
              {isPending ? 'Saving...' : initialTask ? 'Save' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
