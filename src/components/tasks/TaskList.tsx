'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Reorder, AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import TaskSheet from '@/components/tasks/TaskSheet';
import { useTasks } from '@/lib/hooks/useTasks';
import { useReorderTasks } from '@/lib/hooks/useTaskMutations';
import { useRealtimeSync } from '@/lib/hooks/useRealtimeSync';
import type { Task } from '@/lib/types/task';

interface TaskListProps {
  showCompleted?: boolean;
}

export default function TaskList({ showCompleted = false }: TaskListProps) {
  const { data: tasks, isLoading, error } = useTasks({ showCompleted });
  const reorderMutation = useReorderTasks();
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Enable realtime sync
  useRealtimeSync();

  // Sync local state with fetched data
  useEffect(() => {
    if (tasks) {
      setOrderedTasks(tasks);
    }
  }, [tasks]);

  const handleReorder = (newOrder: Task[]) => {
    setOrderedTasks(newOrder);
  };

  const handleDragEnd = () => {
    const orderedIds = orderedTasks.map((t) => t.id);
    reorderMutation.mutate(orderedIds);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading tasks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading tasks</Typography>
      </Box>
    );
  }

  if (!orderedTasks || orderedTasks.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          opacity: 0.7,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </Box>
        <Typography variant="h6" color="text.secondary">
          No tasks yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tap the + button to add your first task
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ px: 2, py: 1 }}>
        <Reorder.Group
          axis="y"
          values={orderedTasks}
          onReorder={handleReorder}
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          <AnimatePresence mode="popLayout">
            {orderedTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={setEditingTask} 
                onDragEnd={handleDragEnd}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </Box>

      <TaskSheet
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        initialTask={editingTask}
      />
    </>
  );
}
