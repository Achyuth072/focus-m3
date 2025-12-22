'use client';

import { useState } from 'react';
import { Box, Card, Checkbox, Typography, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, FormControlLabel } from '@mui/material';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useToggleTask, useDeleteTask } from '@/lib/hooks/useTaskMutations';
import type { Task } from '@/lib/types/task';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const DragIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const PRIORITY_COLORS = {
  1: '#F2B8B5', // High - Error color
  2: '#FFB74D', // Medium - Orange
  3: '#81C784', // Low - Green
  4: 'transparent', // None
};

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [neverAskAgain, setNeverAskAgain] = useState(false);
  
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0],
    ['rgba(242, 184, 181, 0.3)', 'transparent']
  );
  const deleteOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);

  const handleToggle = () => {
    toggleMutation.mutate({ id: task.id, is_completed: !task.is_completed });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const skipConfirm = localStorage.getItem('skipDeleteConfirm') === 'true';
    if (skipConfirm) {
      deleteMutation.mutate(task.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (neverAskAgain) {
      localStorage.setItem('skipDeleteConfirm', 'true');
    }
    deleteMutation.mutate(task.id);
    setShowDeleteConfirm(false);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -100) {
      const skipConfirm = localStorage.getItem('skipDeleteConfirm') === 'true';
      if (skipConfirm) {
        deleteMutation.mutate(task.id);
      } else {
        setShowDeleteConfirm(true);
      }
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !task.is_completed;

  return (
    <Box sx={{ position: 'relative', mb: 1.5 }}>
      {/* Delete background */}
      <motion.div
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: deleteOpacity,
          color: '#F2B8B5',
        }}
      >
        <DeleteIcon />
      </motion.div>

      <motion.div
        style={{ x, background }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        <Card
          component={motion.div}
          onClick={() => onEdit?.(task)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            gap: 1,
            cursor: 'grab',
            borderLeft: '4px solid',
            borderLeftColor: PRIORITY_COLORS[task.priority],
            '&:active': { cursor: 'grabbing' },
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          {/* Drag handle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              touchAction: 'none',
              color: 'text.secondary',
            }}
          >
            <DragIcon />
          </Box>

          {/* Checkbox */}
          <Checkbox
            checked={task.is_completed}
            onClick={(e) => {
               e.stopPropagation();
               handleToggle();
            }}
            onChange={() => {}}
            sx={{
              color: 'text.secondary',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                textDecoration: task.is_completed ? 'line-through' : 'none',
                opacity: task.is_completed ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {task.content}
            </Typography>

            {/* Due date chip */}
            {task.due_date && (
              <Chip
                label={formatDueDate(task.due_date)}
                size="small"
                sx={{
                  mt: 0.5,
                  px: 1,
                  height: 24,
                  fontSize: '11px',
                  bgcolor: isOverdue ? 'rgba(242, 184, 181, 0.2)' : 'rgba(208, 188, 255, 0.12)',
                  color: isOverdue ? 'error.main' : 'primary.main',
                }}
              />
            )}
          </Box>

          {/* Delete button (for non-touch) */}
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            sx={{
              opacity: 0.4,
              '&:hover': { opacity: 1, color: 'error.main' },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        PaperProps={{
          sx: { borderRadius: '28px', p: 1 }
        }}
      >
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete "{task.content.substring(0, 30)}{task.content.length > 30 ? '...' : ''}".
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={neverAskAgain}
                onChange={(e) => setNeverAskAgain(e.target.checked)}
                size="small"
              />
            }
            label="Don't ask again"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDeleteConfirm(false)} sx={{ borderRadius: '20px' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: '20px' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
