'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogContent, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Reorder, AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import TaskSheet from '@/components/tasks/TaskSheet';
import { useTasks } from '@/lib/hooks/useTasks';
import { useReorderTasks } from '@/lib/hooks/useTaskMutations';
import { useRealtimeSync } from '@/lib/hooks/useRealtimeSync';
import { useCompletedTasks } from '@/components/CompletedTasksProvider';
import type { Task } from '@/lib/types/task';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';

export default function TaskList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: activeTasks, isLoading, error } = useTasks({ showCompleted: false });
  const { data: completedTasks } = useTasks({ showCompleted: true });
  const reorderMutation = useReorderTasks();
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { showCompleted, toggleShowCompleted } = useCompletedTasks();
  
  // Enable realtime sync
  useRealtimeSync();

  // Filter out completed from active list, get completed separately
  const completedOnly = completedTasks?.filter((t) => t.is_completed) || [];

  // Sync local state with fetched data
  useEffect(() => {
    if (activeTasks) {
      setOrderedTasks(activeTasks);
    }
  }, [activeTasks]);

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

  const hasActiveTasks = orderedTasks && orderedTasks.length > 0;
  const hasCompletedTasks = completedOnly.length > 0;

  if (!hasActiveTasks && !hasCompletedTasks) {
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
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <TaskAltRoundedIcon sx={{ fontSize: '48px', color: 'text.secondary', opacity: 0.5 }} />
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
        {/* Active Tasks */}
        {hasActiveTasks && (
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
        )}

        {/* Completed Tasks Trigger */}
        {hasCompletedTasks && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={toggleShowCompleted}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                borderRadius: '28px',
                py: 1,
                fontWeight: 600,
              }}
            >
              Show Completed Tasks ({completedOnly.length})
            </Button>
          </Box>
        )}

        {/* Completed Tasks Dialog */}
        <Dialog
          fullScreen={isMobile}
          maxWidth="sm"
          fullWidth
          open={showCompleted}
          onClose={toggleShowCompleted}
          PaperProps={{
            sx: {
              bgcolor: 'background.default',
              backgroundImage: 'none',
              borderRadius: isMobile ? 0 : '16px',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <IconButton onClick={toggleShowCompleted} edge="start" sx={{ mr: 2 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Completed Tasks
            </Typography>
          </Box>
          <DialogContent sx={{ p: 2 }}>
            <Box sx={{ opacity: 0.8 }}>
              <Reorder.Group
                axis="y"
                values={completedOnly}
                onReorder={() => {}}
                style={{ listStyle: 'none', padding: 0, margin: 0 }}
              >
                {completedOnly.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDragEnd={() => {}}
                  />
                ))}
              </Reorder.Group>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>

      <TaskSheet
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        initialTask={editingTask}
      />
    </>
  );
}
