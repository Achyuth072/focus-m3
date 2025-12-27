'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TaskList from '@/components/tasks/TaskList';
import AddTaskFab from '@/components/tasks/AddTaskFab';
import TaskSheet from '@/components/tasks/TaskSheet';
import { format } from 'date-fns';

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
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
        <div className="px-6 pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            {format(today, 'EEEE, MMMM d')}
          </p>
          <h1 className="text-3xl font-normal mt-1">
            {greeting}
          </h1>
        </div>

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
