'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
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
      <DialogContent className="w-[calc(100%-32px)] sm:max-w-[560px] gap-0 rounded-lg">
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
          className="min-h-[150px] md:min-h-[100px] text-base font-medium resize-none border-none shadow-none focus-visible:ring-0 p-0"
        />

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-4 border-t mt-4">
          <div className="flex items-center gap-2">
            {/* Date & Time Picker */}
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
                  {dueDate ? format(dueDate, 'MMM d, h:mm a') : 'Due Date'}
                  {dueDate && (
                    <span
                      role="button"
                      title="Clear due date"
                      className="ml-1 p-0.5 rounded hover:bg-destructive/20"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDueDate(undefined);
                      }}
                    >
                      <X className="h-3 w-3 hover:text-destructive" />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0" 
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    if (!date) {
                      setDueDate(undefined);
                      return;
                    }
                    const newDate = new Date(date);
                    if (dueDate) {
                      newDate.setHours(dueDate.getHours());
                      newDate.setMinutes(dueDate.getMinutes());
                    } else {
                      newDate.setHours(12, 0, 0, 0);
                    }
                    setDueDate(newDate);
                  }}
                  captionLayout="dropdown"
                  fromYear={new Date().getFullYear() - 1}
                  toYear={new Date().getFullYear() + 5}
                  initialFocus
                  className="p-3"
                  classNames={{
                    months: 'flex flex-col',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'hidden',
                    caption_dropdowns: 'flex justify-center gap-1.5',
                    dropdown: 'h-7 rounded-md bg-transparent px-2 py-1 text-sm font-medium text-foreground hover:bg-accent/50 focus:outline-none focus:bg-accent cursor-pointer border-0',
                    dropdown_month: 'w-[100px]',
                    dropdown_year: 'w-[70px]',
                    nav: 'space-x-1 flex items-center',
                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center',
                    row: 'flex w-full mt-2',
                    cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
                    day: cn(
                      'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md',
                      'hover:bg-accent hover:text-accent-foreground'
                    ),
                    day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    day_hidden: 'invisible',
                  }}
                />
                <TimePicker
                  value={dueDate || new Date(new Date().setHours(12, 0, 0, 0))}
                  onChange={setDueDate}
                  showSelection={!!dueDate}
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
