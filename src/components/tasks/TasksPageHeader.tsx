'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';

export function TasksPageHeader() {
  const { openSheet } = useCompletedTasks();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openSheet}
      className="hidden md:flex items-center gap-2"
    >
      <CheckCircle2 className="h-4 w-4" />
      Completed
    </Button>
  );
}
