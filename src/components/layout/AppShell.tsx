'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CompletedTasksProvider } from '@/components/CompletedTasksProvider';
import { TaskActionsProvider, useTaskActions } from '@/components/TaskActionsProvider';
import { useRealtimeSync } from '@/lib/hooks/useRealtimeSync';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import AddTaskFab from '@/components/tasks/AddTaskFab';
import TaskSheet from '@/components/tasks/TaskSheet';
import { CommandMenu } from '@/components/command-menu';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const isFocus = pathname === '/focus';
  const hideMobileNav = pathname === '/focus' || pathname === '/settings';
  const isTasksPage = pathname === '/';
  const { isAddTaskOpen, openAddTask, closeAddTask } = useTaskActions();

  // Global realtime sync - stays alive during navigation
  useRealtimeSync();

  return (
    <CompletedTasksProvider>
      <SidebarProvider defaultOpen={true}>
        {/* Mobile Top Bar - hidden on Focus and Settings pages */}
        {!hideMobileNav && <MobileHeader />}

        {/* Desktop Sidebar - hidden only on Focus page */}
        {!isFocus && <AppSidebar />}
        
        {/* Main Content with proper inset */}
        <SidebarInset>
          <div className="flex-1 pt-16 pb-20 md:pt-0 md:pb-0 overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </SidebarInset>

        {/* Mobile Bottom Nav - hidden on Focus and Settings pages */}
        {!hideMobileNav && <MobileNav />}

        {/* FAB - Only on Tasks page, rendered outside template animation */}
        {isTasksPage && <AddTaskFab onClick={openAddTask} />}

        {/* Global Task Sheet */}
        <TaskSheet
          open={isAddTaskOpen}
          onClose={closeAddTask}
        />
        
        {/* Global Command Menu */}
        <CommandMenu />
      </SidebarProvider>
    </CompletedTasksProvider>
  );
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();

  return (
    <TaskActionsProvider>
      {(loading || !user) ? (
        <>{children}</>
      ) : (
        <AppShellContent>{children}</AppShellContent>
      )}
    </TaskActionsProvider>
  );
}
