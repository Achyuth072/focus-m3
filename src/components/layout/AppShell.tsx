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
import { AnimatePresence, motion } from 'framer-motion';

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
  const { isGuestMode } = useAuth();

  // Banner dismiss state (session-based)
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('guest_banner_dismissed') !== 'true';
  });

  const dismissBanner = () => {
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('guest_banner_dismissed', 'true');
    }
  };

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
            !hideMobileNav && "pt-16"
          )}>
            {children}
            {!hideMobileNav && pathname !== '/calendar' && <div className="h-32 w-full flex-none" aria-hidden="true" />}
          </div>
        </SidebarInset>

        {/* Floating Guest Mode Banner - overlays content, no layout shift */}
        <AnimatePresence>
          {isGuestMode && showBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                "fixed left-0 right-0 z-40 flex justify-center pointer-events-none",
                !hideMobileNav ? "top-[68px]" : "top-2",
                "md:top-2 md:left-auto md:right-4"
              )}
            >
              <div className="pointer-events-auto bg-blue-500/95 dark:bg-blue-600/95 text-white text-xs font-medium py-1.5 px-4 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2">
                <span>Guest Mode • Browser data only</span>
                <button
                  onClick={dismissBanner}
                  className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Dismiss banner"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <TaskActionsProvider>
      {(loading || !user || isLoginPage) ? (
        <>{children}</>
      ) : (
        <AppShellContent>{children}</AppShellContent>
      )}
    </TaskActionsProvider>
  );
}
