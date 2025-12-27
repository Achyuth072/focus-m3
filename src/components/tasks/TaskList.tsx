'use client';

import { useState } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import TaskItem from './TaskItem';
import TaskSheet from './TaskSheet';
import type { Task } from '@/lib/types/task';

export default function TaskList() {
  const { data: tasks, isLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Separate active and completed tasks
  const activeTasks = tasks?.filter((t) => !t.is_completed) ?? [];
  const completedTasks = tasks?.filter((t) => t.is_completed) ?? [];

  if (activeTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-muted-foreground">
          No tasks yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 md:px-6 space-y-2">
        {/* Active Tasks */}
        {activeTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClick={() => setSelectedTask(task)}
          />
        ))}

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Completed ({completedTasks.length})
            </p>
            <div className="space-y-2 opacity-60">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <TaskSheet
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        initialTask={selectedTask}
      />
    </>
  );
}
