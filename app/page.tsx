'use client';

import { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { fadeIn } from '@/theme/motion';
import TaskList from '@/components/tasks/TaskList';
import AddTaskFab from '@/components/tasks/AddTaskFab';
import TaskSheet from '@/components/tasks/TaskSheet';
import { format } from 'date-fns';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleCompleted = () => {
    setShowCompleted(!showCompleted);
    handleMenuClose();
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date();
  const greeting = getGreeting();

  return (
    <>
      <motion.div {...fadeIn}>
        {/* Header */}
        <Box 
          sx={{ 
            px: 3, 
            pt: 'calc(32px + env(safe-area-inset-top))', 
            pb: 2,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {format(today, 'EEEE, MMMM d')}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 400,
                mt: 0.5,
              }}
            >
              {greeting}
            </Typography>
          </Box>
          <Box>
            <IconButton 
              onClick={handleMenuOpen}
              sx={{ 
                color: 'text.secondary',
                bgcolor: anchorEl ? 'action.selected' : 'transparent' 
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { borderRadius: '16px', mt: 1, minWidth: 180 }
              }}
            >
              <MenuItem onClick={toggleCompleted}>
                <ListItemIcon>
                  {showCompleted ? <CheckCircleIcon fontSize="small" color="primary" /> : <CheckCircleOutlineIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>
                  {showCompleted ? 'Hide completed' : 'Show completed'}
                </ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Task List */}
        <TaskList showCompleted={showCompleted} />
      </motion.div>

      {/* FAB */}
      <AddTaskFab onClick={() => setIsAddTaskOpen(true)} />

      {/* Task Sheet (Create Mode) */}
      <TaskSheet
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
