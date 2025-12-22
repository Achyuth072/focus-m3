'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  TextField,
  Button,
  Chip,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { AnimatePresence, motion } from 'framer-motion';
import { parseTaskInput, formatDueDate } from '@/lib/utils/nlpParser';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/useTaskMutations';
import { useInboxProject } from '@/lib/hooks/useTasks';
import type { Task, ParsedTask } from '@/lib/types/task';
import { format, addDays, startOfDay } from 'date-fns';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
  </svg>
);

const FlagIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
  </svg>
);

const ScheduleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

type Priority = 1 | 2 | 3 | 4;

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  1: { label: 'High', color: '#F2B8B5' },
  2: { label: 'Medium', color: '#FFB74D' },
  3: { label: 'Low', color: '#81C784' },
  4: { label: 'Priority', color: 'text.secondary' },
};

interface TaskSheetProps {
  open: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

export default function TaskSheet({ open, onClose, initialTask }: TaskSheetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { data: inboxProject } = useInboxProject();

  // Initialize from initialTask (Edit Mode)
  useEffect(() => {
    if (open && initialTask) {
      setInput(initialTask.content);
      setPriority(initialTask.priority as Priority);
      setDueDate(initialTask.due_date ? new Date(initialTask.due_date) : null);
    } else if (open && !initialTask) {
      // Reset for Create Mode
      setInput('');
      setPriority(4);
      setDueDate(null);
    }
  }, [open, initialTask]);

  useEffect(() => {
    if (!open || !input.trim()) return;
    const parsed = parseTaskInput(input);
    if (parsed.priority !== 4) setPriority(parsed.priority);
    if (parsed.due_date) setDueDate(parsed.due_date);
  }, [input, open]);

  const getCleanContent = useCallback((): string => {
    return parseTaskInput(input).content.trim();
  }, [input]);

  const handleSubmit = () => {
    const content = getCleanContent();
    if (!content) return;

    // Close dialog immediately for snappy UX
    handleClose();

    if (initialTask) {
      // Update
      updateMutation.mutate({
        id: initialTask.id,
        content,
        priority,
        due_date: formatDueDate(dueDate) || undefined,
      });
    } else {
      // Create
      createMutation.mutate({
        content,
        priority,
        due_date: formatDueDate(dueDate) || undefined,
        project_id: inboxProject?.id,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') onClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsPickerOpen(false);
    onClose();
  };

  // Priority Menu Handlers
  const handlePriorityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePriorityClose = () => {
    setAnchorEl(null);
  };
  const handlePrioritySelect = (p: Priority) => {
    setPriority(p);
    handlePriorityClose();
  };

  const hasContent = getCleanContent().length > 0;
  const hasAttributes = priority !== 4 || dueDate !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: '28px',
          width: isMobile ? 'calc(100% - 32px)' : '560px',
          maxWidth: isMobile ? '400px' : '560px',
          minHeight: '280px',
          maxHeight: '80vh',
          m: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 56,
          }}
        >
          <IconButton onClick={handleClose} edge="start" sx={{ p: 1.5 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '18px' }}>
            {initialTask ? 'Edit Task' : 'New Task'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!hasContent || isPending}
            sx={{ borderRadius: '20px', px: 3, textTransform: 'none' }}
          >
            {isPending ? 'Saving...' : initialTask ? 'Save' : 'Add'}
          </Button>
        </Box>

        {/* Input Area */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            variant="standard"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '18px', lineHeight: 1.6 },
            }}
            sx={{ mb: 3 }}
          />

          {/* Active Attributes (Deletable) */}
          <AnimatePresence mode="wait">
            {hasAttributes && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
                  {dueDate && (
                    <Chip
                      icon={<CalendarIcon />}
                      label={format(dueDate, 'MMM d, h:mm a')}
                      onDelete={() => setDueDate(null)}
                      sx={{
                        pl: 1.5,
                        bgcolor: 'rgba(208, 188, 255, 0.12)',
                        color: 'primary.main',
                        '& .MuiChip-icon': { color: 'inherit', ml: 0 },
                        '& .MuiChip-deleteIcon': { mr: 1 },
                        height: 32,
                      }}
                    />
                  )}
                  {priority !== 4 && (
                    <Chip
                      icon={<FlagIcon />}
                      label={PRIORITY_CONFIG[priority].label}
                      onDelete={() => setPriority(4)}
                      sx={{
                        pl: 1.5,
                        bgcolor: `${PRIORITY_CONFIG[priority].color}20`,
                        color: PRIORITY_CONFIG[priority].color,
                        '& .MuiChip-icon': { color: 'inherit', ml: 0 },
                        '& .MuiChip-deleteIcon': { mr: 1 },
                        height: 32,
                      }}
                    />
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Shortcuts */}
          <Chip
            label="Today"
            variant="outlined"
            onClick={() => setDueDate(startOfDay(new Date()))}
            sx={{ px: 0.5 }} 
          />
          <Chip
            label="Tomorrow"
            variant="outlined"
            onClick={() => setDueDate(startOfDay(addDays(new Date(), 1)))}
            sx={{ px: 0.5 }}
          />

          {/* Date Picker Trigger */}
          <Chip
            icon={<ScheduleIcon />}
            label="Pick Date"
            variant="outlined"
            onClick={() => setIsPickerOpen(true)}
            sx={{ 
              pl: 1.5,
              '& .MuiChip-icon': { ml: 0 },
            }}
          />
           
           {/* Date Picker (Mobile vs Desktop) */}
           <Box sx={{ display: 'none' }}>
             {isMobile ? (
                <MobileDateTimePicker
                  open={isPickerOpen}
                  onClose={() => setIsPickerOpen(false)}
                  onChange={(newValue) => setDueDate(newValue)}
                  onAccept={(newValue) => {
                    setDueDate(newValue);
                    setIsPickerOpen(false);
                  }}
                  value={dueDate}
                  disablePast
                  slotProps={{
                    dialog: { PaperProps: { sx: { borderRadius: '28px' } } }
                  }}
                />
             ) : (
                <DesktopDateTimePicker
                  open={isPickerOpen}
                  onClose={() => setIsPickerOpen(false)}
                  onChange={(newValue) => setDueDate(newValue)}
                  value={dueDate}
                  disablePast
                  slotProps={{
                    popper: {
                      sx: { '& .MuiPaper-root': { borderRadius: '28px' } }
                    }
                  }}
                />
             )}
          </Box>

          {/* Priority Menu Trigger */}
          <Chip
            icon={<FlagIcon />}
            label={priority !== 4 ? PRIORITY_CONFIG[priority].label : 'Priority'}
            variant={priority !== 4 ? 'filled' : 'outlined'}
            onClick={handlePriorityClick}
            sx={{
              pl: 1.5,
              borderColor: priority !== 4 ? 'transparent' : 'divider',
              bgcolor: priority !== 4 ? `${PRIORITY_CONFIG[priority].color}20` : 'transparent',
              color: priority !== 4 ? PRIORITY_CONFIG[priority].color : 'text.primary',
              '& .MuiChip-icon': {
                color: priority !== 4 ? 'inherit' : 'text.secondary',
                ml: 0,
              },
            }}
          />

          {/* Priority Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handlePriorityClose}
            anchorOrigin={isMobile ? { vertical: 'top', horizontal: 'center' } : { vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={isMobile ? { vertical: 'bottom', horizontal: 'center' } : { vertical: 'top', horizontal: 'left' }}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                mt: isMobile ? -1 : 1,
                mb: isMobile ? 1 : 0,
                minWidth: 160,
              }
            }}
          >
            {[1, 2, 3, 4].map((p) => {
               const pVal = p as Priority;
               if (pVal === 4) return null;
               return (
                <MenuItem key={p} onClick={() => handlePrioritySelect(pVal)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FlagIcon size={20} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={PRIORITY_CONFIG[pVal].label} 
                    primaryTypographyProps={{ 
                      sx: { color: PRIORITY_CONFIG[pVal].color, fontWeight: 500 } 
                    }} 
                  />
                </MenuItem>
               );
            })}
             <MenuItem onClick={() => handlePrioritySelect(4)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box sx={{ width: 18, height: 18, border: '1px solid', borderColor: 'text.secondary', borderRadius: '50%' }} />
                  </ListItemIcon>
                  <ListItemText primary="None" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Dialog>
  );
}
