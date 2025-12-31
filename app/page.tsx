'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import TaskList from '@/components/tasks/TaskList';
import { format } from 'date-fns';
import { TasksPageHeader } from '@/components/tasks/TasksPageHeader';
import { useUiStore } from '@/lib/store/uiStore';
import { useTaskActions } from '@/components/TaskActionsProvider';

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortBy, groupBy, setSortBy, setGroupBy } = useUiStore();
  const { openAddTask } = useTaskActions();

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
    <motion.div {...fadeIn}>
      {/* Header */}
      <div className="px-6 pt-4 pb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {format(today, 'EEEE, MMMM d')}
          </p>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight mt-1 text-primary">
            {greeting}
          </h1>
        </div>
        
        {/* Completed Tasks Button - Desktop Only */}
        <TasksPageHeader 
          currentSort={sortBy}
          currentGroup={groupBy}
          onSortChange={setSortBy}
          onGroupChange={setGroupBy}
          onNewTask={openAddTask}
        />
      </div>

      {/* Task List */}
      <TaskList sortBy={sortBy} groupBy={groupBy} projectId={currentProjectId} />
    </motion.div>
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
