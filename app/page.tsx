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
import { PlusIcon } from 'lucide-react';

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
  const filter = searchParams.get('filter') || undefined;

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
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {format(today, 'EEEE, MMMM d')}
            {filter && (
              <span className="flex items-center gap-1.5 before:content-['•'] before:text-muted-foreground/40">
                <span className="capitalize text-primary font-medium">
                  {filter === 'p1' ? 'High Priority' : filter}
                </span>
                <button 
                  onClick={() => router.push('/')}
                  className="hover:bg-accent/60 p-0.5 rounded-full transition-colors"
                  title="Clear filter"
                >
                  <PlusIcon className="h-3.5 w-3.5 rotate-45" />
                </button>
              </span>
            )}
          </p>
          <h1 className="type-h1 mt-1 text-primary">
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
      {/* Task List */}
      <TaskList 
        sortBy={sortBy} 
        groupBy={groupBy} 
        projectId={currentProjectId} 
        filter={filter}
      />
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
