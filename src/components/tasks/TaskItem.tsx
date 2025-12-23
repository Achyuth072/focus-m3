'use client';

import { useState } from 'react';
import { Box, Card, Checkbox, Typography, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, FormControlLabel, Collapse } from '@mui/material';
import { motion, useMotionValue, useTransform, PanInfo, Reorder, useDragControls } from 'framer-motion';
import { useToggleTask, useDeleteTask } from '@/lib/hooks/useTaskMutations';
import { useTimer } from '@/components/TimerProvider';
import type { Task } from '@/lib/types/task';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

import SubtaskList from './SubtaskList';

const PRIORITY_COLORS = {
  1: '#F2B8B5', // High - Error color
  2: '#FFB74D', // Medium - Orange
  3: '#81C784', // Low - Green
  4: 'transparent', // None
};

interface TaskItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDragEnd?: () => void;
}

export default function TaskItem({ task, onEdit, onDragEnd }: TaskItemProps) {
  const dragControls = useDragControls();
  const toggleMutation = useToggleTask();
  const deleteMutation = useDeleteTask();
  const { start: startTimer, state: timerState } = useTimer();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [neverAskAgain, setNeverAskAgain] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isTimerActiveForTask = timerState.activeTaskId === task.id && timerState.isRunning;
  
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
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      style={{ listStyle: 'none' }}
    >
      <Box sx={{ position: 'relative', mb: 1.5 }}>
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
          <DeleteRoundedIcon />
        </motion.div>

        <motion.div
          style={{ x, background }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={handleDragEnd}
        >
          <Card
            component={motion.div}
            onClick={() => onEdit?.(task)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: { xs: 1.5, md: 1.5 },
              gap: { xs: 1, md: 1 },
              cursor: 'default',
              borderLeft: '4px solid',
              borderLeftColor: PRIORITY_COLORS[task.priority],
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: { xs: '28px', md: '16px' },
              '&:hover': { 
                bgcolor: 'action.hover',
                transform: 'scale(1.01)',
              }
            }}
          >
            <Box
              onPointerDown={(e) => dragControls.start(e)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                touchAction: 'none',
                color: 'text.secondary',
                cursor: 'grab',
                p: 0.5,
                borderRadius: '8px',
                '&:active': { cursor: 'grabbing' },
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <DragIndicatorRoundedIcon sx={{ fontSize: '20px', opacity: 0.5 }} />
            </Box>

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
                  fontWeight: 500,
                  fontSize: '1rem',
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
                    fontWeight: 600,
                    borderRadius: '12px',
                    bgcolor: isOverdue ? 'rgba(242, 184, 181, 0.2)' : 'rgba(208, 188, 255, 0.12)',
                    color: isOverdue ? 'error.main' : 'primary.main',
                  }}
                />
              )}
            </Box>

            {/* Play timer button */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                startTimer(task.id);
              }}
              sx={{
                opacity: isTimerActiveForTask ? 1 : 0.4,
                color: isTimerActiveForTask ? 'primary.main' : 'inherit',
                '&:hover': { opacity: 1, color: 'primary.main' },
              }}
            >
              {isTimerActiveForTask ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            </IconButton>

            {/* Delete button (for non-touch) */}
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              sx={{
                opacity: 0.4,
                '&:hover': { opacity: 1, color: 'error.main' },
              }}
            >
              <DeleteRoundedIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            {/* Expand Subtasks Toggle */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              sx={{
                transition: 'transform 0.2s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.4,
                '&:hover': { opacity: 1 },
              }}
            >
              <ExpandMoreRoundedIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Card>

          {/* Inline Subtasks */}
          <Collapse in={isExpanded} unmountOnExit>
            <Box
              sx={{
                pl: { xs: 4, md: 6 },
                pr: 2,
                py: 1.5,
                borderLeft: '2px solid',
                borderColor: 'divider',
                ml: 3,
              }}
            >
              <SubtaskList parentTask={task} />
            </Box>
          </Collapse>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          PaperProps={{
            sx: { 
              borderRadius: { xs: '28px', md: '16px' }, 
              p: 1,
              minWidth: 300,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>Delete task?</DialogTitle>
          <DialogContent sx={{ px: 3, pb: 1 }}>
            <DialogContentText sx={{ fontSize: '0.9rem' }}>
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
              sx={{ mt: 1.5 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
            <Button 
              onClick={() => setShowDeleteConfirm(false)} 
              sx={{ borderRadius: '28px', px: 3, py: 1, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              sx={{ borderRadius: '28px', px: 3, py: 1, fontWeight: 600, boxShadow: 'none' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Reorder.Item>
  );
}
