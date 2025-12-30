'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CompletedTasksProvider } from '@/components/CompletedTasksProvider';
import { useRealtimeSync } from '@/lib/hooks/useRealtimeSync';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { MobileHeader } from '@/components/layout/MobileHeader';
import AddTaskFab from '@/components/tasks/AddTaskFab';
import TaskSheet from '@/components/tasks/TaskSheet';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isFocus = pathname === '/focus';
  const hideMobileNav = pathname === '/focus' || pathname === '/settings';
  const isTasksPage = pathname === '/';
  const { user, loading } = useAuth();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Global realtime sync - stays alive during navigation
  useRealtimeSync();

  // Don't render shell for unauthenticated users
  if (loading || !user) {
    return <>{children}</>;
  }

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
        {isTasksPage && <AddTaskFab onClick={() => setIsAddTaskOpen(true)} />}

        {/* Task Sheet - Only on Tasks page */}
        {isTasksPage && (
          <TaskSheet
            open={isAddTaskOpen}
            onClose={() => setIsAddTaskOpen(false)}
          />
        )}
      </SidebarProvider>
    </CompletedTasksProvider>
  );
}
