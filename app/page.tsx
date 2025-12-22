'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
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
        <Box sx={{ px: 3, pt: 4, pb: 2 }}>
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

        {/* Task List */}
        <TaskList />
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
