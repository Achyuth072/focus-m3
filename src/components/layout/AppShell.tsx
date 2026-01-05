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
import { GlobalHotkeys } from '@/components/layout/GlobalHotkeys';
import { ShortcutsHelp } from '@/components/ui/ShortcutsHelp';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const isFocus = pathname === '/focus';
  const hideMobileNav = pathname === '/focus' || pathname === '/settings';
  const isTasksPage = pathname === '/';
  const { isAddTaskOpen, openAddTask, closeAddTask } = useTaskActions();
  
  const [commandOpen, setCommandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Global realtime sync - stays alive during navigation
  useRealtimeSync();

  return (
    <CompletedTasksProvider>
      <SidebarProvider defaultOpen={true}>
        <GlobalHotkeys 
          setCommandOpen={setCommandOpen}
          setHelpOpen={setHelpOpen}
        />
        {/* Mobile Top Bar - hidden on Focus and Settings pages */}
        {!hideMobileNav && <MobileHeader />}

        {/* Desktop Sidebar - hidden only on Focus page */}
        {!isFocus && <AppSidebar />}
        
        {/* Main Content with proper inset */}
        <SidebarInset>
          <div className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide md:pt-0 md:pb-0",
            !hideMobileNav && "pt-16 pb-[calc(64px+env(safe-area-inset-bottom))]"
          )}>
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
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
        <ShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
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
