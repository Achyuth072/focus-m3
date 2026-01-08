'use client';

import React, { useState } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { format, isToday, isYesterday, parseISO, startOfWeek, isAfter } from 'date-fns';
import { CheckCircle2, Clock, Trash2, Search } from 'lucide-react';

import type { Task } from '@/lib/types/task';
import { useUpdateTask, useClearCompletedTasks } from '@/lib/hooks/useTaskMutations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { Input } from '@/components/ui/input';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useBackNavigation } from '@/lib/hooks/useBackNavigation';

interface CompletedTasksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CompletedTaskItem({ task }: { task: Task }) {
  const updateMutation = useUpdateTask();
  const { trigger } = useHaptic();

  const handleUncomplete = () => {
    trigger(20);
    updateMutation.mutate({ id: task.id, is_completed: false });
  };

  const completedDate = task.completed_at ? parseISO(task.completed_at) : null;
  const formattedDate = completedDate ? format(completedDate, 'h:mm a') : '';

  return (
    <div className="flex items-start gap-3 py-2 md:py-2 px-4 border-b border-border/40 hover:bg-secondary/30 transition-colors group min-h-[44px]">
      <button
        onClick={handleUncomplete}
        className="pt-0.5 text-green-500 hover:text-green-600 transition-colors"
        title="Mark as incomplete"
      >
        <CheckCircle2 className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight line-through text-muted-foreground">
          {task.content}
        </p>
        {completedDate && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </div>
        )}
      </div>
    </div>
  );
}

function groupTasksByDate(tasks: Task[]) {
  const today: Task[] = [];
  const yesterday: Task[] = [];
  const thisWeek: Task[] = [];
  const older: Task[] = [];

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

  tasks.forEach((task) => {
    if (!task.completed_at) {
      older.push(task);
      return;
    }

    const completedDate = parseISO(task.completed_at);

    if (isToday(completedDate)) {
      today.push(task);
    } else if (isYesterday(completedDate)) {
      yesterday.push(task);
    } else if (isAfter(completedDate, weekStart)) {
      thisWeek.push(task);
    } else {
      older.push(task);
    }
  });

  return { today, yesterday, thisWeek, older };
}

function TaskGroup({ title, tasks }: { title: string; tasks: Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-0">
      <h3 className="type-micro font-semibold uppercase px-6 py-3 border-b border-border/40">
        {title}
      </h3>
      <div className="space-y-0">
        {tasks.map((task) => (
          <CompletedTaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export function CompletedTasksSheet({ open, onOpenChange }: CompletedTasksSheetProps) {
  const { data: tasks = [], isLoading } = useTasks({ showCompleted: true });
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const clearMutation = useClearCompletedTasks();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { trigger } = useHaptic();

  // Handle back navigation on mobile to close drawer instead of navigating away
  // Handle back navigation on mobile to close drawer instead of navigating away
  useBackNavigation(open && !isDesktop, () => onOpenChange(false));

  const completedTasks = tasks.filter((task) => task.is_completed);
  
  const filteredCompletedTasks = completedTasks.filter((task) => 
    task.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { today, yesterday, thisWeek, older } = groupTasksByDate(filteredCompletedTasks);

  const isSearching = searchQuery.length > 0;
  const hasResults = filteredCompletedTasks.length > 0;

  const handleClearHistory = () => {
    // Close dialogs immediately for instant feedback
    setShowClearDialog(false);
    onOpenChange(false);
    
    // Execute the mutation (optimistic update handled in the hook)
    clearMutation.mutate();
  };

  const content = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : completedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <CheckCircle2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Completed Tasks</h2>
          <p className="text-muted-foreground max-w-md">
            Tasks you complete will appear here. Start checking off items from your task list!
          </p>
        </div>
      ) : !hasResults && isSearching ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium mb-1">No tasks found</h2>
          <p className="text-sm text-muted-foreground">
            Try searching for something else
          </p>
        </div>
      ) : (
        <div className="space-y-0 pb-8">
          <TaskGroup title="Today" tasks={today} />
          <TaskGroup title="Yesterday" tasks={yesterday} />
          <TaskGroup title="This Week" tasks={thisWeek} />
          <TaskGroup title="Older" tasks={older} />
        </div>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden border-border bg-background">
          <DialogHeader className="flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2 cursor-default">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="type-h2">Logbook</span>
            </DialogTitle>
            <div className="flex items-center gap-2 pr-8">
              {completedTasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    trigger(50);
                    setShowClearDialog(true);
                  }}
                  className="h-8 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-seijaku-fast rounded-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs">Clear History</span>
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {completedTasks.length > 0 && (
            <div className="px-6 py-3 border-b border-border/40 bg-secondary/5">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <Input
                  className="pl-9 bg-secondary/20 border-border/40 focus:border-border/60 focus:bg-secondary/30 h-9 text-sm transition-all placeholder:text-muted-foreground/40"
                  placeholder="Search completed tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto flex-1">
            {content}
          </div>
        </DialogContent>

        <DeleteConfirmationDialog
          isOpen={showClearDialog}
          onClose={() => setShowClearDialog(false)}
          onConfirm={handleClearHistory}
          title="Clear History"
          description="Are you sure you want to delete all completed tasks? This action cannot be undone and will remove these tasks from your statistics."
        />
      </Dialog>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <div className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
            <DrawerTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="type-h2">Logbook</span>
            </DrawerTitle>
            <div className="flex items-center gap-2">
              {completedTasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground active:bg-destructive/10 active:text-destructive active:scale-95 transition-seijaku-fast rounded-md"
                  onClick={() => {
                    trigger(50);
                    setShowClearDialog(true);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {completedTasks.length > 0 && (
            <div className="px-6 py-4 border-b border-border/40 bg-secondary/5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                <Input
                  className="pl-11 bg-secondary/20 h-12 text-base shadow-none border-border/30 focus:border-border/60 focus:bg-secondary/30 rounded-xl transition-all"
                  placeholder="Search completed tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto flex-1">
            {content}
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteConfirmationDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearHistory}
        title="Clear History"
        description="Are you sure you want to delete all completed tasks? This action cannot be undone and will remove these tasks from your statistics."
      />
    </>
  );
}
