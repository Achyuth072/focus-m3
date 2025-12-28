'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import TaskList from '@/components/tasks/TaskList';
import AddTaskFab from '@/components/tasks/AddTaskFab';
import TaskSheet from '@/components/tasks/TaskSheet';
import { format } from 'date-fns';
import { TasksPageHeader } from '@/components/tasks/TasksPageHeader';
import { GroupOption, SortOption } from '@/lib/types/sorting';

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');

  const currentProjectId = searchParams.get('project') || 'all';

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
        <div className="px-6 pt-4 pb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(today, 'EEEE, MMMM d')}
            </p>
            <h1 className="text-3xl font-normal mt-1">
              {greeting}
            </h1>
          </div>
          
          {/* Completed Tasks Button - Desktop Only */}
          <TasksPageHeader 
            currentSort={sortBy}
            currentGroup={groupBy}
            onSortChange={setSortBy}
            onGroupChange={setGroupBy}
          />
        </div>

        {/* Task List */}
        <TaskList sortBy={sortBy} groupBy={groupBy} projectId={currentProjectId} />
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
