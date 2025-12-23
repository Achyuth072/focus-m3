'use client';

import { useState } from 'react';
import {
  Box,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubtasks } from '@/lib/hooks/useSubtasks';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/useTaskMutations';
import type { Task } from '@/lib/types/task';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface SubtaskListProps {
  parentTask: Task;
}

export default function SubtaskList({ parentTask }: SubtaskListProps) {
  const { data: subtasks, isLoading } = useSubtasks(parentTask.id);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const [newSubtaskContent, setNewSubtaskContent] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskContent.trim()) return;
    createMutation.mutate({
      content: newSubtaskContent.trim(),
      parent_id: parentTask.id,
      project_id: parentTask.project_id ?? undefined,
      priority: 4,
    });
    setNewSubtaskContent('');
  };

  const handleToggleComplete = (subtask: Task) => {
    updateMutation.mutate({
      id: subtask.id,
      is_completed: !subtask.is_completed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
        Subtasks
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List dense disablePadding>
          <AnimatePresence mode="popLayout">
            {subtasks?.map((subtask) => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ListItem
                  disablePadding
                  sx={{
                    py: 0.5,
                    opacity: subtask.is_completed ? 0.6 : 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      checked={subtask.is_completed}
                      onChange={() => handleToggleComplete(subtask)}
                      size="small"
                      sx={{ p: 0.5 }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={subtask.content}
                    primaryTypographyProps={{
                      sx: {
                        textDecoration: subtask.is_completed ? 'line-through' : 'none',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}

      {/* Add Subtask Input */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="Add subtask..."
          value={newSubtaskContent}
          onChange={(e) => setNewSubtaskContent(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              fontSize: '0.875rem',
            },
          }}
        />
        <IconButton
          onClick={handleAddSubtask}
          disabled={!newSubtaskContent.trim() || createMutation.isPending}
          size="small"
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: '12px',
            width: 40,
            height: 40,
            '&:hover': { bgcolor: 'primary.dark' } 
          }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
