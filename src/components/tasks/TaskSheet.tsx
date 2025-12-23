'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Tabs,
  Tab,
  Divider,
  Checkbox,
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseTaskInput, formatDueDate } from '@/lib/utils/nlpParser';
import { useCreateTask, useUpdateTask } from '@/lib/hooks/useTaskMutations';
import { useInboxProject } from '@/lib/hooks/useTasks';
import SubtaskList from '@/components/tasks/SubtaskList';
import type { Task, ParsedTask } from '@/lib/types/task';
import { format, addDays, startOfDay } from 'date-fns';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

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
  const [description, setDescription] = useState('');
  const [descriptionMode, setDescriptionMode] = useState<'edit' | 'preview'>('edit');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerAnchorRef = useRef<HTMLDivElement | null>(null);
  const [draftSubtasks, setDraftSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { data: inboxProject } = useInboxProject();

  // Initialize from initialTask (Edit Mode)
  useEffect(() => {
    if (open && initialTask) {
      setInput(initialTask.content);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority as Priority);
      setDueDate(initialTask.due_date ? new Date(initialTask.due_date) : null);
    } else if (open && !initialTask) {
      // Reset for Create Mode
      setInput('');
      setDescription('');
      setPriority(4);
      setDueDate(null);
      setDescriptionMode('edit');
      setDraftSubtasks([]);
      setNewSubtaskInput('');
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
        description: description || undefined,
        priority,
        due_date: formatDueDate(dueDate) || undefined,
      });
    } else {
      // Create main task, then subtasks
      createMutation.mutate({
        content,
        description: description || undefined,
        priority,
        due_date: formatDueDate(dueDate) || undefined,
        project_id: inboxProject?.id,
      }, {
        onSuccess: (newTask) => {
          // Create draft subtasks after main task is created
          if (draftSubtasks.length > 0 && newTask?.id) {
            draftSubtasks.forEach((subtaskContent) => {
              createMutation.mutate({
                content: subtaskContent,
                parent_id: newTask.id,
                project_id: inboxProject?.id,
                priority: 4,
              });
            });
          }
        }
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
          borderRadius: { xs: '28px', md: '16px' },
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
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 64,
          }}
        >
          <IconButton onClick={handleClose} edge="start" sx={{ p: 1.5 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {initialTask ? 'Edit Task' : 'New Task'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!hasContent || isPending}
            sx={{ 
              borderRadius: '28px', 
              px: 3, 
              py: 1, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none'
            }}
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
              sx: { 
                fontSize: '1.5rem', 
                fontWeight: 600,
                lineHeight: 1.2,
                '&::placeholder': { opacity: 0.5 }
              },
            }}
            sx={{ mb: 2 }}
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
                      icon={<CalendarMonthRoundedIcon />}
                      label={format(dueDate, 'MMM d, h:mm a')}
                      onDelete={() => setDueDate(null)}
                      sx={{
                        pl: 1,
                        bgcolor: 'rgba(208, 188, 255, 0.12)',
                        color: 'primary.main',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'inherit', ml: 0.5, fontSize: '1rem' },
                        '& .MuiChip-deleteIcon': { mr: 0.5 },
                        height: 32,
                        borderRadius: '28px',
                      }}
                    />
                  )}
                  {priority !== 4 && (
                    <Chip
                      icon={<FlagRoundedIcon />}
                      label={PRIORITY_CONFIG[priority].label}
                      onDelete={() => setPriority(4)}
                      sx={{
                        pl: 1,
                        bgcolor: `${PRIORITY_CONFIG[priority].color}20`,
                        color: PRIORITY_CONFIG[priority].color,
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'inherit', ml: 0.5, fontSize: '1rem' },
                        '& .MuiChip-deleteIcon': { mr: 0.5 },
                        height: 32,
                        borderRadius: '28px',
                      }}
                    />
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description (Notes) Section */}
          <Divider sx={{ my: 2 }} />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Notes
              </Typography>
              <Tabs
                value={descriptionMode}
                onChange={(_, v) => setDescriptionMode(v)}
                sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, px: 1.5, fontSize: '0.75rem' } }}
              >
                <Tab label="Edit" value="edit" />
                <Tab label="Preview" value="preview" />
              </Tabs>
            </Box>
            {descriptionMode === 'edit' ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={8}
                variant="outlined"
                placeholder="Add notes (Markdown supported)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '16px', fontSize: '0.875rem' },
                }}
              />
            ) : (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: 80,
                  fontSize: '0.875rem',
                  '& h1, & h2, & h3': { mt: 0 },
                  '& p': { my: 0.5 },
                  '& ul, & ol': { my: 0.5, pl: 2 },
                }}
              >
                {description ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No notes yet.
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Subtasks Section */}
          <Divider sx={{ my: 2 }} />
          {initialTask ? (
            <SubtaskList parentTask={initialTask} />
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                Subtasks
              </Typography>
              {/* Draft subtasks list */}
              {draftSubtasks.map((subtask, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Checkbox size="small" disabled sx={{ p: 0.5 }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>{subtask}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setDraftSubtasks(prev => prev.filter((_, i) => i !== index))}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Box>
              ))}
              {/* Add subtask input */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder="Add subtask..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSubtaskInput.trim()) {
                      e.preventDefault();
                      e.stopPropagation();
                      setDraftSubtasks(prev => [...prev, newSubtaskInput.trim()]);
                      setNewSubtaskInput('');
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <IconButton
                  onClick={() => {
                    if (newSubtaskInput.trim()) {
                      setDraftSubtasks(prev => [...prev, newSubtaskInput.trim()]);
                      setNewSubtaskInput('');
                    }
                  }}
                  disabled={!newSubtaskInput.trim()}
                  size="small"
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    borderRadius: '12px',
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'action.disabledBackground' }
                  }}
                >
                  <AddRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          )}
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
            ref={pickerAnchorRef}
            icon={<ScheduleRoundedIcon />}
            label="Pick Date"
            variant="outlined"
            onClick={() => setIsPickerOpen(true)}
            sx={{ 
              pl: 1,
              borderRadius: '28px',
              fontWeight: 500,
              '& .MuiChip-icon': { ml: 0.5, fontSize: '1rem' },
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
                      anchorEl: pickerAnchorRef.current,
                      placement: 'bottom-start',
                      sx: { 
                        '& .MuiPaper-root': { 
                          borderRadius: '28px',
                          mt: 1,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        } 
                      }
                    }
                  }}
                />
             )}
          </Box>

          {/* Priority Menu Trigger */}
          <Chip
            icon={<FlagRoundedIcon />}
            label={priority !== 4 ? PRIORITY_CONFIG[priority].label : 'Priority'}
            variant={priority !== 4 ? 'filled' : 'outlined'}
            onClick={handlePriorityClick}
            sx={{
              pl: 1,
              borderRadius: '28px',
              fontWeight: 500,
              borderColor: priority !== 4 ? 'transparent' : 'divider',
              bgcolor: priority !== 4 ? `${PRIORITY_CONFIG[priority].color}20` : 'transparent',
              color: priority !== 4 ? PRIORITY_CONFIG[priority].color : 'text.primary',
              '& .MuiChip-icon': {
                color: priority !== 4 ? 'inherit' : 'text.secondary',
                ml: 0.5,
                fontSize: '1rem',
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
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FlagRoundedIcon sx={{ color: PRIORITY_CONFIG[pVal].color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={PRIORITY_CONFIG[pVal].label} 
                    primaryTypographyProps={{ 
                      sx: { fontWeight: 600 } 
                    }} 
                  />
                </MenuItem>
               );
            })}
             <MenuItem onClick={() => handlePrioritySelect(4)} sx={{ borderRadius: '28px', mx: 0.5, py: 1.2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{ width: 22, height: 22, border: '2px solid', borderColor: 'text.secondary', borderRadius: '50%', opacity: 0.3 }} />
                  </ListItemIcon>
                  <ListItemText primary="None" primaryTypographyProps={{ fontWeight: 600 }} />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Dialog>
  );
}
